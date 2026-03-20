"use client";

import ChartTooltip from "./ChartTooltip";
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { ScaBucket } from "~~/types/coffee";
import { getScaTier } from "~~/utils/coffee";

const ScaChart = ({ data }: { data: ScaBucket[] }) => {
  const renderTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    const tier = getScaTier(Number(label));

    return (
      <ChartTooltip
        active={active}
        label={`SCA ${label}–${Number(label) + 2}`}
        value={payload[0].value}
        subtitle={tier.label}
        subtitleClassName={tier.qualityClass}
      />
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

export default ScaChart;
