"use client";

import { useState } from "react";
import CustomTooltip from "~~/components/CustomTooltip";
import { useContractRoles } from "~~/hooks/useAdminPanel";
import { AdminContractProps } from "~~/types/admin";
import { truncateAddress } from "~~/utils/coffee";
import { copyWithFeedback } from "~~/utils/forms";

const ContractRolesWidget = ({ contractName }: AdminContractProps) => {
  const [copied, setCopied] = useState<number | null>(null);
  const [showCopiedText, setShowCopiedText] = useState<number | null>(null);

  const { roles } = useContractRoles(contractName);

  {
    /* Copy Address Tooltip */
  }
  const handleCopy = (value: string, idx: number) => {
    copyWithFeedback({
      value,
      showValue: idx,
      clearValue: null,
      setCopied,
      setShowCopiedText,
    });
  };

  return (
    <div className="flex flex-col p-6 rounded-xl border border-base-300 bg-base-100 shadow-sm">
      <div className="mb-6 last:mb-0">
        <div className="text-label text-base! mb-4">Roles</div>
        <div className="flex flex-col gap-6">
          {roles.map((item, idx) => {
            const val = item.value?.toString() ?? "";
            return (
              <div
                key={idx}
                className="flex flex-col gap-1 border-b border-base-300 pb-4 last:border-0 last:pb-0 min-w-0"
              >
                <span className="text-label">{item.label}</span>
                <CustomTooltip
                  message={showCopiedText === idx ? "Copied!" : "Copy Address"}
                  open={copied === idx}
                  onClick={() => handleCopy(val, idx)}
                >
                  <span className="font-sans text-md text-primary">{truncateAddress(val)}</span>
                </CustomTooltip>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ContractRolesWidget;
