import { Button, Container, Group } from "@mantine/core";
import { ENV, TokenInfo, TokenListProvider } from "@solana/spl-token-registry";
import { PublicKey } from "@solana/web3.js";
import { useEffect, useMemo, useState } from "react";
import CreateStream from "./components/CreateStream";
import Header from "./components/Header";
import ShowStreams from "./components/ShowStreams";

type PhantomEvent = "disconnect" | "connect" | "accountChanged";

interface ConnectOpts {
  onlyIfTrusted: boolean;
}

export interface PhantomProvider {
  connect: (opts?: Partial<ConnectOpts>) => Promise<{ publicKey: PublicKey }>;
  disconnect: () => Promise<void>;
  on: (event: PhantomEvent, callback: (args: any) => void) => void;
  isPhantom: boolean;
}

type WindowWithSolana = Window & {
  solana?: PhantomProvider;
};

export type TokenByAddressMap = Map<string, TokenInfo>;

const customTokenMap: TokenByAddressMap = new Map(
  Object.entries({
    AhitdMW8uWA5tfkRxv4zbRw7dN4sqdqgeVHHCjFo2u9G: {
      address: "AhitdMW8uWA5tfkRxv4zbRw7dN4sqdqgeVHHCjFo2u9G",
      chainId: 103,
      decimals: 9,
      logoURI: "https://streamflow.finance/public/img/icon.png",
      name: "KIDALICA",
      price_usd: 1.4,
      symbol: "KIDA",
      tags: [],
    },
    B8DVFHFWFKtqXcN7Up5MyTJNsqSZTSTQw4totxGEJ3Q5: {
      address: "B8DVFHFWFKtqXcN7Up5MyTJNsqSZTSTQw4totxGEJ3Q5",
      chainId: 103,
      decimals: 9,
      logoURI:
        "https://raw.githubusercontent.com/millionsy/token-list/main/assets/mainnet/HDLRMKW1FDz2q5Zg778CZx26UgrtnqpUDkNNJHhmVUFr/logo.png",
      name: "TEST",
      price_usd: 2.5,
      symbol: "TEST",
      tags: [],
    },
    FGHYWaEkycB1bhkQKN7GqJTzySgQzFgvdFc8RuVzmkNF: {
      address: "FGHYWaEkycB1bhkQKN7GqJTzySgQzFgvdFc8RuVzmkNF",
      chainId: 103,
      decimals: 9,
      logoURI: "https://streamflow.finance/public/img/icon.png",
      name: "META",
      price_usd: 2.3,
      symbol: "META",
      tags: [],
    },
    Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj: {
      address: "Gssm3vfi8s65R31SBdmQRq6cKeYojGgup7whkw4VCiQj",
      chainId: 103,
      decimals: 9,
      logoURI:
        "https://static-content-23313.s3.amazonaws.com/logo.c4294b7c.png",
      name: "STREAMFLOW",
      price_usd: 1,
      symbol: "STRM",
      tags: [],
    },
  })
);

function App() {
  const [provider, setProvider] = useState<PhantomProvider | null>(null);
  const [connected, setConnected] = useState(false);
  const [pubKey, setPubKey] = useState<PublicKey | null>(null);
  const [tokenMap, setTokenMap] = useState<TokenByAddressMap>(new Map());
  const [page, setPage] = useState<"show" | "create">("create");

  useEffect(() => {
    new TokenListProvider().resolve().then((tokens) => {
      const tokenList = tokens.filterByChainId(ENV.Devnet).getList();

      const tokenByAddress: TokenByAddressMap = tokenList.reduce(
        (map, item) => {
          map.set(item.address, item);

          return map;
        },
        customTokenMap
      );

      setTokenMap(tokenByAddress);
    });
  }, [setTokenMap]);

  useEffect(() => {
    if ("solana" in window) {
      const solWindow = window as WindowWithSolana;
      if (solWindow?.solana?.isPhantom) {
        setProvider(solWindow.solana);

        solWindow.solana.connect({ onlyIfTrusted: true });
      }
    }
  }, []);

  useEffect(() => {
    provider?.on("connect", (publicKey: PublicKey) => {
      setConnected(true);
      setPubKey(publicKey);
    });
    provider?.on("disconnect", () => {
      setConnected(false);
      setPubKey(null);
    });
  }, [provider]);

  const authContent = useMemo(
    () => (
      <>
        <Group mb="md" mt="md">
          <Button
            onClick={() => setPage("show")}
            variant={page === "create" ? "light" : "filled"}
          >
            Streams
          </Button>

          <Button
            onClick={() => setPage("create")}
            variant={page !== "create" ? "light" : "filled"}
          >
            New Stream
          </Button>
        </Group>

        {page === "show" && (
          <ShowStreams publicKey={pubKey} tokenMap={tokenMap} />
        )}

        {page === "create" && (
          <CreateStream
            publicKey={pubKey}
            tokenMap={tokenMap}
            provider={provider}
            goToShowPage={() => setPage("show")}
          />
        )}
      </>
    ),
    [page, provider, pubKey, tokenMap]
  );

  return (
    <>
      <Header provider={provider} connected={connected} publicKey={pubKey} />

      <Container>
        {connected ? authContent : "connect wallet to use streamflow"}
      </Container>
    </>
  );
}

export default App;
