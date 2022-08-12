import { CreateParams } from "@streamflow/stream";
import { streamflowClient } from "./streamflowClient";

export async function createStream(createStreamParams: CreateParams) {
  const response = await streamflowClient.create(createStreamParams);

  return response;
}
