# StreetBounty

StreetBounty is a Stellar testnet dApp for community-driven road incident reporting with reward-ready wallet flows.

## What’s in this version

- Light-themed landing page with StreetBounty vision and CTA
- Incident portal with:
  - Wallet connect/disconnect
  - Wallet address display
  - XLM balance fetch + refresh
  - XLM transfer form
  - Transaction status + hash feedback
  - Recent transaction history

## Tech stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Stellar Wallets Kit + Stellar SDK

## Run locally

### Prerequisites

- Node.js 18+
- Freighter wallet (recommended) or another compatible Stellar wallet

### Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Testnet funding

1. Connect wallet in the portal
2. Copy your address
3. Fund on Stellar Laboratory:
   https://laboratory.stellar.org/#account-creator?network=test

## App routes

- `/` → Landing page
- `/portal` → Incident portal (wallet + balance + transfer + tx history)

## Important

- Network: Stellar Testnet only
- Do not use real funds
- Keep blockchain logic in `lib/stellar-helper.ts` unchanged
