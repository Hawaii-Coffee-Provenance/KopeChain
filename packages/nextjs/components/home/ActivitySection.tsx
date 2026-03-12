"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { BatchTable } from "../explore/BatchTable";
import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useCoffeeBatchTxHashes, useCoffeeTrackerBatches } from "~~/hooks/useCoffeeTracker";
import { CoffeeBatch } from "~~/types/coffee";

const RECENT_LIMIT = 5;

export const ActivitySection = () => {
  const { allBatches, isLoading } = useCoffeeTrackerBatches();
  const { txHashMap } = useCoffeeBatchTxHashes();
  const router = useRouter();

  const recentBatches = useMemo(
    () => [...((allBatches as unknown as CoffeeBatch[]) ?? [])].reverse().slice(0, RECENT_LIMIT),
    [allBatches],
  );

  return (
    <section className="w-full bg-base-200 py-20 border-t border-b border-base-300 overflow-x-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="mb-8">
          <span className="text-label text-primary mb-3 block">Fresh Off the Chain</span>
          <h2 className="heading-section">
            <span className="font-semibold">Recent Ledger Activity</span>
          </h2>
        </div>

        <div className="flex justify-end mb-4">
          <div
            onClick={() => router.push("/explore")}
            className="flex items-center gap-1.5 cursor-pointer text-primary border-b border-transparent hover:border-primary pb-0.5 transition-colors"
          >
            <span className="text-nav-link">Explore All</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </div>
        </div>

        <BatchTable batches={isLoading ? undefined : recentBatches} isLoading={isLoading} txHashMap={txHashMap} />
      </div>
    </section>
  );
};
