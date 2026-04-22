# OpenBounty

Production-oriented decentralized bounty platform for open-source issue bounties with local, Fuji, and mainnet deployment targets.

## Structure

- `apps/web`: Next.js App Router frontend using RainbowKit/wagmi for wallet UX and ethers.js for contract interaction
- `contracts`: Hardhat workspace with the upgradeable `OpenBounty` Solidity contract, tests, and proxy deployment scripts
- `design`: reference-only UI mocks and design system inputs

## Commands

- `npm run dev`: start the frontend and Hardhat node together
- `npm run dev:local`: start the local node, deploy locally, fund the default wallets, and launch the frontend
- `npm run dev:web`: start only the frontend
- `npm run dev:contracts`: start only the Hardhat node
- `npm run build`: production build for the frontend
- `npm run lint`: lint the frontend and compile-check contracts
- `npm run test:contracts`: run Solidity contract tests
- `npm run ci:check`: run the same checks used by CI/pre-push
- `npm run compile -w contracts`: compile contracts
- `npm run deploy:local -w contracts`: deploy the UUPS proxy to a local Hardhat node and write `.env.local`
- `npm run deploy:fuji -w contracts`: deploy the UUPS proxy to Avalanche Fuji and write ABI/address metadata into the web app
- `npm run deploy:mainnet -w contracts`: deploy the UUPS proxy to Avalanche mainnet and write `.env.mainnet`
- `npm run env:use:local`: activate `.env.local` and `apps/web/.env.local`
- `npm run env:use:fuji`: activate `.env.fuji` and `apps/web/.env.fuji`
- `npm run env:use:mainnet`: activate `.env.mainnet` and `apps/web/.env.mainnet`
- `npm run upgrade:fuji -w contracts`: upgrade an existing proxy deployment

## Environment

Copy `.env.example` into the target env file you want to use, then fill in:

- `.env.local` for localhost / Hardhat node
- `.env.fuji` for Fuji
- `.env.mainnet` for Avalanche mainnet
- `FUJI_RPC_URL`
- `LOCAL_RPC_URL`
- `MAINNET_RPC_URL`
- `DEPLOYER_PRIVATE_KEY`
- `SNOWTRACE_API_KEY` if verification is needed
- `NEXT_PUBLIC_OPENBOUNTY_CONTRACT_ADDRESS` if you want to override the generated deployment metadata
- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` for RainbowKit/Core/WalletConnect support
- `OPENBOUNTY_PROXY_ADDRESS` when running the upgrade script

Deploy and upgrade scripts automatically update the matching root env file and `apps/web/.env.<target>` with the latest contract address, chain id, RPC URL, and app URL.

## Tooling

- Husky pre-commit runs `lint-staged`
- Husky pre-push runs `npm run ci:check`
- GitHub Actions `ci.yml` runs lint, contract tests, and frontend build
- GitHub Actions `deploy-fuji.yml` supports manual Fuji deployment via repository secrets

## Deployment checklist

- Review `DEPLOYMENT_CHECKLIST.md` before any public deployment
- Treat Fuji as the default public staging target
- Do not deploy to mainnet while upgrade ownership is still a single EOA

## Contract Notes

- The contract is upgradeable through a UUPS proxy
- Bounty and submission feeds are paginated on-chain to avoid unbounded reads
- Approval and refund paths are guarded with checks-effects-interactions and reentrancy protection
- Creators cannot submit to their own bounties
- Winner selection is creator-trusted and not verified against GitHub merge state onchain
