import { expect } from "chai";
import { ethers, upgrades } from "hardhat";

describe("OpenBounty", function () {
  const MAX_REPOSITORY_URL_LENGTH = 200;
  const MAX_DESCRIPTION_LENGTH = 500;
  const MAX_PR_LINK_LENGTH = 200;

  async function expectCustomError(
    promise: Promise<unknown>,
    errorName: string
  ) {
    try {
      await promise;
      expect.fail(`Expected custom error ${errorName}`);
    } catch (error) {
      expect(String(error)).to.include(errorName);
    }
  }

  async function deployFixture() {
    const [creator, contributor, other] = await ethers.getSigners();
    const OpenBounty = await ethers.getContractFactory("OpenBounty");
    const contract = await upgrades.deployProxy(OpenBounty, [creator.address], {
      initializer: "initialize",
      kind: "uups",
    });
    await contract.deployed();

    return { contract, creator, contributor, other };
  }

  async function createSampleBounty(
    contract: any,
    creator: any,
    deadlineOffset = 3600
  ) {
    const latestBlock = await ethers.provider.getBlock("latest");
    const deadline = latestBlock.timestamp + deadlineOffset;

    const tx = await contract
      .connect(creator)
      .createBounty(
        "https://github.com/example/repo",
        "Fix flaky integration tests",
        deadline,
        {
          value: ethers.utils.parseEther("1"),
        }
      );

    await tx.wait();
    return deadline;
  }

  it("creates a bounty with a valid deposit", async function () {
    const { contract, creator } = await deployFixture();
    const deadline = await createSampleBounty(contract, creator);

    const bounty = await contract.getBounty(1);
    expect(bounty.creator).to.equal(creator.address);
    expect(bounty.deadline).to.equal(deadline);
    expect(bounty.reward).to.equal(ethers.utils.parseEther("1"));
    expect(bounty.isOpen).to.equal(true);
  });

  it("rejects a zero-value bounty", async function () {
    const { contract, creator } = await deployFixture();

    await expectCustomError(
      contract
        .connect(creator)
        .createBounty(
          "https://github.com/example/repo",
          "Fix flaky integration tests",
          0,
          {
            value: 0,
          }
        ),
      "RewardMustBeGreaterThanZero"
    );
  });

  it("allows multiple submissions while open", async function () {
    const { contract, creator, contributor, other } = await deployFixture();
    await createSampleBounty(contract, creator);

    await contract
      .connect(contributor)
      .submitWork(1, "https://github.com/example/repo/pull/1");
    await contract
      .connect(other)
      .submitWork(1, "https://github.com/example/repo/pull/2");

    const count = await contract.getSubmissionCount(1);
    expect(count).to.equal(2);
  });

  it("blocks creators from submitting to their own bounty", async function () {
    const { contract, creator } = await deployFixture();
    await createSampleBounty(contract, creator);

    await expectCustomError(
      contract
        .connect(creator)
        .submitWork(1, "https://github.com/example/repo/pull/1"),
      "CreatorCannotSubmitToOwnBounty"
    );
  });

  it("rejects oversized repository urls", async function () {
    const { contract, creator } = await deployFixture();
    const oversizedRepoUrl = `https://github.com/${"a".repeat(MAX_REPOSITORY_URL_LENGTH + 1)}`;

    await expectCustomError(
      contract
        .connect(creator)
        .createBounty(oversizedRepoUrl, "Fix flaky integration tests", 0, {
          value: ethers.utils.parseEther("1"),
        }),
      "RepositoryUrlTooLong"
    );
  });

  it("rejects oversized descriptions", async function () {
    const { contract, creator } = await deployFixture();
    const oversizedDescription = "a".repeat(MAX_DESCRIPTION_LENGTH + 1);

    await expectCustomError(
      contract
        .connect(creator)
        .createBounty(
          "https://github.com/example/repo",
          oversizedDescription,
          0,
          {
            value: ethers.utils.parseEther("1"),
          }
        ),
      "DescriptionTooLong"
    );
  });

  it("rejects oversized pull request links", async function () {
    const { contract, creator, contributor } = await deployFixture();
    await createSampleBounty(contract, creator);
    const oversizedPrLink = `https://github.com/example/repo/pull/${"1".repeat(MAX_PR_LINK_LENGTH + 1)}`;

    await expectCustomError(
      contract.connect(contributor).submitWork(1, oversizedPrLink),
      "PrLinkTooLong"
    );
  });

  it("rejects submissions after completion", async function () {
    const { contract, creator, contributor, other } = await deployFixture();
    await createSampleBounty(contract, creator);
    await contract
      .connect(contributor)
      .submitWork(1, "https://github.com/example/repo/pull/1");
    await contract.connect(creator).approveSubmission(1, 0);

    await expectCustomError(
      contract
        .connect(other)
        .submitWork(1, "https://github.com/example/repo/pull/2"),
      "BountyNotOpen"
    );
  });

  it("lets the creator approve one valid submission and transfer funds", async function () {
    const { contract, creator, contributor } = await deployFixture();
    await createSampleBounty(contract, creator);
    await contract
      .connect(contributor)
      .submitWork(1, "https://github.com/example/repo/pull/1");

    const before = await ethers.provider.getBalance(contributor.address);
    const tx = await contract.connect(creator).approveSubmission(1, 0);
    await tx.wait();
    const after = await ethers.provider.getBalance(contributor.address);

    expect(after.sub(before)).to.equal(ethers.utils.parseEther("1"));
    const bounty = await contract.getBounty(1);
    expect(bounty.isCompleted).to.equal(true);
    expect(bounty.winner).to.equal(contributor.address);
    expect(bounty.reward).to.equal(0);
  });

  it("prevents non-creators from approving", async function () {
    const { contract, creator, contributor } = await deployFixture();
    await createSampleBounty(contract, creator);
    await contract
      .connect(contributor)
      .submitWork(1, "https://github.com/example/repo/pull/1");

    await expectCustomError(
      contract.connect(contributor).approveSubmission(1, 0),
      "OnlyCreator"
    );
  });

  it("rejects invalid submission indexes", async function () {
    const { contract, creator } = await deployFixture();
    await createSampleBounty(contract, creator);

    await expectCustomError(
      contract.connect(creator).approveSubmission(1, 0),
      "InvalidSubmissionIndex"
    );
  });

  it("refunds only after deadline when not completed", async function () {
    const { contract, creator } = await deployFixture();
    const deadline = await createSampleBounty(contract, creator, 10);
    await ethers.provider.send("evm_setNextBlockTimestamp", [deadline + 1]);
    await ethers.provider.send("evm_mine", []);

    const before = await ethers.provider.getBalance(creator.address);
    const tx = await contract.connect(creator).refund(1);
    const receipt = await tx.wait();
    const gasCost = receipt.gasUsed.mul(receipt.effectiveGasPrice);
    const after = await ethers.provider.getBalance(creator.address);

    expect(after.add(gasCost).sub(before)).to.equal(
      ethers.utils.parseEther("1")
    );
    const bounty = await contract.getBounty(1);
    expect(bounty.isOpen).to.equal(false);
    expect(bounty.isCompleted).to.equal(false);
    expect(bounty.reward).to.equal(0);
  });

  it("blocks refunds before deadline", async function () {
    const { contract, creator } = await deployFixture();
    await createSampleBounty(contract, creator, 1000);

    await expectCustomError(
      contract.connect(creator).refund(1),
      "DeadlineNotReached"
    );
  });

  it("blocks refunds after approval", async function () {
    const { contract, creator, contributor } = await deployFixture();
    await createSampleBounty(contract, creator, 1000);
    await contract
      .connect(contributor)
      .submitWork(1, "https://github.com/example/repo/pull/1");
    await contract.connect(creator).approveSubmission(1, 0);

    await expectCustomError(
      contract.connect(creator).refund(1),
      "BountyNotOpen"
    );
  });

  it("supports paginated bounty reads", async function () {
    const { contract, creator } = await deployFixture();

    for (let index = 0; index < 3; index++) {
      await createSampleBounty(contract, creator, 1000 + index);
    }

    const [page, nextCursor, hasMore] = await contract.getBountiesPaginated(
      0,
      2
    );
    expect(page).to.have.length(2);
    expect(page[0].id).to.equal(1);
    expect(nextCursor).to.equal(2);
    expect(hasMore).to.equal(true);
  });

  it("supports paginated submission reads", async function () {
    const { contract, creator, contributor, other } = await deployFixture();
    await createSampleBounty(contract, creator, 1000);
    await contract
      .connect(contributor)
      .submitWork(1, "https://github.com/example/repo/pull/1");
    await contract
      .connect(other)
      .submitWork(1, "https://github.com/example/repo/pull/2");

    const [page, nextCursor, hasMore] = await contract.getSubmissionsPaginated(
      1,
      0,
      1
    );
    expect(page).to.have.length(1);
    expect(page[0].submitter).to.equal(contributor.address);
    expect(nextCursor).to.equal(1);
    expect(hasMore).to.equal(true);
  });
});
