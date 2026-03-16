"use client";

import { BatchSearch } from "./BatchSearch";
import { BatchFilterState, SortOrder, StageFilter } from "~~/types/coffee";
import { REGIONS, STAGES } from "~~/utils/coffee";

type BatchFilterBarProps = BatchFilterState & {
  onChange: (next: BatchFilterState) => void;
  onClear?: () => void;
  onSearch?: (query: string) => void;
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
  onSearch,
  pageSize,
  onPageSizeChange,
}: BatchFilterBarProps) => {
  return (
    <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
      {/* Stage Filter Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-label text-muted text-sm mr-1">Stage</span>
        {STAGE_FILTERS.map(s => (
          <button
            key={s}
            onClick={() => onChange({ stage: s, region, sort })}
            className={`btn btn-sm rounded-full border ${
              stage === s ? "btn-primary" : "btn-ghost border-base-300 text-muted hover:border-primary"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Clear / Page / Region / Sort / Search */}
      <div className="flex items-center gap-2 flex-wrap">
        {onClear && (
          <button
            onClick={onClear}
            className="btn btn-sm rounded-full border btn-ghost border-base-300 text-muted hover:border-error hover:text-error"
          >
            Clear
          </button>
        )}

        {onPageSizeChange && (
          <select
            className="select select-sm appearance-none w-fit shrink-0"
            value={pageSize}
            onChange={e => onPageSizeChange(Number(e.target.value))}
          >
            {[10, 25, 50, 100].map(n => (
              <option key={n} value={n}>
                {n} results
              </option>
            ))}
          </select>
        )}

        <select
          className="select select-sm appearance-none w-fit shrink-0"
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
          className="select select-sm appearance-none w-fit shrink-0"
          value={sort}
          onChange={e => onChange({ stage, region, sort: e.target.value as SortOrder })}
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>

        {onSearch && (
          <div className="w-full lg:w-75">
            <BatchSearch onSearch={onSearch} />
          </div>
        )}
      </div>
    </div>
  );
};
