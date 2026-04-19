# StreetBounty

[Watch Demo Video](https://drive.google.com/file/d/18lPta6JAQLz3j-WCje9a5IoS6xeOqoI0/view?usp=sharing)

StreetBounty is a Stellar testnet dApp for community-driven road incident reporting. Reporters can submit incidents, review all reported incidents, and inspect rewards through a contract-backed workflow.

## Project Description

StreetBounty is designed as a civic-tech frontend for road incident reporting. The application combines a public-facing landing page with reporter pages that read directly from the Soroban contract for incident history and reward records.

The interface is built to feel professional, trustworthy, and easy to navigate. It is intentionally positioned as a premium civic and fintech experience rather than a generic crypto dashboard.

## Features

- Landing page with product story, benefits, and a clear route call to action
- Reporter report page with wallet connection and on-chain incident submission
- Dashboard page with all reported incidents, search, and status filters
- Rewards page with wallet-aware on-chain reward records
- Read-only reporter access to incident lookup and latest incident data

## Setup Instructions

### Prerequisites

- Node.js 18 or later
- npm
- A compatible Stellar wallet such as Freighter

### Run Locally

```bash
npm install
npm run dev
```

Open the app in your browser at http://localhost:3000

## Screenshots

### Landing Page

![StreetBounty landing page](assets/Screenshot%20from%202026-04-10%2018-53-58.png)

### Dashboard

![StreetBounty dashboard](assets/Screenshot%20from%202026-04-10%2018-54-26.png)

### Wallet and Transactions View

![StreetBounty wallet and transactions](assets/Screenshot%20from%202026-04-10%2018-55-10.png)

## Testnet Funding

1. Open the report page and connect your Stellar wallet.
2. Copy your public address.
3. Fund the address using Stellar Laboratory testnet tools:
  https://laboratory.stellar.org/#account-creator?network=test

## App Routes

- `/` - Landing page
- `/report` - Report an incident with wallet connection
- `/dashboard` - View all reported incidents
- `/rewards` - Review reward records with wallet connection

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Stellar Wallets Kit
- Stellar SDK

## Notes

- This project runs on Stellar Testnet only.
- Do not use real funds.
- Blockchain logic lives in `lib/stellar-helper.ts` and should remain unchanged.
