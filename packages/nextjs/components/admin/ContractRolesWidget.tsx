"use client";

import { useState } from "react";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { truncateAddress } from "~~/utils/coffee";
import { ContractName } from "~~/utils/scaffold-eth/contract";

type ContractRolesProps = {
  contractName: ContractName;
};

const ContractRolesWidget = ({ contractName }: ContractRolesProps) => {
  const [copied, setCopied] = useState<number | null>(null);
  const [showCopiedText, setShowCopiedText] = useState<number | null>(null);

  const { data: defaultAdminRole, isLoading: isLoading1 } = useScaffoldReadContract({
    contractName,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: farmerRole, isLoading: isLoading2 } = useScaffoldReadContract({
    contractName,
    functionName: "FARMER_ROLE",
  });

  const { data: processorRole, isLoading: isLoading3 } = useScaffoldReadContract({
    contractName,
    functionName: "PROCESSOR_ROLE",
  });

  const { data: roasterRole, isLoading: isLoading4 } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "ROASTER_ROLE",
  });

  const isLoading = isLoading1 || isLoading2 || isLoading3 || isLoading4;

  const dataList = [
    { label: "DEFAULT_ADMIN_ROLE", value: defaultAdminRole },
    { label: "FARMER_ROLE", value: farmerRole },
    { label: "PROCESSOR_ROLE", value: processorRole },
    { label: "ROASTER_ROLE", value: roasterRole },
  ];

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
    <div className="flex flex-col gap-3 py-5 px-6 rounded-xl border border-base-300 bg-base-100 shadow-sm">
      {isLoading ? (
        <span className="loading loading-spinner text-primary mx-auto my-auto py-10"></span>
      ) : (
        <div className="flex flex-col gap-3">
          {dataList.map((item, idx) => {
            const val = item.value?.toString() ?? "";

            return (
              <div
                key={idx}
                className="flex flex-col gap-1 border-b border-base-300 pb-3 last:border-0 last:pb-0 min-w-0"
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
      )}
    </div>
  );
};

export default ContractRolesWidget;
