import { ArrowUpIcon } from "@heroicons/react/24/solid";
import Skeleton from "~~/components/Skeleton";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";

type Trend = "up" | "down" | "neutral";

const DataDashboard = () => {
  const { stats, transactionCount, farmCount, isLoading } = useCoffeeTracker();

  const statItems: { label: string; value?: string; sub: React.ReactNode; trend?: Trend }[] = [
    {
      label: "Total Transactions",
      value: transactionCount?.toString(),
      trend: stats?.batchesToday ? "up" : "neutral",
      sub: stats?.batchesToday ? (
        <span className="inline-flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          {stats.batchesToday} today
        </span>
      ) : (
        "0 today"
      ),
    },
    {
      label: "Total Batches",
      value: stats?.totalBatches?.toString(),
      trend: stats?.batchesThisWeek ? "up" : "neutral",
      sub: stats?.batchesThisWeek ? (
        <span className="inline-flex items-center gap-1">
          <ArrowUpIcon className="w-3 h-3" />
          {stats.batchesThisWeek} this week
        </span>
      ) : (
        "No new batches"
      ),
    },
    {
      label: "Verified Batches",
      value: stats?.verifiedCount?.toString(),
      trend: (stats?.verifiedPercent ?? 0) >= 50 ? "up" : "neutral",
      sub: `${stats?.verifiedPercent ?? 0}% of total`,
    },
    {
      label: "Registered Farms",
      value: farmCount?.toString(),
      trend: "neutral",
      sub: `${stats?.islandCount ?? 0} islands`,
    },
    {
      label: "Avg SCA Score",
      value: stats?.averageScaScore?.toString(),
      trend: !stats?.averageScaScore ? "neutral" : Number(stats.averageScaScore) >= 85 ? "up" : "down",
      sub: stats?.scaLabel,
    },
    {
      label: "Total Harvest Weight",
      value: stats?.totalWeightDisplay,
      trend: "neutral",
      sub: "kg across all batches",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 min-h-[150px] gap-px bg-base-300 border border-base-300 rounded-xl overflow-hidden shadow-sm mb-6">
      {statItems.map(({ label, value, sub, trend }) => (
        <div key={label} className="card-surface p-7 transition-colors flex flex-col h-full gap-4">
          {isLoading ? (
            <>
              <div className="shrink-0">
                <Skeleton className="h-4 w-16" />
              </div>
              <div className="flex-1 flex flex-col justify-center">
                <Skeleton className="h-10 w-20 mb-2" />
                <Skeleton className="h-3 w-16" />
              </div>
            </>
          ) : (
            <>
              <div className="text-hint uppercase tracking-widest shrink-0">{label}</div>
              <div className="flex-1 flex flex-col justify-center">
                <div className="font-serif text-3xl xl:text-5xl font-light text-base-content leading-none mb-1">
                  {value ?? "—"}
                </div>
                <p
                  className={`text-xs mt-2 ${trend === "up" ? "text-primary" : trend === "down" ? "text-accent" : "text-muted"}`}
                >
                  {sub}
                </p>
              </div>
            </>
          )}
        </div>
      ))}
    </div>
  );
};

export default DataDashboard;
