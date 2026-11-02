import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { burn, fetchAsset, mplCore } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";
import { readFileSync } from "fs";
import os from "os";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

// Keypair of the wallet that now OWNS the NFT (CLI default path shown)
const secret = JSON.parse(
  readFileSync(`${os.homedir()}/.config/solana/id.json`, "utf-8"),
);
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secret));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    const assetAddress = publicKey(
      "AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV",
    );

    const asset = await fetchAsset(umi, assetAddress);
    console.log("Burning:", asset.name);
    console.log("Asset owner:", asset.owner);
    console.log("Signer:", signer.publicKey);

    const balanceBefore = await umi.rpc.getBalance(signer.publicKey);

    const tx = await burn(umi, { asset }).sendAndConfirm(umi);

    const balanceAfter = await umi.rpc.getBalance(signer.publicKey);

    const signature = base58.deserialize(tx.signature)[0];
    console.log(`signature ${signature}`);
    console.log(
      `Balance before: ${balanceBefore.basisPoints}, after: ${balanceAfter.basisPoints} lamports`,
    );
    console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
  } catch (e) {
    console.log(`error ${e}`);
  }
})();
