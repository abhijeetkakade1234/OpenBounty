# OpenBounty Deployment Checklist

Use this before any public deployment. Mainnet is blocked until every required item is complete.

## Required before Fuji or Mainnet

- Confirm the deployed proxy address.
- Confirm the deployed implementation address.
- Confirm the owner address that controls upgrades.
- Confirm the target chain and RPC endpoint.
- Confirm the frontend is reading the expected contract address and chain id.
- Confirm no secret values were written into tracked files.

## Mainnet blockers

- Upgrade ownership must be moved off a single EOA and onto a multisig.
- Contract hardening must include:
  - creator self-submission blocked onchain
  - bounded string lengths for repo URL, description, and PR link
  - tests covering those rules
- Local deploy, local bootstrap, and Fuji deploy must all be proven first.
- User-facing copy must be cleaned of dev-only or internal contract wording.

## Record for each deployment

- Date:
- Target:
- Proxy address:
- Implementation address:
- Upgrade owner:
- Frontend contract address:
- Frontend chain id:
- Reviewer:
- Go / No-Go:
