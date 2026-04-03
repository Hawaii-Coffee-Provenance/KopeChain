"use client";

import { ResultData } from "~~/types/admin";

const ResultAccordion = ({ result }: { result: NonNullable<ResultData> }) => {
  return (
    <div className="collapse collapse-plus bg-base-100 border border-base-300 mt-2 w-full max-w-full overflow-hidden shadow-sm rounded-xl">
      <input type="checkbox" defaultChecked />
      <div className="collapse-title font-bold min-h-0 py-1.5 px-5 flex items-center text-lg text-base-content/60">
        <span className="text-[11px] tracking-widest uppercase">View Results {result.isError ? "(Error)" : ""}</span>
      </div>
      <div className="collapse-content font-mono whitespace-pre-wrap break-all overflow-x-hidden px-5 pb-2">
        <div className="pt-2 border-t border-base-300">
          {/* Result Content Row */}
          <div className="flex flex-col py-4 border-b border-base-300 last:border-0 gap-2">
            <span className="text-xs font-bold tracking-wide uppercase text-base-content/50">Result Content</span>
            <div className="font-medium text-base text-base-content text-left leading-relaxed">
              {result.content === null || result.content === undefined ? (
                <span className="text-muted italic">Transaction successful.</span>
              ) : typeof result.content === "string" ? (
                result.content
              ) : (
                <pre className="m-0 leading-relaxed overflow-x-auto whitespace-pre-wrap break-all font-mono text-sm opacity-90">
                  {JSON.stringify(
                    result.content,
                    (key, value) => (typeof value === "bigint" ? value.toString() : value),
                    2,
                  )}
                </pre>
              )}
            </div>
          </div>

          {/* Transaction Hash Row */}
          {result.txHash && (
            <div className="flex flex-col py-4 border-b border-base-300 last:border-0 gap-2">
              <span className="text-xs font-bold tracking-wide uppercase text-base-content/50">TX Hash</span>
              <div className="font-medium text-sm text-base-content text-left opacity-80 break-all font-mono leading-relaxed">
                {result.txHash}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultAccordion;
