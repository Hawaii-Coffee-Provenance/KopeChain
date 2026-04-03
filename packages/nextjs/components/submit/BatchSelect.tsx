"use client";

import { useMemo } from "react";
import { useDebounceValue } from "usehooks-ts";
import { zeroAddress } from "viem";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useScaffoldReadContract } from "~~/hooks/scaffold-eth";
import { BatchData, BatchSelectProps } from "~~/types/forms";

const STAGE_CONFIG = {
  Harvested: {
    isValid: (b: BatchData) => b.farmer !== zeroAddress && b.processor === zeroAddress,
    isPast: (b: BatchData) => b.processor !== zeroAddress,
    success: "Ready for processing",
    alreadyDone: "Already processed",
    tooEarly: "Not yet harvested",
  },
  Processed: {
    isValid: (b: BatchData) => b.processor !== zeroAddress && b.roaster === zeroAddress,
    isPast: (b: BatchData) => b.roaster !== zeroAddress,
    success: "Ready for roasting",
    alreadyDone: "Already roasted",
    tooEarly: "Not yet processed",
  },
  Roasted: {
    isValid: (b: BatchData) => b.roaster !== zeroAddress && b.distributor === zeroAddress,
    isPast: (b: BatchData) => b.distributor !== zeroAddress,
    success: "Ready for distribution",
    alreadyDone: "Already distributed",
    tooEarly: "Not yet roasted",
  },
} as const;

const BatchSelect = ({ value, onSelect, requiredStage, isDisabled }: BatchSelectProps) => {
  const [debouncedValue] = useDebounceValue(value, 500);
  const isQueryEnabled = debouncedValue?.trim().length > 0;

  const {
    data: batchData,
    isLoading,
    isFetching,
    isError,
  } = useScaffoldReadContract({
    contractName: "CoffeeTracker",
    functionName: "getBatchByNumber",
    args: [debouncedValue?.trim() || ""],
    query: { enabled: isQueryEnabled, retry: false },
  });

  const { type: status, message } = useMemo(() => {
    if (!isQueryEnabled) return { type: "none" as const, message: "" };

    if (isLoading || isFetching) return { type: "loading" as const, message: "" };

    if (isError || !batchData || batchData.batchId === 0n)
      return { type: "invalid" as const, message: "Batch not found!" };

    const current = STAGE_CONFIG[requiredStage];

    if (current.isValid(batchData)) return { type: "valid" as const, message: current.success };

    return { type: "invalid" as const, message: current.isPast(batchData) ? current.alreadyDone : current.tooEarly };
  }, [isQueryEnabled, isLoading, isFetching, isError, batchData, requiredStage]);

  return (
    <div className="relative flex items-center">
      <input
        type="text"
        className={`input input-bordered w-full text-sm h-10 pr-10 transition-colors ${
          status === "valid" ? "input-success" : status === "invalid" ? "input-error" : ""
        }`}
        placeholder={`Enter ${requiredStage} batch ID...`}
        value={value}
        onChange={e => onSelect(e.target.value)}
        disabled={isDisabled}
      />

      {status !== "none" && (
        <div className="absolute right-3 flex items-center z-10">
          {status === "loading" ? (
            <span className="loading loading-spinner loading-sm text-base-content/50" />
          ) : (
            <div className="tooltip tooltip-left" data-tip={message}>
              {status === "valid" ? (
                <CheckIcon className="w-5 h-5 text-success" />
              ) : (
                <XMarkIcon className="w-5 h-5 text-error" />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BatchSelect;
