# StreetBounty

[Watch Demo Video (WebM)](assets/screencast.webm)

[![Watch StreetBounty demo](assets/Screenshot%20from%202026-04-10%2018-54-26.png)](assets/screencast.webm)

StreetBounty is a Stellar testnet dApp for community-driven road incident reporting. Citizens can report road issues, track wallet activity, and earn XLM-based rewards through a transparent, reward-ready workflow.

## Project Description

StreetBounty is designed as a civic-tech frontend for road incident reporting. The application combines a public-facing landing page with a wallet-focused portal experience so users can learn about the product, connect a Stellar wallet, review balances, send testnet XLM, and inspect transaction history.

The interface is built to feel professional, trustworthy, and easy to navigate. It is intentionally positioned as a premium civic and fintech experience rather than a generic crypto dashboard.

## Features

- Landing page with product story, benefits, and a clear portal call to action
- Portal dashboard with wallet connection and disconnection
- XLM balance display with refresh support
- Transaction history with explorer links
- XLM transfer form with confirmation and feedback states
- Balance trend chart and wallet activity overview
- Incident reporting preview for the future reporting workflow

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

### Portal Dashboard

![StreetBounty portal dashboard](assets/Screenshot%20from%202026-04-10%2018-54-26.png)

### Wallet and Transactions View

![StreetBounty wallet and transactions](assets/Screenshot%20from%202026-04-10%2018-55-10.png)

## Testnet Funding

1. Open the portal page and connect your Stellar wallet.
2. Copy your public address.
3. Fund the address using Stellar Laboratory testnet tools:
  https://laboratory.stellar.org/#account-creator?network=test

## App Routes

- `/` - Landing page
- `/portal` - Incident portal and wallet dashboard

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
