import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import wallet from "../../devnet-wallet.json";
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createMetadataAccountV3,
  CreateMetadataAccountV3InstructionAccounts,
  CreateMetadataAccountV3InstructionArgs,
  DataV2Args,
} from "@metaplex-foundation/mpl-token-metadata";
import bs58 from "bs58";

//paste your mint address got from spl_init.ts
const mint = publicKey("BBYzwixyjw2bYydxQe7dqmH3HsSRusPzU39oNYScCmUp");

const umi = createUmi("https://api.devnet.solana.com");

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));

(async () => {
  try {
    const tx = createMetadataAccountV3(umi, {
      mint,
      mintAuthority: signer,
      data: {
        name: "my path, my burden",
        symbol: "mPmB",
        uri: "https://gateway.irys.xyz/3CRznt3qWYFj65geDR9BkieHxEX2p8ZCYi18XHhsssAv", // your metadata JSON URI, or leave empty for now
        sellerFeeBasisPoints: 0,
        creators: null,
        collection: null,
        uses: null,
      },
      isMutable: true,
      collectionDetails: null,
    });

    const result = await tx.sendAndConfirm(umi);
    console.log("Signature:", base58.deserialize(result.signature)[0]);
    console.log(`https://explorer.solana.com/address/${mint}?cluster=devnet`);
  } catch (error) {
    console.log(error);
  }
})();
//43ttSnN9qaVi8TDcWwBZo5mUbfKDXY8d1N7exdJojJxV7qjKuwXoEh7qASXbFU4QFrAEFzZvcmWpRch434hSVNLN
