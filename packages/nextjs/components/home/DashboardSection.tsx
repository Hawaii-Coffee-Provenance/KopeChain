import { BatchSearch } from "~~/components/explore/table/BatchSearch";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";

export const DashboardSection = () => {
  const { stats, transactionCount, farmCount } = useCoffeeTracker();

  const batchCount = stats?.totalBatches;
  const verifiedCount = stats?.verifiedCount;
  const newBatchesThisWeek = stats?.batchesThisWeek;

  return (
    <div className="flex flex-col justify-center section-padding lg:pr-32 py-20 gap-6">
      <BatchSearch redirectToExplore />

      <div className="grid grid-cols-2 gap-px bg-base-300 border border-base-300 rounded-xl overflow-hidden">
        <div className="ghost-surface p-7 transition-colors flex flex-col justify-between h-full">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">{batchCount ?? "-"}</div>
          <div className="text-hint uppercase tracking-[0.2em]">Total Batches</div>
        </div>

        <div className="ghost-surface p-7 transition-colors flex flex-col justify-between h-full">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">
            {verifiedCount ?? "-"}
          </div>
          <div className="text-hint uppercase tracking-[0.2em]">Verified Batches</div>
        </div>

        <div className="ghost-surface p-7 transition-colors flex flex-col justify-between h-full">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">
            {transactionCount ?? "-"}
          </div>
          <div className="text-hint uppercase tracking-[0.2em]">Total Transactions</div>
        </div>

        <div className="ghost-surface p-7 transition-colors flex flex-col justify-between h-full">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">{farmCount ?? "-"}</div>
          <div className="text-hint uppercase tracking-[0.2em]">Registered Farms</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 bg-base-100 border border-base-300 rounded-xl text-sm text-hint">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-success animate-ping"></div>
          <div className="status status-success"></div>
        </div>
        {newBatchesThisWeek ?? "-"} new batches tracked in the past week
      </div>
    </div>
  );
};
