const { ethers } = require("ethers");

const DEFAULT_LOCAL_RPC_URL = "http://127.0.0.1:8545";
const DEFAULT_FUNDER_PRIVATE_KEY =
  "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";

async function main() {
  const recipients = process.argv.slice(2);
  const amountArg = process.env.LOCAL_FUND_AMOUNT ?? "100";
  const rpcUrl = process.env.LOCAL_RPC_URL ?? DEFAULT_LOCAL_RPC_URL;
  const privateKey =
    process.env.LOCAL_FUNDER_PRIVATE_KEY ?? DEFAULT_FUNDER_PRIVATE_KEY;

  if (!recipients.length) {
    throw new Error(
      "Provide one or more recipient addresses. Example: npm run fund:local -- 0xabc... 0xdef..."
    );
  }

  const provider = new ethers.providers.JsonRpcProvider(rpcUrl);
  const wallet = new ethers.Wallet(privateKey, provider);
  const amount = ethers.utils.parseEther(amountArg);

  for (const recipient of recipients) {
    if (!ethers.utils.isAddress(recipient)) {
      throw new Error(`Invalid address: ${recipient}`);
    }

    const transaction = await wallet.sendTransaction({
      to: recipient,
      value: amount,
    });

    await transaction.wait();

    const balance = await provider.getBalance(recipient);
    console.log(
      `Funded ${recipient} with ${ethers.utils.formatEther(amount)}. Balance: ${ethers.utils.formatEther(balance)}`
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
