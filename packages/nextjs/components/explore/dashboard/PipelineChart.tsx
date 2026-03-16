"use client";

import { useState } from "react";
import { ChartTooltip } from "./ChartTooltip";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PipelineData } from "~~/types/coffee";
import { PIPELINE_SEGMENTS } from "~~/utils/coffee";

export const PipelineChart = ({ data, total }: { data: PipelineData; total: number }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const chartData = [data];

  const renderTooltip = ({ active }: any) => {
    if (!active || !hoveredKey) return null;

    const seg = PIPELINE_SEGMENTS.find(s => s.key === hoveredKey);

    if (!seg) return null;

    return (
      <ChartTooltip
        active={active}
        label={seg.label}
        value={data[seg.key as keyof PipelineData]}
        labelColor={seg.color}
      />
    );
  };

  return (
    <div className="relative w-full">
      <ResponsiveContainer width="100%" height={48}>
        <BarChart data={chartData} layout="vertical" barSize={16} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis type="number" hide domain={[0, total]} />
          <YAxis type="category" hide />
          <Tooltip content={renderTooltip} cursor={false} />
          {PIPELINE_SEGMENTS.map((seg, i) => (
            <Bar
              key={seg.key}
              dataKey={seg.key}
              stackId="pipeline"
              fill={seg.color}
              radius={i === 0 ? [4, 0, 0, 4] : i === PIPELINE_SEGMENTS.length - 1 ? [0, 4, 4, 0] : [0, 0, 0, 0]}
              onMouseEnter={() => setHoveredKey(seg.key)}
              onMouseMove={() => setHoveredKey(seg.key)}
              onMouseLeave={() => setHoveredKey(null)}
            >
              <Cell fill={seg.color} fillOpacity={hoveredKey === seg.key ? 1 : 0.8} />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
