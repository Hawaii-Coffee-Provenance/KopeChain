"use client";

import { useEffect, useState } from "react";
import TransactionInfo from "./TransactionInfo";
import { Hash } from "viem";
import { Skeleton } from "~~/components/Skeleton";
import { Map3D } from "~~/components/map/Map3D";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";

type TransactionPageClientProps = {
  txHash: Hash;
};

const TransactionPageClient = ({ txHash }: TransactionPageClientProps) => {
  const { stats, txHashMap, isLoading } = useCoffeeTracker();
  const [batch, setBatch] = useState<any | null>(null);

  useEffect(() => {
    if (!stats?.allBatches || !txHashMap) return;

    const found = stats.allBatches.find((b: any) => {
      const hashes = txHashMap[b.batchId?.toString?.()];

      if (!hashes) return false;

      return Object.values(hashes).includes(txHash);
    });

    setBatch(found ?? null);
  }, [stats, txHashMap, txHash]);

  const isDataLoading = isLoading || !batch;

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)]">
      <div className="w-full lg:w-1/3 flex flex-col gap-6 section-padding py-6 lg:h-full lg:border-r border-base-300 order-2 lg:order-1">
        <div className="flex-1 rounded-3xl overflow-hidden min-h-[350px] relative bg-base-200 aspect-square lg:aspect-auto">
          {isDataLoading ? (
            <Skeleton className="absolute inset-0 w-full h-full rounded-3xl" />
          ) : (
            <Map3D className="absolute inset-0 w-full h-full" batches={[batch]} showJourney />
          )}
        </div>

        {/* TODO: IMPLEMENT BATCH MEDIA/IPFS/CERTIFICATE */}
        <div className="flex-1 rounded-3xl bg-base-100 border border-base-300 p-8 flex flex-col min-h-[350px] aspect-square lg:aspect-auto relative overflow-hidden">
          {isDataLoading ? (
            <Skeleton className="absolute inset-0 w-full h-full rounded-3xl" />
          ) : (
            <h2 className="text-label mb-6">Media & Certificates</h2>
          )}
        </div>
      </div>

      <div
        className="w-full lg:w-2/3 flex flex-col lg:h-full min-h-[600px] lg:min-h-0 order-1 lg:order-2 section-padding py-6 lg:p-0"
        style={{ scrollbarWidth: "none" }}
      >
        {isDataLoading ? (
          <div className="w-full h-full lg:h-[calc(100vh-4rem)] lg:p-6">
            <Skeleton className="w-full h-full rounded-3xl" />
          </div>
        ) : (
          <TransactionInfo batch={batch} txHashes={txHashMap[batch.batchId.toString()]} />
        )}
      </div>
    </div>
  );
};

export default TransactionPageClient;
