"use client";

import { BatchFilterState, REGIONS, STAGES, SortOrder, StageFilter } from "~~/types/coffee";

type BatchFilterBarProps = BatchFilterState & {
  onChange: (next: BatchFilterState) => void;
  onClear?: () => void;
  pageSize?: number;
  onPageSizeChange?: (size: number) => void;
};

const STAGE_FILTERS: StageFilter[] = ["All", ...STAGES, "Verified"];

export const BatchFilterBar = ({
  stage,
  region,
  sort,
  onChange,
  onClear,
  pageSize,
  onPageSizeChange,
}: BatchFilterBarProps) => {
  return (
    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-label text-secondary mr-1">Stage</span>
        {STAGE_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => onChange({ stage: s, region, sort })}
            className={`btn btn-xs rounded-full border ${
              stage === s
                ? "btn-primary"
                : "btn-ghost border-base-300 text-secondary hover:border-primary hover:text-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {onClear && (
          <button
            onClick={onClear}
            className="btn btn-xs rounded-full border btn-ghost border-base-300 text-secondary hover:border-error hover:text-error"
          >
            Clear
          </button>
        )}
        {onPageSizeChange && (
          <select
            className="select select-sm appearance-none"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            {[5, 10, 50, 100].map(n => (
              <option key={n} value={n}>
                {n} results
              </option>
            ))}
          </select>
        )}
        <select
          className="select select-sm appearance-none"
          value={region}
          onChange={e => onChange({ stage, region: e.target.value, sort })}
        >
          <option value="all">All Regions</option>
          {Object.entries(REGIONS).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </select>

        <select
          className="select select-sm appearance-none"
          value={sort}
          onChange={e => onChange({ stage, region, sort: e.target.value as SortOrder })}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </div>
  );
};
