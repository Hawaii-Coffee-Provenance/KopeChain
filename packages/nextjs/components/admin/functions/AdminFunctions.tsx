"use client";

import ResultAccordion from "./ResultAccordion";
import { ResultData } from "~~/types/admin";

export const AdminFunctionSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-6 last:mb-0">
    <h4 className="text-sm font-bold tracking-wide uppercase text-base-content/50 mb-4">{title}</h4>
    <div className="flex flex-col gap-6">{children}</div>
  </div>
);

export const AdminFunctionDisplay = ({
  label,
  children,
  result,
}: {
  label: string;
  children: React.ReactNode;
  result?: ResultData;
}) => (
  <div className="flex flex-col border-b border-base-300 pb-4 last:border-0 last:pb-0 gap-2">
    {/* Function Input */}
    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
      <span className="text-sm font-semibold whitespace-nowrap w-36 shrink-0 block pb-2 sm:pb-0">{label}</span>

      <div className="flex-1 w-full flex bg-base-100 border border-base-300 rounded-xl overflow-hidden focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all">
        {children}
      </div>
    </div>

    {/* Result Accordion */}
    {result && <ResultAccordion result={result} />}
  </div>
);
