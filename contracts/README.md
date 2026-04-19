# StreetBounty Soroban Contracts

This folder contains the Soroban smart contract workspace for StreetBounty.

## Deployed Contract (Testnet)

- Contract ID: `CDZSKVDS2VGECFXWLDRVXEHBVIYXKIJXJPJ6PTROG4E3NBDVLBZSYKDD`
- Network: `testnet`
- Explorer:
	- https://stellar.expert/explorer/testnet/contract/CDZSKVDS2VGECFXWLDRVXEHBVIYXKIJXJPJ6PTROG4E3NBDVLBZSYKDD

## Project Structure

```text
.
├── Cargo.toml
├── README.md
└── contracts
		└── streetbounty
				├── Cargo.toml
				├── Makefile
				└── src
						├── lib.rs
						└── test.rs
```

## Contract Features

The `streetbounty` contract supports:

1. Report incidents
2. Get incident details by id
3. Fetch all incidents
4. Get latest incident
5. Approve incident (admin only)
6. Disapprove incident (admin only)
7. Reward reporter with `1 XLM` on approval
8. Fund contract balance with XLM token
9. Read contract token balance
10. Withdraw contract funds (admin only)

## Data Model

Each incident stores:

- `id: u64`
- `reporter: Address`
- `title: String`
- `description: String`
- `location: String`
- `created_at: u64`
- `status: Pending | Approved | Disapproved`

## Access Control Rules

- Only the configured admin can approve incidents.
- Only the configured admin can disapprove incidents.
- Only the configured admin can withdraw contract funds.
- Reporter must authorize `report_incident`.
- Funder must authorize `fund_contract`.

## Reward Flow

- Reward amount is fixed at `1 XLM = 10_000_000 stroops`.
- On `approve_incident`, the contract transfers `1 XLM` from contract balance to the reporter.
- The contract must be funded before approvals, otherwise token transfer will fail.

## Initialization

The contract must be initialized once:

- `admin`: account allowed to moderate incidents and withdraw funds
- `reward_token`: token contract address used for rewards (native XLM token contract on the selected network)

Calling `init` more than once will fail.

## Build

Run from repository root:

```bash
stellar contract build --manifest-path contracts/Cargo.toml --package streetbounty
```

Expected wasm output:

```text
contracts/target/wasm32v1-none/release/streetbounty.wasm
```

## Deploy (CLI)

```bash
stellar contract deploy \
	--wasm contracts/target/wasm32v1-none/release/streetbounty.wasm \
	--source-account deployer \
	--network testnet \
	--alias streetbounty
```

## Configure Native XLM Reward Token

```bash
XLM_TOKEN_ID=$(stellar contract id asset --asset native --network testnet)
DEPLOYER_ADDR=$(stellar keys public-key deployer)

stellar contract invoke \
	--id streetbounty \
	--source-account deployer \
	--network testnet \
	-- init \
	--admin "$DEPLOYER_ADDR" \
	--reward_token "$XLM_TOKEN_ID"
```

## Fund Contract

Fund in stroops (`1 XLM = 10_000_000`):

```bash
stellar contract invoke \
	--id streetbounty \
	--source-account deployer \
	--network testnet \
	-- fund_contract \
	--from "$DEPLOYER_ADDR" \
	--amount 50000000
```

## Typical Usage

Report an incident (from reporter account):

```bash
REPORTER_ADDR=$(stellar keys public-key alice)

stellar contract invoke \
	--id streetbounty \
	--source-account alice \
	--network testnet \
	-- report_incident \
	--reporter "$REPORTER_ADDR" \
	--title "Pothole" \
	--description "Large pothole near school" \
	--location "Main Street"
```

Approve incident id `0` (pays reward):

```bash
stellar contract invoke \
	--id streetbounty \
	--source-account deployer \
	--network testnet \
	-- approve_incident \
	--id 0
```

Disapprove incident id `1`:

```bash
stellar contract invoke \
	--id streetbounty \
	--source-account deployer \
	--network testnet \
	-- disapprove_incident \
	--id 1
```

Read APIs:

```bash
stellar contract invoke --id streetbounty --source-account deployer --network testnet -- get_incident --id 0
stellar contract invoke --id streetbounty --source-account deployer --network testnet -- get_all_incidents
stellar contract invoke --id streetbounty --source-account deployer --network testnet -- get_latest_incident
stellar contract invoke --id streetbounty --source-account deployer --network testnet -- get_incident_count
stellar contract invoke --id streetbounty --source-account deployer --network testnet -- contract_balance
```

Admin withdrawal:

```bash
stellar contract invoke \
	--id streetbounty \
	--source-account deployer \
	--network testnet \
	-- withdraw_contract_funds \
	--to "$DEPLOYER_ADDR" \
	--amount 10000000
```

## Notes

- This contract is currently configured for native XLM rewards via the Soroban token contract.
- Always keep contract reward balance above pending payouts.
- Moderation actions are one-time per incident; an incident cannot be re-reviewed after approval/disapproval.