import {
  Group,
  Loader,
  Progress,
  ScrollArea,
  Table,
  Text,
} from "@mantine/core";
import { PublicKey } from "@solana/web3.js";
import { memo, useEffect, useMemo, useState } from "react";
import { getNumberFromBN, Stream } from "@streamflow/stream";
import { getStreams } from "../api/getStreams";
import { TokenByAddressMap } from "../App";
import { getNowInSeconds } from "../utils/nowInSeconds";

interface ShowStreamsProps {
  publicKey: PublicKey | null;
  tokenMap: TokenByAddressMap;
}

function ShowStreams({ publicKey, tokenMap }: ShowStreamsProps) {
  const [streams, setStreams] = useState<[string, Stream][]>([]);
  const [getStreamsStatus, setGetStreamsStatus] = useState<
    "loading" | "loaded" | "error"
  >("loading");

  useEffect(() => {
    async function getStream() {
      try {
        if (publicKey === null) {
          return;
        }

        const streams = await getStreams(publicKey);

        setStreams(streams);
        setGetStreamsStatus("loaded");
      } catch (e) {
        console.log(e);

        setGetStreamsStatus("error");
      }
    }

    getStream();
  }, [publicKey]);

  const rows = useMemo(() => {
    return streams
      .sort((a, b) => b[1].start - a[1].start)
      .map(([streamId, streamData]) => {
        const nowInSeconds = getNowInSeconds();

        const status =
          streamData.canceledAt > 0
            ? "canceled"
            : nowInSeconds >= streamData.end
            ? "completed"
            : nowInSeconds < streamData.start
            ? "scheduled"
            : "in progress";

        const tokenInfo = tokenMap.get(streamData.mint);
        const tokenSymbol = tokenInfo?.symbol || "";
        const tokenLogo = tokenInfo?.logoURI || "";
        const tokenName = tokenInfo?.name || "";
        const tokenDecimals = tokenInfo?.decimals || 9;

        const depositAmount = getNumberFromBN(
          streamData.depositedAmount,
          tokenDecimals
        );
        const withdrawnAmount = getNumberFromBN(
          streamData.withdrawnAmount,
          tokenDecimals
        );

        return (
          <tr key={streamId}>
            <td>{status}</td>
            <td>
              <div>
                <strong>Name:</strong> {streamData.name}
              </div>
              <div>
                <strong>Stream Id:</strong> {streamId}
              </div>
              <div>
                <strong>Sender:</strong> {streamData.sender}
              </div>
              <div>
                <strong>Recipient:</strong> {streamData.recipient}
              </div>
            </td>
            <td style={{ minWidth: 150 }}>
              <Group position="apart" mt="xs">
                <Text size="sm" color="dimmed">
                  <img
                    src={tokenLogo}
                    alt={tokenName}
                    style={{ width: 15, height: 15 }}
                  />
                </Text>
                <Text size="sm" color="dimmed">
                  {withdrawnAmount} / {depositAmount} {tokenSymbol}
                </Text>
              </Group>
              <Progress
                value={(withdrawnAmount / depositAmount) * 100}
                mt={5}
              />
            </td>
            <td>{new Date(streamData.start * 1000).toUTCString()}</td>
            <td>{new Date(streamData.end * 1000).toUTCString()}</td>
          </tr>
        );
      });
  }, [streams, tokenMap]);

  if (getStreamsStatus === "loading") {
    return <Loader />;
  }

  if (getStreamsStatus === "error") {
    return <div>Error! Please reload the page</div>;
  }

  return (
    <ScrollArea>
      <Table verticalSpacing="xs" sx={{ minWidth: 800 }}>
        <thead>
          <tr>
            <th>Status</th>
            <th>Name / Stream ID's</th>
            <th>Withdrawn Amount</th>
            <th>Start (UTC)</th>
            <th>End (UTC)</th>
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}

export default memo(ShowStreams);
