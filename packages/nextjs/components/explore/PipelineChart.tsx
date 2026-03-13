"use client";

import { useState } from "react";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { PIPELINE_SEGMENTS, PipelineData } from "~~/types/coffee";

export const PipelineChart = ({ data }: { data: PipelineData }) => {
  const [hoveredKey, setHoveredKey] = useState<string | null>(null);
  const chartData = [data];

  const renderTooltip = ({ active }: any) => {
    if (!active || !hoveredKey) return null;

    const seg = PIPELINE_SEGMENTS.find(s => s.key === hoveredKey);

    if (!seg) return null;

    return (
      <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-1 text-xs whitespace-nowrap">
        <span style={{ color: seg.color }} className="font-semibold">
          {seg.label}
        </span>
        <span className="text-muted ml-2">{data[seg.key as keyof PipelineData]} batches</span>
      </div>
    );
  };

  return (
    <div className="relative">
      <ResponsiveContainer width="100%" height={48}>
        <BarChart data={chartData} layout="vertical" barSize={16} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <XAxis type="number" hide />
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
