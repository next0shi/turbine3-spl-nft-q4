import { createUmi } from "@metaplex-foundation/umi-bundle-defaults";
import {
  createGenericFile,
  createSignerFromKeypair,
  signerIdentity,
} from "@metaplex-foundation/umi";
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys";
import { readFile } from "fs/promises";

import wallet from "../../devnet-wallet.json";

const umi = createUmi(
  process.env.SOLANA_RPC_URL ?? "https://api.devnet.solana.com",
);

const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(
  irysUploader({
    address: "https://devnet.irys.xyz/",
  }),
);

umi.use(signerIdentity(signer));

(async () => {
  try {
    // 1. Upload the image
    const imageBytes = await readFile("./next0shi.jpeg");
    const imageFile = createGenericFile(imageBytes, "next0shi.jpeg", {
      contentType: "image/jpeg",
    });
    const [imageUri] = await umi.uploader.upload([imageFile]);
    console.log("Image URI:", imageUri);

    // 2. Upload the metadata JSON that points to the image
    const metadataUri = await umi.uploader.uploadJson({
      name: "my path, my burden",
      symbol: "mPmB",
      description: "first on Solana devnet",
      image: imageUri,
    });
    console.log("Metadata URI:", metadataUri);
  } catch (error) {
    console.log("Upload failed:", error);
  }
})();
