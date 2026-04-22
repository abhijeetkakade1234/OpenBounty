const { spawn } = require("child_process");
const http = require("http");

const DEFAULT_RECIPIENTS = [
  "0x8e133dF53EaC0211B9b57dCB4CF616bACB0a59f9",
  "0x4B8a85C6DaF42ceaeFf6EF76B5A6867EfD4017B0",
];

const npmCommand = process.platform === "win32" ? "npm.cmd" : "npm";
const localRpcUrl = process.env.LOCAL_RPC_URL ?? "http://127.0.0.1:8545";
const fundRecipients = (
  process.env.LOCAL_FUND_RECIPIENTS ?? DEFAULT_RECIPIENTS.join(",")
)
  .split(",")
  .map((value) => value.trim())
  .filter(Boolean);

let contractsProcess = null;
let webProcess = null;
let shuttingDown = false;

function spawnLongRunning(label, args) {
  const child = spawn(npmCommand, args, {
    cwd: process.cwd(),
    stdio: "inherit",
    shell: false,
  });

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    console.error(
      `${label} exited unexpectedly with code ${code ?? "null"}${signal ? ` signal ${signal}` : ""}.`
    );
    shutdown(code ?? 1);
  });

  return child;
}

function runOnce(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(npmCommand, args, {
      cwd: process.cwd(),
      stdio: "inherit",
      shell: false,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(
        new Error(
          `Command failed: ${[npmCommand, ...args].join(" ")} (exit ${code})`
        )
      );
    });

    child.on("error", reject);
  });
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function pingRpc() {
  return new Promise((resolve) => {
    const request = http.request(
      localRpcUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      },
      (response) => {
        response.resume();
        resolve(response.statusCode === 200);
      }
    );

    request.on("error", () => resolve(false));
    request.write(
      JSON.stringify({
        jsonrpc: "2.0",
        method: "eth_chainId",
        params: [],
        id: 1,
      })
    );
    request.end();
  });
}

async function waitForRpcReady(timeoutMs = 30000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    // eslint-disable-next-line no-await-in-loop
    if (await pingRpc()) {
      return;
    }

    // eslint-disable-next-line no-await-in-loop
    await wait(1000);
  }

  throw new Error(
    `Local RPC at ${localRpcUrl} did not become ready within ${timeoutMs}ms.`
  );
}

function terminateProcess(child) {
  if (!child || child.killed) {
    return;
  }

  if (process.platform === "win32") {
    spawn("taskkill", ["/pid", String(child.pid), "/t", "/f"], {
      stdio: "ignore",
      shell: false,
    });
    return;
  }

  child.kill("SIGTERM");
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  terminateProcess(webProcess);
  terminateProcess(contractsProcess);
  setTimeout(() => process.exit(exitCode), 250);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

async function main() {
  console.log("Starting local contracts node...");
  contractsProcess = spawnLongRunning("contracts", ["run", "dev:contracts"]);

  console.log("Waiting for local RPC...");
  await waitForRpcReady();

  console.log("Deploying contracts locally...");
  await runOnce(["run", "deploy:local"]);

  console.log(`Funding local wallets: ${fundRecipients.join(", ")}`);
  await runOnce(["run", "fund:local", "--", ...fundRecipients]);

  console.log("Starting frontend...");
  webProcess = spawnLongRunning("web", ["run", "dev:web"]);
}

main().catch((error) => {
  console.error(error);
  shutdown(1);
});
