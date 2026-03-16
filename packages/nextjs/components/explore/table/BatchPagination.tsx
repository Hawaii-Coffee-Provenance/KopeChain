"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

export type PaginationConfig = {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  goToPage: (page: number) => void;
};

const getPageWindow = (current: number, total: number): number[] => {
  const start = Math.max(1, Math.min(current - 1, total - 2));
  const end = Math.min(total, start + 2);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
};

export const BatchPagination = ({ currentPage, totalPages, totalItems, pageSize, goToPage }: PaginationConfig) => {
  const showing = Math.min(pageSize, totalItems - (currentPage - 1) * pageSize);

  return (
    <tfoot>
      <tr>
        <td colSpan={12} className="px-5 py-3 border-t border-base-300">
          <div className="flex items-center justify-between">
            <span className="text-muted">
              Showing {showing} of {totalItems} batches
            </span>

            <div className="flex items-center gap-1">
              <button
                className="btn btn-primary btn-xs"
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeftIcon className="h-3 w-3" />
              </button>

              {getPageWindow(currentPage, totalPages).map(p => (
                <button
                  key={p}
                  onClick={() => goToPage(p)}
                  className={`btn btn-xs ${currentPage === p ? "btn-primary" : "btn-ghost border border-base-300"}`}
                >
                  {p}
                </button>
              ))}

              <button
                className="btn btn-primary btn-xs"
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRightIcon className="h-3 w-3" />
              </button>
            </div>
          </div>
        </td>
      </tr>
    </tfoot>
  );
};
