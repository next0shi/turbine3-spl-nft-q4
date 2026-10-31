import {
  appendTransactionMessageInstruction,
  appendTransactionMessageInstructions,
  assertIsTransactionMessageWithBlockhashLifetime,
  assertIsTransactionWithBlockhashLifetime,
  createKeyPairSignerFromBytes,
  createSolanaRpc,
  createSolanaRpcSubscriptions,
  createTransactionMessage,
  generateKeyPairSigner,
  getSignatureFromTransaction,
  sendAndConfirmTransactionFactory,
  setTransactionMessageFeePayerSigner,
  setTransactionMessageLifetimeUsingBlockhash,
  signTransactionMessageWithSigners,
} from "@solana/kit";
import {
  getInitializeMintInstruction,
  getMintSize,
  TOKEN_PROGRAM_ADDRESS,
} from "@solana-program/token";
import { getCreateAccountInstruction } from "@solana-program/system";

//import your wallet
import wallet from "../../devnet-wallet.json";

const rpc = createSolanaRpc("https://api.devnet.solana.com");

const rpcSubscriptions = createSolanaRpcSubscriptions(
  "wss://api.devnet.solana.com",
);

(async () => {
  try {
    // 1. Load your wallet as the signer and fee payer
    const keypairSigner = await createKeyPairSignerFromBytes(
      new Uint8Array(wallet),
    );

    // 2. Generate a fresh keypair that will become the mint's address
    const mint = await generateKeyPairSigner();

    // 3. Work out how much SOL the mint account needs to be rent-exempt
    const space = BigInt(getMintSize());
    const rent = await rpc.getMinimumBalanceForRentExemption(space).send();

    // 4. Instruction one: create the account, owned by the Token program
    const createAccountIx = getCreateAccountInstruction({
      payer: keypairSigner,
      newAccount: mint,
      lamports: rent,
      space,
      programAddress: TOKEN_PROGRAM_ADDRESS,
    });

    // 5. Instruction two: turn that account into a token mint
    const initializeMintIx = getInitializeMintInstruction({
      mint: mint.address,
      decimals: 6,
      mintAuthority: keypairSigner.address,
      freezeAuthority: null,
    });

    // 6. Build the transaction
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
      [createAccountIx, initializeMintIx],
      withLifetime,
    );

    // 7. Sign, send and wait for confirmation
    const signedTx = await signTransactionMessageWithSigners(withInstructions);
    assertIsTransactionWithBlockhashLifetime(signedTx);

    const sendAndConfirm = sendAndConfirmTransactionFactory({
      rpc,
      rpcSubscriptions,
    });
    await sendAndConfirm(signedTx, { commitment: "confirmed" });

    // 8. Log what you need for the next steps
    console.log("Mint address:", mint.address);
    console.log("Signature:", getSignatureFromTransaction(signedTx));
  } catch (error) {
    console.log(error);
  }
})();
