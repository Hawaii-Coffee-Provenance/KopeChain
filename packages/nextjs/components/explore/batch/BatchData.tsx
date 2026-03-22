"use client";

import { useEffect, useState } from "react";
import BatchFunction from "./BatchFunction";
import DataRow from "./DataRow";
import { Hash, Transaction, TransactionReceipt, formatEther, formatUnits } from "viem";
import { usePublicClient } from "wagmi";
import BlockieAddressLink from "~~/components/explore/BlockieAddressLink";
import TxHashLink from "~~/components/explore/TxHashLink";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";
import { decodeTransactionData as decodeFunction } from "~~/utils/scaffold-eth";

export type DecodedTx = Transaction & {
  functionName?: string;
  functionArgNames?: string[];
  functionArgTypes?: string[];
  functionArgs?: any[];
};

const BatchData = ({ txHash, title, batchNumber }: { txHash: Hash; title?: string; batchNumber: string }) => {
  const client = usePublicClient();
  const { targetNetwork } = useTargetNetwork();

  const [txData, setTxData] = useState<{ tx: DecodedTx; receipt: TransactionReceipt } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!txHash || !client) return;

    const fetchTx = async () => {
      try {
        setIsLoading(true);
        const tx = await client.getTransaction({ hash: txHash });
        const receipt = await client.getTransactionReceipt({ hash: txHash });
        const decoded = decodeFunction(tx as any) as DecodedTx;

        setTxData({ tx: decoded, receipt });
      } catch (e) {
        console.error("Error fetching transaction:", e);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTx();
  }, [client, txHash]);

  if (isLoading || !txData) return null;

  const { tx: txDecoded, receipt } = txData;

  return (
    <div className="flex flex-col w-full text-base-content pb-6">
      <div className="text-label text-base! mb-2 mt-2">{title || "Blockchain Data"}</div>

      <DataRow title="TX Hash">
        <TxHashLink txHash={txDecoded.hash} disableTruncation={true} href={`/explore/batch/${batchNumber}`} />
      </DataRow>

      <DataRow title="Block" value={`#${Number(receipt.blockNumber)}`} />

      <DataRow title="From">
        <BlockieAddressLink address={txDecoded.from} disableTruncation={true} />
      </DataRow>

      <DataRow title="To">
        {receipt?.contractAddress ? (
          <BlockieAddressLink address={receipt.contractAddress} disableTruncation={true} />
        ) : (
          <BlockieAddressLink address={txDecoded.to || ""} disableTruncation={true} />
        )}
      </DataRow>

      <DataRow title="Value" value={`${formatEther(txDecoded.value || 0n)} ${targetNetwork.nativeCurrency.symbol}`} />

      <DataRow
        title="Gas Price"
        value={`${Number(formatUnits(txDecoded.gasPrice || 0n, 9))
          .toFixed(8)
          .replace(/\.?0+$/, "")} Gwei`}
      />

      <DataRow title="Function" itemsStart={true}>
        <BatchFunction tx={txDecoded} />
      </DataRow>

      <DataRow title="Selector" value={txDecoded.input.substring(0, 10)} hasBorder={false} />
    </div>
  );
};

export default BatchData;
