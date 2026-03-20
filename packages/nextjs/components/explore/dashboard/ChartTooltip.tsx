import React from "react";

type ChartTooltipProps = {
  active?: boolean;
  label: React.ReactNode;
  value: React.ReactNode;
  labelColor?: string;
  subtitle?: React.ReactNode;
  subtitleClassName?: string;
};

const ChartTooltip = ({ active, label, value, labelColor, subtitle, subtitleClassName }: ChartTooltipProps) => {
  if (!active) return null;

  return (
    <div className="bg-base-100 border border-base-300 rounded-lg px-3 py-1 text-xs whitespace-nowrap shadow-sm pointer-events-none">
      <span className="font-semibold text-base-content" style={labelColor ? { color: labelColor } : undefined}>
        {label}
      </span>
      <span className="text-muted ml-2">{value} batches</span>
      {subtitle && <div className={`${subtitleClassName || ""} mt-0.5 font-medium`}>{subtitle}</div>}
    </div>
  );
};

export default ChartTooltip;
