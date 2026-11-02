import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAsset, mplCore, transfer } from "@metaplex-foundation/mpl-core";
import { base58 } from "@metaplex-foundation/umi/serializers";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(signerIdentity(signer));
umi.use(mplCore());

(async () => {
  try {
    const assetAddress = publicKey(
      "AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV",
    );

    // The wallet that will become the new owner
    const newOwner = publicKey("6wtWRkNJhg6yBfXoejxBoKj984GNv4GwqEUgTV4SHKTC");

    const asset = await fetchAsset(umi, assetAddress);
    console.log("Current owner:", asset.owner);

    const tx = await transfer(umi, { asset, newOwner }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];
    console.log(`signature ${signature}`);
    console.log(
      `https://core.metaplex.com/explorer/${assetAddress}?env=devnet`,
    );
  } catch (e) {
    console.log(`error ${e}`);
  }
})();
