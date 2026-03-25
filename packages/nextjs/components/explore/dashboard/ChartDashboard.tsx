import PipelineChart from "./PipelineChart";
import RegionChart from "./RegionChart";
import ScaChart from "./ScaChart";
import Skeleton from "~~/components/Skeleton";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";
import { PIPELINE_SEGMENTS, getRegionColor } from "~~/utils/coffee";

type Stats = NonNullable<ReturnType<typeof useCoffeeTracker>["stats"]>;
type CardProps = { stats: Stats | null; isLoading: boolean };

const skeleton = <Skeleton className="h-16 rounded-lg mt-3" />;

const PipelineLegend = ({ stats, isLoading, total }: CardProps & { total: number }) => {
  return (
    <div className="flex flex-col gap-2">
      {/* Segment Data */}
      {PIPELINE_SEGMENTS.map(seg => {
        const count = stats?.pipeline?.[seg.key] ?? 0;
        const percent = total > 0 ? Math.round((count / total) * 100) : 0;

        return (
          <div key={seg.key} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLoading ? "bg-base-300 animate-pulse" : ""}`}
                style={{ backgroundColor: isLoading ? "" : seg.color }}
              />
              <span className="text-xs text-base-content">{seg.label}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted tabular-nums">{isLoading ? "—" : count}</span>
              <span className="text-xs text-muted tabular-nums w-7 text-right">{isLoading ? "—%" : `${percent}%`}</span>
            </div>
          </div>
        );
      })}

      {/* Verified Data */}
      <div className="flex items-center justify-between pt-2 border-t border-base-300">
        <div className="flex items-center gap-2">
          <div
            className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLoading ? "bg-base-300 animate-pulse" : "bg-primary"}`}
          />
          <span className="text-xs text-base-content">Verified</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-muted tabular-nums">{isLoading ? "—" : (stats?.verifiedCount ?? "—")}</span>
          <span className="text-xs text-muted tabular-nums w-7 text-right">
            {isLoading ? "—%" : `${total > 0 ? Math.round(((stats?.verifiedCount ?? 0) / total) * 100) : 0}%`}
          </span>
        </div>
      </div>
    </div>
  );
};

const PipelineCard = ({ stats, isLoading }: CardProps) => {
  const total = stats?.totalBatches ?? 0;

  return (
    <div className="card-surface hover:!bg-base-100 p-7 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-label text-muted">Supply Chain Pipeline</div>
        <div className="text-muted text-xs">{isLoading ? "—" : (stats?.totalBatches ?? "—")} batches</div>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-4">
        {/* Chart / Skeleton */}
        {isLoading ? skeleton : stats?.pipeline ? <PipelineChart data={stats.pipeline} total={total} /> : null}

        <PipelineLegend stats={stats} isLoading={isLoading} total={total} />
      </div>
    </div>
  );
};

const RegionLegend = ({ stats, isLoading }: CardProps) => {
  const defaultRegions = ["Kona", "Ka'ū", "Puna", "Hamakua", "Maui", "Kauai", "Molokai", "Oahu"].map(name => ({
    name,
    count: 0,
  }));

  const displayData = isLoading || !stats?.regionCounters?.length ? defaultRegions : stats.regionCounters;

  const total = displayData.reduce((s, d) => s + d.count, 0);

  return (
    <div className="flex-1 flex flex-col justify-center gap-[7px] min-w-0">
      {displayData.map(entry => {
        const pct = total > 0 ? Math.round((entry.count / total) * 100) : 0;

        return (
          <div key={entry.name} className="flex items-center justify-between cursor-default">
            {/* Region Name & Dot */}
            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${isLoading ? "bg-base-300 animate-pulse" : ""}`}
                style={{ backgroundColor: isLoading ? "" : getRegionColor(entry.name) }}
              />

              <span className="text-xs text-base-content truncate" title={entry.name}>
                {entry.name}
              </span>
            </div>

            {/* Count & Percentage */}
            <div className="flex items-center gap-3 flex-shrink-0 ml-2">
              <span className="text-xs text-muted tabular-nums">{isLoading ? "—" : entry.count}</span>
              <span className="text-xs text-muted tabular-nums w-7 text-right">{isLoading ? "—" : `${pct}%`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const RegionCard = ({ stats, isLoading }: CardProps) => {
  return (
    <div className="card-surface hover:!bg-base-100 p-7 flex flex-col gap-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-label text-muted">Batches By Region</div>
        <div className="text-muted text-xs">{stats?.regionCounters?.length ?? "—"} regions</div>
      </div>

      <div className="flex-1 flex flex-row items-center justify-between w-full h-[220px] gap-2">
        {/* Chart / Skeleton */}
        <div className="w-[45%] h-full shrink-0">
          <RegionChart data={stats?.regionCounters ?? []} isLoading={isLoading} />
        </div>

        {/* Extracted Legend */}
        <RegionLegend stats={stats} isLoading={isLoading} />
      </div>
    </div>
  );
};

const ScaLegend = ({ stats }: { stats: Stats | null }) => (
  <div className="grid grid-cols-4 gap-px overflow-hidden w-full mt-2">
    {[
      { label: "Highest", value: stats?.highestSca ?? "—", cls: "text-primary" },
      { label: "Average", value: stats?.averageScaScore ?? "—", cls: "text-primary" },
      { label: "Lowest", value: stats?.lowestSca ?? "—", cls: "text-accent" },
      { label: "Scored", value: stats?.scaBuckets?.reduce((s, b) => s + b.count, 0) ?? "—", cls: "text-primary" },
    ].map(({ label, value, cls }) => (
      <div key={label} className="px-2 py-2.5 flex flex-col items-center gap-0.5">
        <span className={`font-serif text-xl font-light leading-none ${cls}`}>{value}</span>
        <span className="text-xs font-medium tracking-wide uppercase text-muted">{label}</span>
      </div>
    ))}
  </div>
);

const ScaCard = ({ stats, isLoading }: CardProps) => (
  <div className="card-surface hover:!bg-base-100 p-7 flex flex-col gap-4 h-full">
    {/* Header */}
    <div className="flex items-center justify-between">
      <div className="text-label text-muted">SCA Score Distribution</div>
      <div className="text-muted text-xs">Specialty ≥ 80</div>
    </div>

    <div className="flex-1 flex flex-col gap-2 w-full items-center justify-center">
      {/* Chart / Skeleton */}
      <div className="w-full">
        {isLoading ? skeleton : stats?.scaBuckets ? <ScaChart data={stats.scaBuckets} /> : null}
      </div>

      {/* Extracted Legend */}
      <ScaLegend stats={stats} />
    </div>
  </div>
);

const ChartDashboard = () => {
  const { stats, isLoading } = useCoffeeTracker();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 min-h-[300px] gap-px bg-base-300 border border-base-300 rounded-xl overflow-hidden shadow-sm mb-6">
      <PipelineCard stats={stats} isLoading={isLoading} />
      <RegionCard stats={stats} isLoading={isLoading} />
      <ScaCard stats={stats} isLoading={isLoading} />
    </div>
  );
};

export default ChartDashboard;
