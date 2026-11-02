# Turbin3 Q4: SPL Token & MPL Core NFT on Solana Devnet

This repo contains my solutions to the SPL token and NFT tasks. Everything was done on **Solana devnet** with TypeScript scripts.

## Tasks

1. Mint and transfer my own SPL token
2. Mint an NFT using MPL Core
3. Update the NFT's name and metadata as the update authority

## Submission Summary

| Item                                                  | Value                                          |
| ----------------------------------------------------- | ---------------------------------------------- |
| Network                                               | Solana devnet                                  |
| Wallet (signer, fee payer, mint and update authority) | `8Bnmwho4xYLf8LwGDLekLZ8XKz6HZSAMLjYLAbT3Jphh` |
| SPL token mint                                        | `BBYzwixyjw2bYydxQe7dqmH3HsSRusPzU39oNYScCmUp` |
| SPL token account (mine)                              | `4P6Rj4Y2dYWgkjxwANyF2ZH4t4xv5tFpWVvvu6Mhb6ck` |
| Recipient wallet                                      | `6wtWRkNJhg6yBfXoejxBoKj984GNv4GwqEUgTV4SHKTC` |
| NFT asset address                                     | `AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV` |

## Tech Stack

- `@solana/kit` and `@solana-program/token` for the SPL token scripts
- `@solana-program/system` for creating the mint account
- UMI with `@metaplex-foundation/mpl-token-metadata` for token metadata
- UMI with `@metaplex-foundation/mpl-core` for the NFT
- Irys (devnet) for uploading the image and metadata JSON
- `ts-node` to run the scripts

## Setup

```bash
git clone git@github.com:next0shi/turbine3-spl-nft-q4.git
cd turbine3-spl-nft-q4
npm install
```

1. Put my wallet keypair at the project root as `devnet-wallet.json`. This file holds a private key, so it is listed in `.gitignore` and is never committed.
2. Put the NFT image at the project root as `next0shi.jpeg`.
3. Fund the wallet with devnet SOL. It pays for transaction fees, account rent and Irys uploads.

```bash
# get the wallet address
solana address -k devnet-wallet.json

# send SOL from my main devnet address
solana transfer <WALLET_ADDRESS> 1 --from ~/.config/solana/id.json --url devnet --allow-unfunded-recipient

# check the balance
solana balance <WALLET_ADDRESS> --url devnet
```

## Scripts

| Command                | File                      | What it does                                      |
| ---------------------- | ------------------------- | ------------------------------------------------- |
| `npm run spl:init`     | `src/spl/spl_init.ts`     | Creates and initializes the token mint            |
| `npm run spl:metadata` | `src/spl/spl_metadata.ts` | Attaches a name, symbol and URI to the mint       |
| `npm run spl:mint`     | `src/spl/spl_mint.ts`     | Creates my token account and mints tokens into it |
| `npm run spl:transfer` | `src/spl/spl_transfer.ts` | Sends tokens to another wallet                    |
| `npm run nft:image`    | `src/nft/nft_image.ts`    | Uploads the NFT image to Irys                     |
| `npm run nft:metadata` | `src/nft/nft_metadata.ts` | Uploads the NFT metadata JSON to Irys             |
| `npm run nft:mint`     | `src/nft/nft_mint.ts`     | Mints the MPL Core NFT                            |
| `npm run nft:update`   | `src/nft/nft_update.ts`   | Updates the NFT's name and metadata URI           |
| `npm run nft:transfer` | `src/nft/nft_transfer.ts` | Transfers NFT ownership to another wallet         |
| `npm run nft:burn`     | `src/nft/nft_burn.ts`     | Burns the NFT and reclaims the rent               |

---

## Task 1: Mint and Transfer My Own SPL Token

### Step 1: Create the mint (`spl:init`)

```bash
npm run spl:init
```

The script builds one transaction with two instructions:

1. `createAccount` creates a new account owned by the Token program. It is funded with the rent-exempt minimum, and its address is a freshly generated keypair.
2. `initializeMint` turns that account into a token mint with **6 decimals**, my wallet as the **mint authority**, and **no freeze authority**.

- Mint address: `BBYzwixyjw2bYydxQe7dqmH3HsSRusPzU39oNYScCmUp`
- Transaction: `3pZh2xPV3tYKMutjrWwqAkMYSZ53EGiXfk9VUMM8B9DnuYwiNE8yLXNaEWRiU5NQydnpqNFoUKJj6d3sFQzXjTxa`
- Explorer: https://explorer.solana.com/address/BBYzwixyjw2bYydxQe7dqmH3HsSRusPzU39oNYScCmUp?cluster=devnet

### Step 2: Add token metadata (`spl:metadata`)

```bash
npm run spl:metadata
```

This calls `createMetadataAccountV3` from the Metaplex Token Metadata program, signed by the mint authority. It gives the token a name, symbol and metadata URI so wallets and explorers can display it.

- Name / symbol: `my path, my burden` / `mPmB`
- Metadata URI: `https://gateway.irys.xyz/3CRznt3qWYFj65geDR9BkieHxEX2p8ZCYi18XHhsssAv`
- Transaction: `4R8A7qNZxbFyjdYnd6xqZavoXLiHDxPW325WAgRv4qnPYmTWFboStQQ9TYofjiMHo8dY2PGEwYPTWecXiMPbcE6v`

### Step 3: Mint tokens (`spl:mint`)

```bash
npm run spl:mint
```

A wallet does not hold tokens directly. It holds them in an **associated token account (ATA)** for each mint. The script sends two instructions:

1. Create my ATA for the mint.
2. `mintTo` that ATA. With 6 decimals, `100 * 1_000_000` base units equals **100 tokens**.

- My token account: `4P6Rj4Y2dYWgkjxwANyF2ZH4t4xv5tFpWVvvu6Mhb6ck`
- Amount minted: `100`
- Transaction: `5dX4sLQEdndqZmUnJ27FKzn5HAWgjR4SRdTLvP9NsRwqejHUH5H6yVRJHGADFKgHRtRcXhsUqe9xforbhmiqjoZe`
- Explorer: https://explorer.solana.com/tx/5dX4sLQEdndqZmUnJ27FKzn5HAWgjR4SRdTLvP9NsRwqejHUH5H6yVRJHGADFKgHRtRcXhsUqe9xforbhmiqjoZe?cluster=devnet

### Step 4: Transfer tokens (`spl:transfer`)

```bash
npm run spl:transfer
```

The script derives the recipient's ATA for the same mint, creates it (I pay the rent), and sends a `transferChecked` instruction. `transferChecked` also verifies the decimals, which prevents amount mistakes.

- Recipient wallet: `6wtWRkNJhg6yBfXoejxBoKj984GNv4GwqEUgTV4SHKTC`
- Recipient token account: `F1a8exUK3d44PoPLdz47UAs1TJciDtrKDknudEqxgB9F`
- Transaction: `3PZCGvTHxQqXznBexYwEDvC3fDwDvE1GwAb4QMAd2ACVaZ2xej2mRFJ62X2Q5Ks12xPG3vFTHp9XVAWLk9ayWBRB`
- Explorer: https://explorer.solana.com/tx/3PZCGvTHxQqXznBexYwEDvC3fDwDvE1GwAb4QMAd2ACVaZ2xej2mRFJ62X2Q5Ks12xPG3vFTHp9XVAWLk9ayWBRB?cluster=devnet

---

## Task 2: Mint an NFT Using MPL Core

### Step 1: Upload the image (`nft:image`)

```bash
npm run nft:image
```

`next0shi.jpeg` is uploaded to Irys devnet, paid for by my wallet.

- Image URI: https://gateway.irys.xyz/3DhLbz6x8CSNhkYTrgeyD9qWthqKjWj8VHPh1PpWCbkV

### Step 2: Upload the metadata JSON (`nft:metadata`)

```bash
npm run nft:metadata
```

The script builds a JSON file that points at the image and uploads it with `uploadJson`.

```json
{
  "name": "my path, my burden",
  "symbol": "mPmB",
  "description": "first on Solana devnet",
  "image": "https://gateway.irys.xyz/3DhLbz6x8CSNhkYTrgeyD9qWthqKjWj8VHPh1PpWCbkV"
}
```

- Original metadata URI: `https://gateway.irys.xyz/3oHrJVpunRamRRF7vk4LssF9ztzEp5Tie9kEYuxGYD25`

### Step 3: Mint the NFT (`nft:mint`)

```bash
npm run nft:mint
```

The script generates a new keypair for the asset, then calls `create` from `mpl-core` with the name and the metadata URI. My wallet becomes both the **owner** and the **update authority**.

- NFT name: `my path, my burden`
- NFT asset address: `AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV`
- Transaction: `53Vd3bEmbXCbpe8d8i8WjzRMpQdWzwnfYNUmgst5ppSmLGksm9Xmkf7v8Ms24Y2ktBykJTsa3SoRaqRSPVEAg6MB`
- Metaplex explorer: https://core.metaplex.com/explorer/AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV?env=devnet
- Solana Explorer: https://explorer.solana.com/address/AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV?cluster=devnet

---

## Task 3: Update the NFT's Name and Metadata

Data uploaded to Irys cannot be edited, so updating the metadata means uploading a **new** JSON file and pointing the NFT at its new URI.

### Step 1: Upload the updated metadata JSON

I changed the `name` in `src/nft/nft_metadata.ts` and ran:

```bash
npm run nft:metadata
```

- Updated metadata URI: `https://gateway.irys.xyz/68oKMqZRtFwn1UUaaBt5Hm3uVTuC4ZkdqgRZc7bFmPkW`

### Step 2: Update the NFT on-chain (`nft:update`)

```bash
npm run nft:update
```

The script fetches the asset with `fetchAsset`, prints its current name and URI, then sends an `update` instruction signed by the update authority (my wallet) with the new name and URI.

|              | Before                                                                  | After                                                                   |
| ------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Name         | `my path, my burden`                                                    | `my path, my burden, to be at peace`                                    |
| Metadata URI | `https://gateway.irys.xyz/3oHrJVpunRamRRF7vk4LssF9ztzEp5Tie9kEYuxGYD25` | `https://gateway.irys.xyz/68oKMqZRtFwn1UUaaBt5Hm3uVTuC4ZkdqgRZc7bFmPkW` |

- Update transaction: `4zkhrZMp78PvYqYwRvw4zXyBWvaZ6dMkmPpwadTXGq1MkMGxRovXB3DabnwEAAdQtih5FiWCXYKxJSSLQnDZGtdU`
- Metaplex explorer: https://core.metaplex.com/explorer/AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV?env=devnet

> Screenshot of the NFT after the update: `Screenshot from 2026-10-31 22-09-07.png`

---

## Optional Task 4: Transfer the NFT Between Wallets

```bash
npm run nft:transfer
```

The script fetches the asset with `fetchAsset`, prints its current owner, then sends a `transfer` instruction signed by the current owner. MPL Core assets are single accounts with no token accounts, so the recipient does not need SOL or any setup to receive one.

Only ownership moves. The **update authority** stays with my original wallet.

- NFT asset address: `AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV`
- New owner: `6wtWRkNJhg6yBfXoejxBoKj984GNv4GwqEUgTV4SHKTC`
- Transaction: `XFYHi8VRwtpEjr8NUYWBG3LyaCa3cSL98dGuKSpPwAQJPchkGSuQT6v9rSzFXBFd3HYZg32CAsfcYtLGUCfeWCi`
- Explorer: https://explorer.solana.com/tx/XFYHi8VRwtpEjr8NUYWBG3LyaCa3cSL98dGuKSpPwAQJPchkGSuQT6v9rSzFXBFd3HYZg32CAsfcYtLGUCfeWCi?cluster=devnet
- Metaplex explorer: https://core.metaplex.com/explorer/AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV?env=devnet

---

## Optional Task 5: Burn the NFT and Reclaim the Rent

```bash
npm run nft:burn
```

The script fetches the asset, records my SOL balance, sends a `burn` instruction signed by the asset's owner, then records the balance again. Burning closes the asset account permanently, and the rent that was locked in it returns to my wallet. **This cannot be undone.**

The owner must sign the burn. Because the NFT was transferred in Task 4, `6wtWRkNJhg6yBfXoejxBoKj984GNv4GwqEUgTV4SHKTC` ran this step.

|                     | Lamports      |
| ------------------- | ------------- |
| Balance before burn | `46091279246` |
| Balance after burn  | `46092173406` |

- Burned asset: `AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV`
- Transaction: `2N1MBQNybsomgZHtKF7qpSpMyw86oNrhz8E6kSU6v6ueSLbLNt89SfoHzYTNFLbhqaUe7foHyQggL2xeGpkwpJN6`
- Explorer: https://explorer.solana.com/tx/2N1MBQNybsomgZHtKF7qpSpMyw86oNrhz8E6kSU6v6ueSLbLNt89SfoHzYTNFLbhqaUe7foHyQggL2xeGpkwpJN6?cluster=devnet

After the burn, the asset address no longer resolves on the Metaplex explorer, which confirms the account is closed.

## Problems I Ran Into

- **`npm audit fix --force` broke the dependencies.** The audit warnings come from deep transitive dependencies and are not an issue for local devnet scripts. I restored the project with `git checkout package.json package-lock.json`, deleted `node_modules` and reinstalled. I no longer run `audit fix`.
- **Metaplex explorers show the name from the metadata JSON.** Changing only the on-chain name did not change what the explorer displayed, so the new name also had to go into a newly uploaded JSON.
- **Library versions differ from older examples.** `getCreateAssociatedTokenIdempotentInstructionAsync` did not exist in my installed `@solana-program/token`, so I used `getCreateAssociatedTokenInstructionAsync`. That version fails if the account already exists, so it is removed from the instruction list on a rerun.

## What I Learned

- A token mint and the token accounts that hold balances are separate accounts. Each wallet needs an associated token account per mint.
- Decimals define how base units map to whole tokens, and they cannot be changed after the mint is created.
- Rent-exempt balances and Irys uploads are paid in SOL, so the wallet has to stay funded.
- With MPL Core, the update authority can change the asset's name and URI, and ownership is a separate role.

## Security Note

`devnet-wallet.json` contains a private key and is excluded from version control. This project only ever uses devnet.
