import { ContractName } from "~~/utils/scaffold-eth/contract";

export type ResultData = { content: any; txHash?: string; isError?: boolean } | null;

export type AdminContractProps = {
  contractName: ContractName;
};
