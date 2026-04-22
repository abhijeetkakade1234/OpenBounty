import { artifacts, ethers, upgrades } from "hardhat";
import { writeDeploymentEnvFiles } from "./utils/env-target";
import {
  getDeploymentMetadataPath,
  writeDeploymentMetadata,
} from "./utils/write-deployment";

async function main() {
  const [deployer] = await ethers.getSigners();
  const OpenBounty = await ethers.getContractFactory("OpenBounty");
  const proxy = await upgrades.deployProxy(OpenBounty, [deployer.address], {
    initializer: "initialize",
    kind: "uups",
  });
  await proxy.deployed();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxy.address
  );
  const network = await ethers.provider.getNetwork();
  const artifact = await artifacts.readArtifact("OpenBounty");

  const outputPath = await writeDeploymentMetadata({
    address: proxy.address,
    implementationAddress,
    chainId: Number(network.chainId),
    abi: artifact.abi,
  });
  const envOutput = await writeDeploymentEnvFiles({
    address: proxy.address,
    chainId: Number(network.chainId),
    networkName: network.name,
  });

  console.log(`OpenBounty proxy deployed to ${proxy.address}`);
  console.log(`OpenBounty implementation deployed to ${implementationAddress}`);
  console.log(
    `Contract metadata written to ${outputPath || getDeploymentMetadataPath()}`
  );
  console.log(`Environment written to ${envOutput.rootEnvPath}`);
  console.log(`Web environment written to ${envOutput.webEnvPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
