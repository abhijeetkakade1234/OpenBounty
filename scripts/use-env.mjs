import { copyFile, access } from "fs/promises";
import path from "path";

const target = process.argv[2];

if (!target) {
  console.error("Usage: node scripts/use-env.mjs <local|fuji|mainnet>");
  process.exit(1);
}

const root = process.cwd();
const rootSource = path.join(root, `.env.${target}`);
const rootDest = path.join(root, ".env");
const webSource = path.join(root, "apps", "web", `.env.${target}`);
const webDest = path.join(root, "apps", "web", ".env.local");

try {
  await access(rootSource);
  await access(webSource);
  await copyFile(rootSource, rootDest);
  await copyFile(webSource, webDest);
  console.log(`Activated ${target} environment.`);
  console.log(`Root env: ${rootSource} -> ${rootDest}`);
  console.log(`Web env: ${webSource} -> ${webDest}`);
} catch (error) {
  console.error(`Unable to activate ${target} environment.`);
  console.error(
    "Create the target env files first or run a deployment so they can be generated automatically."
  );
  console.error(error);
  process.exit(1);
}
