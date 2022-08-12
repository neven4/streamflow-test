import { createStyles, Container, Button } from "@mantine/core";
import { PublicKey } from "@solana/web3.js";
import { memo, useCallback } from "react";
import { PhantomProvider } from "../App";

const useStyles = createStyles(() => ({
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    height: "100%",
    flexWrap: "wrap",
    padding: "10px 20px",
    borderBottom: "1px solid #e9ecef",
    maxWidth: "100%",
  },
}));

interface HeaderProps {
  provider: PhantomProvider | null;
  connected: boolean;
  publicKey: PublicKey | null;
}

function Header({ provider, connected, publicKey }: HeaderProps) {
  const { classes } = useStyles();

  const connectHandler = useCallback(() => {
    provider?.connect().catch((err) => {
      console.error("connect ERROR:", err);
    });
  }, [provider]);

  const disconnectHandler = useCallback(() => {
    provider?.disconnect().catch((err) => {
      console.error("disconnect ERROR:", err);
    });
  }, [provider]);

  return (
    <Container className={classes.header} mb={20}>
      {provider !== null ? (
        <>
          {connected ? (
            <>
              <p>Public key: {publicKey?.toBase58()}</p>

              <Button onClick={disconnectHandler}>
                Disconnect from Phantom
              </Button>
            </>
          ) : (
            <Button disabled={connected} onClick={connectHandler}>
              Connect to Phantom
            </Button>
          )}
        </>
      ) : (
        <>
          <p>Phantom is not available.</p>
        </>
      )}
    </Container>
  );
}

export default memo(Header);
