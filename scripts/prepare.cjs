const { existsSync } = require("node:fs");
const { join } = require("node:path");
const { spawnSync } = require("node:child_process");

const huskyBin = join(
  __dirname,
  "..",
  "node_modules",
  ".bin",
  process.platform === "win32" ? "husky.cmd" : "husky"
);

if (!existsSync(huskyBin)) {
  console.log("Skipping Husky install because the binary is not available.");
  process.exit(0);
}

const result = spawnSync(huskyBin, {
  cwd: join(__dirname, ".."),
  stdio: "inherit",
  shell: process.platform === "win32",
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
