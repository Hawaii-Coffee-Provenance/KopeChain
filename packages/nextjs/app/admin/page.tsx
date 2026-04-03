"use client";

import type { NextPage } from "next";
import RoleClient from "~~/components/RoleClient";
import ContractFunctions from "~~/components/admin/ContractFunctions";
import ContractRolesWidget from "~~/components/admin/ContractRolesWidget";
import ContractStatusDashboard from "~~/components/admin/ContractStatusDashboard";
import { ContractName } from "~~/utils/scaffold-eth/contract";
import { useAllContracts } from "~~/utils/scaffold-eth/contractsData";

const AdminPage: NextPage = () => {
  const contractsData = useAllContracts();
  const contractNames = Object.keys(contractsData) as ContractName[];
  const primaryContractName = contractNames[0];

  return (
    <RoleClient allowedRoles={["Admin"]}>
      <div className="w-full min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-base-200 overflow-y-auto lg:overflow-hidden">
        <section className="max-w-7xl mx-auto h-full flex flex-col section-padding">
          <ContractStatusDashboard />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-1 min-h-0 min-w-0 pb-10 lg:pb-0">
            <div className="lg:col-span-1 h-fit min-w-0">
              {primaryContractName ? <ContractRolesWidget contractName={primaryContractName} /> : null}
            </div>

            <div className="lg:col-span-2 h-auto lg:h-full min-h-0 min-w-0 lg:overflow-hidden">
              <ContractFunctions />
            </div>
          </div>
        </section>
      </div>
    </RoleClient>
  );
};

export default AdminPage;
