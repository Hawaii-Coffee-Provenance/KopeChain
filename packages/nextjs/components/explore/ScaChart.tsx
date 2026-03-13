"use client";

import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScaBucket, getScaTier } from "~~/types/coffee";

export const ScaChart = ({ data }: { data: ScaBucket[] }) => {
  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const tier = getScaTier(Number(label));

    return (
      <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-1 text-xs whitespace-nowrap">
        <span className="font-semibold text-base-content">
          SCA {label}–{Number(label) + 2}
        </span>
        <span className="text-muted ml-2">{payload[0].value} batches</span>
        <div className={`${tier.qualityClass} mt-0.5`}>{tier.label}</div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={100}>
      <BarChart data={data} barSize={18} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <XAxis
          dataKey="score"
          tick={{ fontSize: 10, fontFamily: "Outfit", fill: "var(--color-base-content)", opacity: 0.8 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis hide />
        <Tooltip content={renderTooltip} cursor={{ fill: "var(--color-base-300)", opacity: 0.5 }} />
        <Bar dataKey="count" radius={[3, 3, 0, 0]}>
          {data.map(entry => (
            <Cell key={entry.score} fill={getScaTier(Number(entry.score)).color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};
