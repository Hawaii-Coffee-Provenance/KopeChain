import { useMemo } from "react";
import { BatchSearch } from "~~/components/explore/BatchSearch";
import { useCoffeeTrackerBatches, useCoffeeTrackerMainPageStats } from "~~/hooks/useCoffeeTracker";

const WEEK_IN_SECONDS = 7 * 24 * 60 * 60;

export const DashboardSection = () => {
  const { batchCount, verifiedCount, transactionCount, farmCount } = useCoffeeTrackerMainPageStats();
  const { allBatches } = useCoffeeTrackerBatches();

  const newBatchesThisWeek = useMemo(() => {
    if (!allBatches) return 0;

    const cutoff = BigInt(Math.floor(Date.now() / 1000) - WEEK_IN_SECONDS);

    return allBatches.filter(batch => batch.mintTimestamp >= cutoff).length;
  }, [allBatches]);

  return (
    <div className="flex flex-col justify-center px-8 lg:pr-32 py-20 gap-6">
      <BatchSearch redirectToExplore />

      <div className="grid grid-cols-2 gap-px bg-base-300 border border-base-300 rounded-xl overflow-hidden">
        <div className="ghost-surface p-7 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">
            {batchCount ?? "---"}
          </div>
          <div className="text-muted uppercase tracking-[0.2em]">Total Batches</div>
        </div>

        <div className="ghost-surface p-7 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">
            {verifiedCount ?? "---"}
          </div>
          <div className="text-muted uppercase tracking-[0.2em]">Verified Batches</div>
        </div>

        <div className="ghost-surface p-7 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">
            {transactionCount ?? "---"}
          </div>
          <div className="text-muted uppercase tracking-[0.2em]">Total Transactions</div>
        </div>

        <div className="ghost-surface p-7 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">{farmCount}</div>
          <div className="text-muted uppercase tracking-[0.2em]">Registered Farms</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 bg-base-100 border border-base-300 rounded-xl text-sm text-secondary">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-success animate-ping"></div>
          <div className="status status-success"></div>
        </div>
        {newBatchesThisWeek ?? "-"} new batches tracked in the past week
      </div>
    </div>
  );
};
