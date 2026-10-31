import {
  address,
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import wallet from "../../devnet-wallet.json";
import {
  findAssociatedTokenPda,
  getCreateAssociatedTokenInstructionAsync,
  getMintToInstruction,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

const token_decimals = 1_000_000n;

//paste your mint address got from spl_init.ts
const mint = address("BBYzwixyjw2bYydxQe7dqmH3HsSRusPzU39oNYScCmUp");

(async () => {
  try {
    const keypairSigner = await createKeyPairSignerFromBytes(
      new Uint8Array(wallet),
    );

    // Your token account for this mint
    const [ata] = await findAssociatedTokenPda({
      mint,
      owner: keypairSigner.address,
      tokenProgram: TOKEN_PROGRAM_ADDRESS,
    });

    // 1. Create the token account (does nothing if it already exists)
    const createAtaIx =
      await getCreateAssociatedTokenIdempotentInstructionAsync({
        payer: keypairSigner,
        mint,
        owner: keypairSigner.address,
      });

    // 2. Mint tokens into it
    const mintToIx = getMintToInstruction({
      mint,
      token: ata,
      mintAuthority: keypairSigner,
      amount: 100_000_000n, // 100 tokens at 6 decimals
    });

    // Build, sign and send, same pattern as spl_init.ts
    const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

    const message = createTransactionMessage({ version: 0 });
    const withPayer = setTransactionMessageFeePayerSigner(
      keypairSigner,
      message,
    );
    const withLifetime = setTransactionMessageLifetimeUsingBlockhash(
      latestBlockhash,
      withPayer,
    );
    const withInstructions = appendTransactionMessageInstructions(
      [createAtaIx, mintToIx],
      withLifetime,
    );

    const signedTx = await signTransactionMessageWithSigners(withInstructions);
    assertIsTransactionWithBlockhashLifetime(signedTx);

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });
    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    console.log("Token account:", ata);
    console.log("Signature:", getSignatureFromTransaction(signedTx));
    console.log(`https://explorer.solana.com/address/${ata}?cluster=devnet`);
  } catch (error) {
    console.log(error);
  }
})();
