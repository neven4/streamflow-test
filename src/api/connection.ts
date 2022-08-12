import { clusterApiUrl, Connection } from "@solana/web3.js";

const network = "devnet";

export const connection = new Connection(clusterApiUrl(network));
