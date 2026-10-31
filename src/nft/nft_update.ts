import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import wallet from "../../devnet-wallet.json";
import {
  createSignerFromKeypair,
  publicKey,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { fetchAsset, mplCore, update } from "@metaplex-foundation/mpl-core";
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
    // The asset address printed by nft:mint
    const assetAddress = publicKey(
      "AXwDvXi75pdpa15oESRFeoTPdqCCSzg9AdRyx9NPRSGV",
    );

    // The new metadata URI from step 1 (or your current one)
    const newUri =
      "https://gateway.irys.xyz/3oHrJVpunRamRRF7vk4LssF9ztzEp5Tie9kEYuxGYD25";

    const asset = await fetchAsset(umi, assetAddress);
    console.log("Current name:", asset.name);
    console.log("Current uri:", asset.uri);

    const tx = await update(umi, {
      asset,
      name: "my path, my burden, to be at peace",
      uri: newUri,
    }).sendAndConfirm(umi);

    const signature = base58.deserialize(tx.signature)[0];

    console.log(`signature ${signature}`);
    console.log(
      `https://core.metaplex.com/explorer/${assetAddress}?env=devnet`,
    );
  } catch (e) {
    console.log(`error ${e}`);
  }
})();
