"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import BatchTable from "../explore/table/BatchTable";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";
import { CoffeeBatch } from "~~/types/coffee";

const RECENT_LIMIT = 5;

const ActivitySection = () => {
  const { stats, txHashMap, isLoading } = useCoffeeTracker({ includeTxHashes: true });
  const allBatches = stats?.allBatches;
  const router = useRouter();

  const recentBatches = useMemo(
    () => [...((allBatches as unknown as CoffeeBatch[]) ?? [])].reverse().slice(0, RECENT_LIMIT),
    [allBatches],
  );

  return (
    <div className="max-w-7xl w-full">
      <div className="flex items-end justify-between mb-10">
        <div>
          <span className="text-label text-primary! mb-3 block">Fresh Off the Chain</span>
          <h2 className="heading-section">
            <span className="font-semibold">Recent Ledger Activity</span>
          </h2>
        </div>

        <div
          onClick={() => router.push("/explore")}
          className="flex items-center gap-1.5 cursor-pointer text-primary border-b border-transparent hover:border-primary transition-colors"
        >
          <span className="text-inline-action text-base! whitespace-nowrap">Explore All</span>
          <ArrowRightIcon className="h-4 w-4" />
        </div>
      </div>

      <BatchTable
        batches={isLoading ? undefined : recentBatches}
        isLoading={isLoading}
        txHashMap={Object.fromEntries(Object.entries(txHashMap).map(([k, v]) => [k, v?.harvested || "0x0"]))}
      />
    </div>
  );
};

export default ActivitySection;
