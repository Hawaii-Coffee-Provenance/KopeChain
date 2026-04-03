"use client";

import { useState } from "react";
import type { NextPage } from "next";
import RoleClient from "~~/components/RoleClient";
import AdminRoleSelector from "~~/components/submit/AdminRoleSelector";
import DistributeForm from "~~/components/submit/DistributeForm";
import HarvestForm from "~~/components/submit/HarvestForm";
import ProcessForm from "~~/components/submit/ProcessForm";
import RoastForm from "~~/components/submit/RoastForm";
import StatusDashboard from "~~/components/submit/StatusDashboard";
import { useRoleProtection } from "~~/hooks/useRoleProtection";

const SubmitPage: NextPage = () => {
  const [activeFormTab, setActiveFormTab] = useState<string>("Farmer");
  const allowedRoles = ["Admin", "Farmer", "Processor", "Roaster", "Distributor"];
  const { userRole } = useRoleProtection(allowedRoles);

  const getActiveForm = () => {
    const role = userRole === "Admin" ? activeFormTab : userRole;

    switch (role) {
      case "Farmer":
        return <HarvestForm />;
      case "Processor":
        return <ProcessForm />;
      case "Roaster":
        return <RoastForm />;
      case "Distributor":
        return <DistributeForm />;
      default:
        return (
          <div className="rounded-xl border border-base-300 bg-base-100 px-6 py-10 shadow-sm text-center">
            <h3 className="text-xl font-semibold mb-2">Insufficient Permissions</h3>
            <p className="text-muted">You do not have a supply chain role assigned to submit batches.</p>
          </div>
        );
    }
  };

  return (
    <RoleClient allowedRoles={allowedRoles}>
      <div className="w-full min-h-[calc(100vh-4rem)] bg-base-200">
        <section className="max-w-7xl mx-auto flex flex-col section-padding">
          {/* Admin Role Selector */}
          <AdminRoleSelector userRole={userRole} activeFormTab={activeFormTab} setActiveFormTab={setActiveFormTab} />

          {/* Status Dashboard */}
          <StatusDashboard userRole={userRole} />

          {/* Form */}
          <div className="mt-4 flex-1 min-h-0 no-scrollbar">{getActiveForm()}</div>
        </section>
      </div>
    </RoleClient>
  );
};

export default SubmitPage;
