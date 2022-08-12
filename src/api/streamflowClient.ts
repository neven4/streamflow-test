import { Cluster, StreamClient } from "@streamflow/stream";

export const streamflowClient = new StreamClient(
  "https://api.devnet.solana.com",
  Cluster.Devnet
);
