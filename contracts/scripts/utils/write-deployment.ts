import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

type DeploymentMetadata = {
  address: string;
  implementationAddress?: string;
  chainId: number;
  abi: unknown[];
};

export function getDeploymentMetadataPath() {
  return path.resolve(
    __dirname,
    "../../../apps/web/src/lib/contracts/generated/openbounty.json"
  );
}

export async function getDeploymentMetadata(): Promise<DeploymentMetadata> {
  const file = await readFile(getDeploymentMetadataPath(), "utf8");
  return JSON.parse(file) as DeploymentMetadata;
}

export async function writeDeploymentMetadata(metadata: DeploymentMetadata) {
  const outputPath = getDeploymentMetadataPath();
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(metadata, null, 2)}\n`, "utf8");
  return outputPath;
}
