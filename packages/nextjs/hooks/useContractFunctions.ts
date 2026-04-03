import { useState } from "react";
import { usePublicClient } from "wagmi";
import { useDeployedContractInfo, useScaffoldWriteContract } from "~~/hooks/scaffold-eth";
import { ResultData } from "~~/types/admin";

export const useContractFunctions = () => {
  const publicClient = usePublicClient();
  const { data: contractInfo } = useDeployedContractInfo({ contractName: "CoffeeTracker" });
  const { writeContractAsync, isMining } = useScaffoldWriteContract({ contractName: "CoffeeTracker" });

  const [results, setResults] = useState<Record<string, ResultData>>({});

  const setResult = (key: string, content: any, txHash?: string, isError = false) => {
    setResults(prev => ({ ...prev, [key]: { content, txHash, isError } }));
  };

  const handleWrite = async (key: string, functionName: string, args: any[], successMsg: string) => {
    try {
      const tx = await writeContractAsync({
        functionName,
        args,
      } as any);
      setResult(key, successMsg, tx);
    } catch (e: any) {
      setResult(key, e?.message || "Transaction failed", undefined, true);
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
