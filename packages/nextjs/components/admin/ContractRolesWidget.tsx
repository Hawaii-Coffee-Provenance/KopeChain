"use client";

import { useState } from "react";
import { useContractRoles } from "~~/hooks/useAdminPanel";
import { AdminContractProps } from "~~/types/admin";
import { truncateAddress } from "~~/utils/coffee";

const ContractRolesWidget = ({ contractName }: AdminContractProps) => {
  const [copied, setCopied] = useState<number | null>(null);
  const [showCopiedText, setShowCopiedText] = useState<number | null>(null);

  const { roles } = useContractRoles(contractName);

  {
    /* Copy Address Tooltip */
  }
  const handleCopy = (value: string, idx: number) => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(value);
      setCopied(idx);
      setShowCopiedText(idx);
      setTimeout(() => {
        setCopied(null);
        setTimeout(() => setShowCopiedText(null), 500);
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col p-6 rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <div className="mb-6 last:mb-0">
        <h4 className="text-sm font-bold tracking-wide uppercase text-base-content/50 mb-4">Roles</h4>

        <div className="flex flex-col gap-6">
          {roles.map((item, idx) => {
            const val = item.value?.toString() ?? "";
            return (
              <div
                key={idx}
                className="flex flex-col gap-1 border-b border-base-300 pb-4 last:border-0 last:pb-0 min-w-0"
              >
                <span className="text-label">{item.label}</span>
                <div
                  className={`tooltip tooltip-top cursor-pointer max-w-full flex w-fit ${copied === idx ? "tooltip-open" : ""}`}
                  data-tip={showCopiedText === idx ? "Copied!" : "Copy Address"}
                  onClick={() => handleCopy(val, idx)}
                >
                  <span className="font-sans text-md text-primary">{truncateAddress(val)}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContractRolesWidget;
