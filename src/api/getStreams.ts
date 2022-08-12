import { PublicKey } from "@solana/web3.js";
import { streamflowClient } from "./streamflowClient";

export async function getStreams(publicKey: PublicKey) {
  const streams = await streamflowClient.get({
    wallet: publicKey,
  });

  return streams;
}
