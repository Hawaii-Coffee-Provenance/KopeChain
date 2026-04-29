"use client";

import { useEffect, useState } from "react";
import {
  AdminInputField,
  AdminNoArguments,
  AdminRoleDropdown,
  AdminSubmitButton,
} from "./functions/AdminFunctionInputs";
import { AdminFunctionDisplay, AdminFunctionSection } from "./functions/AdminFunctions";
import { useContractFunctions, useContractRoles } from "~~/hooks/useAdminPanel";
import { useBatchId } from "~~/hooks/useCoffeeTracker";
import { AdminContractProps } from "~~/types/admin";

const ContractFunctions = ({ contractName }: AdminContractProps) => {
  const { results, handleWrite, handleRead, isMining } = useContractFunctions(contractName);
  const { roles } = useContractRoles(contractName);

  const [verifyBatchName, setVerifyBatchName] = useState("");
  const [updateBatchName, setUpdateBatchName] = useState("");
  const [updateCid, setUpdateCid] = useState("");
  const [grantRoleHash, setGrantRoleHash] = useState("");
  const [grantAddress, setGrantAddress] = useState("");
  const [revokeRoleHash, setRevokeRoleHash] = useState("");
  const [revokeAddress, setRevokeAddress] = useState("");

  const [roleAddress, setRoleAddress] = useState("");
  const [batchId, setBatchId] = useState("");
  const [lookupBatchName, setLookupBatchName] = useState("");
  const [userBatchesAddress, setUserBatchesAddress] = useState("");

  const { batchId: verifyResolvedId } = useBatchId(verifyBatchName);
  const { batchId: updateResolvedId } = useBatchId(updateBatchName);

  /* Set role hash defaults on load */
  useEffect(() => {
    if (roles && roles.length > 0 && !grantRoleHash) {
      const defaultVal = roles[0].value?.toString() || "";
      setGrantRoleHash(defaultVal);
      setRevokeRoleHash(defaultVal);
    }
  }, [roles, grantRoleHash]);

  return (
    <div className="h-auto lg:h-full rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm overflow-y-auto min-w-0 pb-10">
      {/* Write Functions */}
      <AdminFunctionSection title="Write Operations">
        {/* Verify Batch */}
        <AdminFunctionDisplay label="verifyBatch" result={results["verifyBatch"]}>
          <AdminInputField value={verifyBatchName} onChange={setVerifyBatchName} placeholder="Batch Name (string)" />

          <AdminSubmitButton
            label="Write"
            isWrite
            disabled={isMining || !verifyBatchName || !verifyResolvedId}
            onClick={() =>
              handleWrite(
                "verifyBatch",
                "verifyBatch",
                [verifyResolvedId!],
                `Batch "${verifyBatchName}" was successfully verified!`,
              )
            }
          />
        </AdminFunctionDisplay>

        {/* Update Metadata CID */}
        <AdminFunctionDisplay label="updateMetadataCID" result={results["updateMetadataCID"]}>
          <AdminInputField value={updateBatchName} onChange={setUpdateBatchName} placeholder="Batch Name (string)" />

          <AdminInputField value={updateCid} onChange={setUpdateCid} placeholder="Metadata CID (string)" />

          <AdminSubmitButton
            label="Write"
            isWrite
            disabled={isMining || !updateBatchName || !updateCid || !updateResolvedId}
            onClick={() =>
              handleWrite(
                "updateMetadataCID",
                "updateMetadataCID",
                [updateResolvedId!, updateCid],
                `Metadata CID updated for batch "${updateBatchName}"!`,
              )
            }
          />
        </AdminFunctionDisplay>

        {/* Grant Role */}
        <AdminFunctionDisplay label="grantRole" result={results["grantRole"]}>
          <AdminRoleDropdown value={grantRoleHash} onChange={setGrantRoleHash} options={roles} />

          <AdminInputField value={grantAddress} onChange={setGrantAddress} placeholder="Target Address (address)" />

          <AdminSubmitButton
            label="Write"
            isWrite
            disabled={isMining || !grantAddress}
            onClick={() =>
              handleWrite("grantRole", "grantRole", [grantRoleHash, grantAddress], `Successfully granted role!`)
            }
          />
        </AdminFunctionDisplay>

        {/* Revoke Role */}
        <AdminFunctionDisplay label="revokeRole" result={results["revokeRole"]}>
          <AdminRoleDropdown value={revokeRoleHash} onChange={setRevokeRoleHash} options={roles} />

          <AdminInputField value={revokeAddress} onChange={setRevokeAddress} placeholder="Target Address (address)" />

          <AdminSubmitButton
            label="Write"
            isWrite
            disabled={isMining || !revokeAddress}
            onClick={() =>
              handleWrite("revokeRole", "revokeRole", [revokeRoleHash, revokeAddress], `Successfully revoked role!`)
            }
          />
        </AdminFunctionDisplay>
      </AdminFunctionSection>

      {/* Read Functions */}
      <AdminFunctionSection title="Read Operations">
        {/* Get Transaction Count */}
        <AdminFunctionDisplay label="getTransactionCount" result={results["getTransactionCount"]}>
          <AdminNoArguments />

          <AdminSubmitButton label="Read" onClick={() => handleRead("getTransactionCount")} />
        </AdminFunctionDisplay>

        {/* Get Batch Count */}
        <AdminFunctionDisplay label="getBatchCount" result={results["getBatchCount"]}>
          <AdminNoArguments />

          <AdminSubmitButton label="Read" onClick={() => handleRead("getBatchCount")} />
        </AdminFunctionDisplay>

        {/* Get Farm Count */}
        <AdminFunctionDisplay label="getFarmCount" result={results["getFarmCount"]}>
          <AdminNoArguments />

          <AdminSubmitButton label="Read" onClick={() => handleRead("getFarmCount")} />
        </AdminFunctionDisplay>

        {/* Get Roles */}
        <AdminFunctionDisplay label="getRoles" result={results["getRoles"]}>
          <AdminInputField value={roleAddress} onChange={setRoleAddress} placeholder="Address (address)" />

          <AdminSubmitButton
            label="Read"
            disabled={!roleAddress}
            onClick={() => handleRead("getRoles", [roleAddress])}
          />
        </AdminFunctionDisplay>

        {/* Get Batch by ID */}
        <AdminFunctionDisplay label="getBatch" result={results["getBatch"]}>
          <AdminInputField
            value={batchId}
            onChange={setBatchId}
            placeholder="Batch ID (uint256)"
            type="text"
            inputMode="numeric"
          />

          <AdminSubmitButton
            label="Read"
            disabled={!batchId}
            onClick={() => handleRead("getBatch", [BigInt(batchId || 0)])}
          />
        </AdminFunctionDisplay>

        {/* Get Batch by Number */}
        <AdminFunctionDisplay label="getBatchByName" result={results["getBatchByName"]}>
          <AdminInputField value={lookupBatchName} onChange={setLookupBatchName} placeholder="Batch Name (string)" />

          <AdminSubmitButton
            label="Read"
            disabled={!lookupBatchName}
            onClick={() => handleRead("getBatchByName", [lookupBatchName])}
          />
        </AdminFunctionDisplay>

        {/* Get User Batches */}
        <AdminFunctionDisplay label="getUserBatches" result={results["getUserBatches"]}>
          <AdminInputField
            value={userBatchesAddress}
            onChange={setUserBatchesAddress}
            placeholder="Address (address)"
          />
          <AdminSubmitButton
            label="Read"
            disabled={!userBatchesAddress}
            onClick={() => handleRead("getUserBatches", [userBatchesAddress])}
          />
        </AdminFunctionDisplay>
      </AdminFunctionSection>
    </div>
  );
};

export default ContractFunctions;
