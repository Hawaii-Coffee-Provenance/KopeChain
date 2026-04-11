"use client";

import { useState } from "react";
import ChartTooltip from "./ChartTooltip";
import { Cell, Pie, PieChart as RechartsPieChart, Tooltip } from "recharts";
import { RegionData } from "~~/types/coffee";
import { getRegionColor } from "~~/utils/coffee";

const DEFAULT_REGIONS = ["Kona", "Ka'ū", "Puna", "Hamakua", "Maui", "Kauai", "Molokai", "Oahu"].map(name => ({
  name,
  count: 0,
}));

const RegionChart = ({ data, isLoading }: { data: RegionData; isLoading?: boolean }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);

  const displayData = isLoading || !data?.length ? DEFAULT_REGIONS : data;

  const renderTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length || isLoading) return null;
    const entry = payload[0].payload;
    return <ChartTooltip active={active} label={entry.name} value={entry.count} />;
  };

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="w-full aspect-square rounded-full bg-base-300 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      <RechartsPieChart width={200} height={200} style={{ width: "100%", height: "100%" }}>
        <Tooltip content={renderTooltip} cursor={false} />
        <Pie
          data={displayData}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius="50%"
          outerRadius="100%"
          paddingAngle={2}
          stroke="none"
          isAnimationActive={false}
          onMouseEnter={(d: any) => setHoveredKey(d.name ?? null)}
          onMouseLeave={() => setHoveredKey(null)}
        >
          {displayData.map(entry => (
            <Cell
              key={entry.name}
              fill={getRegionColor(entry.name)}
              opacity={hoveredKey && hoveredKey !== entry.name ? 0.25 : 1}
              style={{ transition: "opacity 0.15s", outline: "none" }}
            />
          ))}
        </Pie>
      </RechartsPieChart>
    </div>
  );
};

export default RegionChart;
