"use client";

import { useState } from "react";
import { InputField, RoleDropdown, SubmitButton } from "./contract/FunctionInputs";
import { FunctionRow, FunctionSection } from "./contract/FunctionRow";
import { useContractFunctions } from "~~/hooks/useContractFunctions";
import { ROLES } from "~~/utils/admin";

const ContractFunctions = () => {
  const { results, handleWrite, handleRead, isMining } = useContractFunctions();

  const [verifyBatchId, setVerifyBatchId] = useState("");
  const [updateBatchId, setUpdateBatchId] = useState("");
  const [updateCid, setUpdateCid] = useState("");
  const [grantRoleHash, setGrantRoleHash] = useState(ROLES[0].value);
  const [grantAddress, setGrantAddress] = useState("");
  const [revokeRoleHash, setRevokeRoleHash] = useState(ROLES[0].value);
  const [revokeAddress, setRevokeAddress] = useState("");

  const [roleAddress, setRoleAddress] = useState("");
  const [batchId, setBatchId] = useState("");
  const [batchNum, setBatchNum] = useState("");
  const [userBatchesAddress, setUserBatchesAddress] = useState("");

  return (
    <div className="h-auto lg:h-full rounded-xl border border-base-300 bg-base-100 px-5 py-5 shadow-sm overflow-y-auto min-w-0 pb-10">
      <FunctionSection title="Write Operations">
        <FunctionRow label="verifyBatch" result={results["verifyBatch"]}>
          <InputField
            value={verifyBatchId}
            onChange={setVerifyBatchId}
            placeholder="Batch ID (uint256)"
            type="text"
            inputMode="numeric"
          />
          <SubmitButton
            label="Write"
            isWrite
            disabled={isMining || !verifyBatchId}
            onClick={() =>
              handleWrite(
                "verifyBatch",
                "verifyBatch",
                [BigInt(verifyBatchId)],
                `Batch ${verifyBatchId} was successfully verified.`,
              )
            }
          />
        </FunctionRow>

        <FunctionRow label="updateMetadataCID" result={results["updateMetadataCID"]}>
          <InputField
            value={updateBatchId}
            onChange={setUpdateBatchId}
            placeholder="Batch ID (uint256)"
            type="text"
            inputMode="numeric"
          />
          <InputField value={updateCid} onChange={setUpdateCid} placeholder="New Metadata CID (string)" />
          <SubmitButton
            label="Write"
            isWrite
            disabled={isMining || !updateBatchId || !updateCid}
            onClick={() =>
              handleWrite(
                "updateMetadataCID",
                "updateMetadataCID",
                [BigInt(updateBatchId), updateCid],
                `Metadata CID updated for batch ${updateBatchId}.`,
              )
            }
          />
        </FunctionRow>

        <FunctionRow label="grantRole" result={results["grantRole"]}>
          <RoleDropdown value={grantRoleHash} onChange={setGrantRoleHash} />
          <InputField value={grantAddress} onChange={setGrantAddress} placeholder="Target Address (address)" />
          <SubmitButton
            label="Write"
            isWrite
            disabled={isMining || !grantAddress}
            onClick={() =>
              handleWrite("grantRole", "grantRole", [grantRoleHash, grantAddress], `Successfully granted role.`)
            }
          />
        </FunctionRow>

        <FunctionRow label="revokeRole" result={results["revokeRole"]}>
          <RoleDropdown value={revokeRoleHash} onChange={setRevokeRoleHash} />
          <InputField value={revokeAddress} onChange={setRevokeAddress} placeholder="Target Address (address)" />
          <SubmitButton
            label="Write"
            isWrite
            disabled={isMining || !revokeAddress}
            onClick={() =>
              handleWrite("revokeRole", "revokeRole", [revokeRoleHash, revokeAddress], `Successfully revoked role.`)
            }
          />
        </FunctionRow>
      </FunctionSection>

      {/* --- READ FUNCTIONS --- */}
      <FunctionSection title="Read Operations">
        <FunctionRow label="getTransactionCount" result={results["getTransactionCount"]}>
          <div className="flex-1 bg-base-200/50 px-3 py-2 text-sm text-base-content/60 italic grid place-items-center justify-start border-r border-base-300">
            No arguments required
          </div>
          <SubmitButton label="Read" onClick={() => handleRead("getTransactionCount")} />
        </FunctionRow>

        <FunctionRow label="getBatchCount" result={results["getBatchCount"]}>
          <div className="flex-1 bg-base-200/50 px-3 py-2 text-sm text-base-content/60 italic grid place-items-center justify-start border-r border-base-300">
            No arguments required
          </div>
          <SubmitButton label="Read" onClick={() => handleRead("getBatchCount")} />
        </FunctionRow>

        <FunctionRow label="getFarmCount" result={results["getFarmCount"]}>
          <div className="flex-1 bg-base-200/50 px-3 py-2 text-sm text-base-content/60 italic grid place-items-center justify-start border-r border-base-300">
            No arguments required
          </div>
          <SubmitButton label="Read" onClick={() => handleRead("getFarmCount")} />
        </FunctionRow>

        <FunctionRow label="getRole" result={results["getRole"]}>
          <InputField value={roleAddress} onChange={setRoleAddress} placeholder="Address (address)" />
          <SubmitButton label="Read" disabled={!roleAddress} onClick={() => handleRead("getRole", [roleAddress])} />
        </FunctionRow>

        <FunctionRow label="getBatch" result={results["getBatch"]}>
          <InputField
            value={batchId}
            onChange={setBatchId}
            placeholder="Batch ID (uint256)"
            type="text"
            inputMode="numeric"
          />
          <SubmitButton
            label="Read"
            disabled={!batchId}
            onClick={() => handleRead("getBatch", [BigInt(batchId || 0)])}
          />
        </FunctionRow>

        <FunctionRow label="getBatchByNumber" result={results["getBatchByNumber"]}>
          <InputField value={batchNum} onChange={setBatchNum} placeholder="Batch Number (string: e.g. KONA-2026-01)" />
          <SubmitButton label="Read" disabled={!batchNum} onClick={() => handleRead("getBatchByNumber", [batchNum])} />
        </FunctionRow>

        <FunctionRow label="getUserBatches" result={results["getUserBatches"]}>
          <InputField value={userBatchesAddress} onChange={setUserBatchesAddress} placeholder="Address (address)" />
          <SubmitButton
            label="Read"
            disabled={!userBatchesAddress}
            onClick={() => handleRead("getUserBatches", [userBatchesAddress])}
          />
        </FunctionRow>
      </FunctionSection>
    </div>
  );
};

export default ContractFunctions;
