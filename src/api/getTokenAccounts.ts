import { TOKEN_PROGRAM_ID } from "@project-serum/anchor/dist/cjs/utils/token";
import { PublicKey } from "@solana/web3.js";
import { connection } from "./connection";

export async function getTokenAccounts(publicKey: PublicKey) {
  const response = await connection.getParsedTokenAccountsByOwner(
    publicKey,
    { programId: TOKEN_PROGRAM_ID },
    "confirmed"
  );

  return response;
}
