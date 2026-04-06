"use client";

import { useMemo } from "react";
import BatchAlbum from "./BatchAlbum";
import BatchInfo from "./BatchInfo";
import Skeleton from "~~/components/Skeleton";
import Map3D from "~~/components/map/Map3D";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";
import { CoffeeBatch } from "~~/types/coffee";

type BatchPageClientProps = {
  batchNumber: string;
};

const BatchPageClient = ({ batchNumber }: BatchPageClientProps) => {
  const { stats, txHashMap, isLoading } = useCoffeeTracker({ includeTxHashes: true });

  const batch = useMemo(() => {
    if (!stats?.allBatches) return null;

    return stats.allBatches.find((b: CoffeeBatch) => b.batchNumber === batchNumber) ?? null;
  }, [stats, batchNumber]);

  const isDataLoading = isLoading || !batch;

  return (
    <div className="w-full min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] flex flex-col lg:flex-row">
      <div className="w-full lg:w-1/3 flex flex-col p-10 gap-10 lg:h-full order-2 lg:order-1">
        <div className="flex-1 rounded-3xl bg-base-100 border border-base-300 min-h-[350px] aspect-square lg:aspect-auto relative overflow-hidden shadow-sm">
          {isDataLoading ? (
            <Skeleton className="absolute inset-0 w-full h-full rounded-3xl" />
          ) : (
            <Map3D
              className="absolute inset-0 w-full h-full"
              batches={batch ? [batch] : []}
              showJourney
              autoFitMarkers
            />
          )}
        </div>

        <div className="flex-1 rounded-3xl bg-base-100 border border-base-300 p-6 flex flex-col min-h-[350px] aspect-square lg:aspect-auto relative overflow-hidden shadow-sm">
          {isDataLoading ? (
            <Skeleton className="absolute inset-0 w-full h-full rounded-3xl" />
          ) : (
            <>
              <h2 className="text-label mb-4">Media & Certificates</h2>
              <div className="flex-1 min-h-0">
                <BatchAlbum batch={batch!} />
              </div>
            </>
          )}
        </div>
      </div>

      <div
        className="w-full lg:w-2/3 flex flex-col p-10 lg:h-full min-h-[700px] lg:min-h-0 order-1 lg:order-2"
        style={{ scrollbarWidth: "none" }}
      >
        {isDataLoading ? (
          <div className="w-full flex-1">
            <Skeleton className="w-full h-full rounded-3xl" />
          </div>
        ) : (
          <BatchInfo batch={batch!} txHashes={txHashMap[batch!.batchId.toString()]} />
        )}
      </div>
    </div>
  );
};

export default BatchPageClient;
