import { useState } from "react";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldReadContract, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ResultData } from "~~/types/admin";
import { ContractName } from "~~/utils/scaffold-eth/contract";

/* Dynamically handles contract write and read operations and results */
export const useContractFunctions = (contractName: ContractName) => {
  const publicClient = usePublicClient();

  const { data: contractInfo } = useDeployedContractInfo({ contractName });
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName });

  const [results, setResults] = useState<Record<string, ResultData>>({});

  const setResult = (key: string, content: any, txHash?: string, isError = false) => {
    setResults(prev => ({ ...prev, [key]: { content, txHash, isError } }));
  };

  const handleWrite = async (
    key: string,
    functionName: string,
    args: any[],
    successMsg: string,
    onSuccess?: () => void,
  ) => {
    try {
      const tx = await writeContractAsync({ functionName, args } as any);
      setResult(key, successMsg, tx);
      if (onSuccess) onSuccess();
    } catch (e: any) {
      setResult(key, e?.message || "Transaction Failed!", undefined, true);
    }
  };

  const handleRead = async (functionName: string, args: any[] = []) => {
    if (!contractInfo || !publicClient) {
      setResult(functionName, "Contract not loaded properly.", undefined, true);
      return;
    }

    try {
      const result = await publicClient.readContract({
        address: contractInfo.address,
        abi: contractInfo.abi,
        functionName,
        args,
      } as any);
      setResult(functionName, result);
    } catch (e: any) {
      setResult(functionName, e?.message || "Read failed", undefined, true);
    }
  };

  return { results, handleWrite, handleRead, isMining };
};

export const useContractRoles = (contractName: ContractName) => {
  const { data: defaultAdminRole, isLoading: defaultAdminRoleLoading } = useScaffoldReadContract({
    contractName,
    functionName: "DEFAULT_ADMIN_ROLE",
  });

  const { data: farmerRole, isLoading: farmerRoleLoading } = useScaffoldReadContract({
    contractName,
    functionName: "FARMER_ROLE",
  });

  const { data: processorRole, isLoading: processorRoleLoading } = useScaffoldReadContract({
    contractName,
    functionName: "PROCESSOR_ROLE",
  });

  const { data: roasterRole, isLoading: roasterRoleLoading } = useScaffoldReadContract({
    contractName,
    functionName: "ROASTER_ROLE",
  });

  const { data: distributorRole, isLoading: distributorRoleLoading } = useScaffoldReadContract({
    contractName,
    functionName: "DISTRIBUTOR_ROLE",
  });

  const isLoading =
    defaultAdminRoleLoading ||
    farmerRoleLoading ||
    processorRoleLoading ||
    roasterRoleLoading ||
    distributorRoleLoading;

  const roles = [
    { label: "Admin", value: defaultAdminRole },
    { label: "Farmer", value: farmerRole },
    { label: "Processor", value: processorRole },
    { label: "Roaster", value: roasterRole },
    { label: "Distributor", value: distributorRole },
  ];

  return { roles, isLoading };
};
