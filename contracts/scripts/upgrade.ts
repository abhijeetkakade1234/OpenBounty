import { artifacts, ethers, upgrades } from "hardhat";
import { writeDeploymentEnvFiles } from "./utils/env-target";
import {
  getDeploymentMetadata,
  getDeploymentMetadataPath,
  writeDeploymentMetadata,
} from "./utils/write-deployment";

async function main() {
  const deployment = await getDeploymentMetadata();
  const proxyAddress =
    process.env.OPENBOUNTY_PROXY_ADDRESS ?? deployment.address;

  if (!proxyAddress) {
    throw new Error(
      `Missing proxy address. Set OPENBOUNTY_PROXY_ADDRESS or populate ${getDeploymentMetadataPath()}.`
    );
  }

  const OpenBounty = await ethers.getContractFactory("OpenBounty");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, OpenBounty, {
    kind: "uups",
  });
  await upgraded.deployed();

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    upgraded.address
  );
  const network = await ethers.provider.getNetwork();
  const artifact = await artifacts.readArtifact("OpenBounty");

  const outputPath = await writeDeploymentMetadata({
    address: upgraded.address,
    implementationAddress,
    chainId: Number(network.chainId),
    abi: artifact.abi,
  });
  const envOutput = await writeDeploymentEnvFiles({
    address: upgraded.address,
    chainId: Number(network.chainId),
    networkName: network.name,
  });

  console.log(`OpenBounty proxy upgraded at ${upgraded.address}`);
  console.log(`Current implementation: ${implementationAddress}`);
  console.log(`Contract metadata written to ${outputPath}`);
  console.log(`Environment written to ${envOutput.rootEnvPath}`);
  console.log(`Web environment written to ${envOutput.webEnvPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
