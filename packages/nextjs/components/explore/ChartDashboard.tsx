import { PipelineChart } from "./PipelineChart";
import { RegionChart } from "./RegionChart";
import { ScaChart } from "./ScaChart";
import { Skeleton } from "~~/components/Skeleton";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";
import { PIPELINE_SEGMENTS } from "~~/types/coffee";

type Stats = NonNullable<ReturnType<typeof useCoffeeTracker>["stats"]>;
type CardProps = { stats: Stats | null; isLoading: boolean };

const skeleton = <Skeleton className="h-16 rounded-lg mt-3" />;

const PipelineCard = ({ stats, isLoading }: CardProps) => {
  const total = stats?.totalBatches ?? 0;

  return (
    <div className="ghost-surface hover:!bg-base-100 p-7 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-label text-muted">Supply Chain Pipeline</div>
        <div className="text-muted text-xs">{stats?.verifiedCount ?? "—"} verified</div>
      </div>

      {/* Chart / Skeleton */}
      {isLoading ? skeleton : stats?.pipeline ? <PipelineChart data={stats.pipeline} /> : null}

      <div className="flex flex-col gap-2">
        {/* Segment Data */}
        {PIPELINE_SEGMENTS.map(seg => {
          const count = stats?.pipeline?.[seg.key] ?? 0;
          const percent = total > 0 ? Math.round((count / total) * 100) : 0;

          return (
            <div key={seg.key} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: seg.color }} />
                <span className="text-xs text-base-content">{seg.label}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted">{count}</span>
                <span className="text-xs text-muted w-7 text-right">{percent}%</span>
              </div>
            </div>
          );
        })}

        {/* Verified Data */}
        <div className="flex items-center justify-between pt-2 border-t border-base-300">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="text-xs text-base-content">Verified</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted">{stats?.verifiedCount ?? "—"}</span>
            <span className="text-xs text-muted w-7 text-right">
              {total > 0 ? Math.round(((stats?.verifiedCount ?? 0) / total) * 100) : 0}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const RegionCard = ({ stats, isLoading }: CardProps) => (
  <div className="ghost-surface hover:!bg-base-100 p-7 flex flex-col gap-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="text-label text-muted">Batches By Region</div>
      <div className="text-muted text-xs">{stats?.regionCounters?.length ?? "—"} regions</div>
    </div>

    {/* Chart / Skeleton */}
    {isLoading ? skeleton : stats?.regionCounters ? <RegionChart data={stats.regionCounters} /> : null}
  </div>
);

const ScaCard = ({ stats, isLoading }: CardProps) => (
  <div className="ghost-surface hover:!bg-base-100 p-7 flex flex-col gap-4">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="text-label text-muted">SCA Score Distribution</div>
      <div className="text-muted text-xs">Specialty ≥ 80</div>
    </div>

    <div className="flex flex-col gap-2 my-auto">
      {/* Chart / Skeleton */}
      {isLoading ? skeleton : stats?.scaBuckets ? <ScaChart data={stats.scaBuckets} /> : null}

      {/* Score Data */}
      <div className="grid grid-cols-4 gap-px overflow-hidden">
        {[
          { label: "Highest", value: stats?.highestSca ?? "—", cls: "text-primary" },
          { label: "Average", value: stats?.averageScaScore ?? "—", cls: "text-primary" },
          { label: "Lowest", value: stats?.lowestSca ?? "—", cls: "text-accent" },
          { label: "Scored", value: stats?.scaBuckets?.reduce((s, b) => s + b.count, 0) ?? "—", cls: "text-primary" },
        ].map(({ label, value, cls }) => (
          <div key={label} className="px-2 py-2.5 flex flex-col items-center gap-0.5">
            <span className={`font-serif text-xl font-light leading-none ${cls}`}>{value}</span>
            <span className="text-[0.58rem] font-medium tracking-[0.15em] uppercase text-muted">{label}</span>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const ChartDashboard = () => {
  const { stats, isLoading } = useCoffeeTracker();
  return (
    <div className="overflow-x-auto mb-6">
      <div className="grid grid-cols-3 min-w-[640px] gap-px bg-base-300 border border-base-300 rounded-xl overflow-hidden">
        <PipelineCard stats={stats} isLoading={isLoading} />
        <RegionCard stats={stats} isLoading={isLoading} />
        <ScaCard stats={stats} isLoading={isLoading} />
      </div>
    </div>
  );
};
