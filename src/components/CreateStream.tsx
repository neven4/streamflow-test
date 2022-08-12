import { Button, Group, NativeSelect, Paper, TextInput } from "@mantine/core";
import { PublicKey } from "@solana/web3.js";
import {
  ChangeEvent,
  FormEvent,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getTokenAccounts } from "../api/getTokenAccounts";
import { CreateParams, getBN } from "@streamflow/stream";
import { TokenInfo } from "@solana/spl-token-registry";
import { PhantomProvider, TokenByAddressMap } from "../App";
import { getNowInSeconds } from "../utils/nowInSeconds";
import { createStream } from "../api/createStream";

type ParsedTokenAccount = {
  isNative: boolean;
  mint: string;
  owner: string;
  state: string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
  tokenInfo?: TokenInfo;
};

interface CreateStreamProps {
  publicKey: PublicKey | null;
  tokenMap: TokenByAddressMap;
  provider: PhantomProvider | null;
  goToShowPage: () => void;
}

interface FormValues {
  recipient: string;
  name: string;
  tokenAddress: string;
  period: number;
  amount: number;
}

function CreateStream({
  publicKey,
  tokenMap,
  provider,
  goToShowPage,
}: CreateStreamProps) {
  const [parsedTokenAccounts, setParsedTokenAccounts] = useState<
    ParsedTokenAccount[]
  >([]);
  const [formValues, setFormValues] = useState<FormValues>({
    recipient: "",
    tokenAddress: "",
    name: "",
    period: 1,
    amount: 10,
  });

  useEffect(() => {
    async function fetchTokenAccounts() {
      try {
        if (publicKey === null) {
          return;
        }

        const tokenAccounts = await getTokenAccounts(publicKey);

        const parsedTokenAccounts: ParsedTokenAccount[] = [];

        tokenAccounts?.value?.forEach((tokenData) => {
          const parsedTokenInfo = tokenData.account.data.parsed.info;

          if (parsedTokenInfo.tokenAmount.uiAmount > 0) {
            parsedTokenAccounts.push({
              ...parsedTokenInfo,
              tokenInfo: tokenMap.get(parsedTokenInfo.mint),
            });
          }
        });

        setParsedTokenAccounts(parsedTokenAccounts);

        setFormValues((prevFormValues) => ({
          ...prevFormValues,
          tokenAddress: parsedTokenAccounts[0]?.tokenInfo?.address ?? "",
        }));
      } catch (e) {
        console.log(e);
      }
    }

    fetchTokenAccounts();
  }, [publicKey, tokenMap]);

  const createStreamWithFormValues = useCallback(async () => {
    try {
      const tokenInfo = tokenMap.get(formValues.tokenAddress);

      const decimals = tokenInfo?.decimals || 10;

      const nowInSeconds = getNowInSeconds();

      const createStreamParams: CreateParams = {
        //@ts-ignore
        sender: provider,
        recipient: formValues.recipient,
        mint: formValues.tokenAddress,
        start: nowInSeconds + 60,
        depositedAmount: getBN(formValues.amount, decimals),
        period: formValues.period,
        cliff: nowInSeconds + 120,
        cliffAmount: getBN(1, decimals),
        amountPerPeriod: getBN(1, decimals),
        name: formValues.name,
        canTopup: true,
        cancelableBySender: true,
        cancelableByRecipient: false,
        transferableBySender: true,
        transferableByRecipient: false,
        automaticWithdrawal: true,
        partner: null,
      };

      await createStream(createStreamParams);

      alert("Stream created successfully!");

      goToShowPage();
    } catch (exception) {
      console.error(exception);

      alert(exception);
    }
  }, [formValues, provider, goToShowPage, tokenMap]);

  const tokenAccountsForSelect = useMemo(
    () =>
      parsedTokenAccounts.map((accountData) => {
        return {
          label: accountData.tokenInfo?.symbol ?? "",
          value: accountData.tokenInfo?.address ?? "",
        };
      }),
    [parsedTokenAccounts]
  );

  const onFormInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const { name, value } = event.target;

      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [name]: value,
      }));
    },
    []
  );

  const onSelectInputChange = useCallback(
    (event: ChangeEvent<HTMLSelectElement>) => {
      const { name, value } = event.target;

      setFormValues((prevFormValues) => ({
        ...prevFormValues,
        [name]: value,
      }));
    },
    []
  );

  const handleSubmit = useCallback(
    (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();

      createStreamWithFormValues();
    },
    [createStreamWithFormValues]
  );

  return (
    <Paper radius="md" p="xl">
      <form onSubmit={handleSubmit}>
        <Group grow mb="md" mt="md" align="top">
          <TextInput
            key="amount"
            type="number"
            placeholder="100"
            label="Transfer amount"
            name="amount"
            value={formValues.amount}
            onChange={onFormInputChange}
          />

          <NativeSelect
            data={tokenAccountsForSelect}
            label="Currency"
            name="tokenAddress"
            value={formValues.tokenAddress}
            onChange={onSelectInputChange}
            disabled={!parsedTokenAccounts.length}
            error={
              !parsedTokenAccounts.length
                ? "You must have currency in your wallet to create a stream"
                : ""
            }
          />
        </Group>

        <TextInput
          label="Stream name"
          placeholder="Stream name"
          name="name"
          value={formValues.name}
          onChange={onFormInputChange}
          mb="md"
        />

        <TextInput
          label="Recipient address"
          placeholder="Recipient address"
          name="recipient"
          value={formValues.recipient}
          onChange={onFormInputChange}
          mb="md"
        />

        <TextInput
          key="period"
          type="number"
          label="Period (Time step in seconds)"
          placeholder="Period"
          name="period"
          value={formValues.period}
          onChange={onFormInputChange}
          mb="md"
        />

        <Button type="submit" disabled={!parsedTokenAccounts.length}>
          Create new stream
        </Button>
      </form>
    </Paper>
  );
}

export default memo(CreateStream);
