"use client";

import { useState } from "react";
import type { NextPage } from "next";
import RoleClient from "~~/components/RoleClient";
import AdminRoleSelector from "~~/components/submit/AdminRoleSelector";
import StatusDashboard from "~~/components/submit/StatusDashboard";
import DistributeForm from "~~/components/submit/forms/DistributeForm";
import HarvestForm from "~~/components/submit/forms/HarvestForm";
import ProcessForm from "~~/components/submit/forms/ProcessForm";
import RoastForm from "~~/components/submit/forms/RoastForm";

const SubmitPage: NextPage = () => {
  const [activeFormTab, setActiveFormTab] = useState<string>("Farmer");
  const allowedRoles = ["Admin", "Farmer", "Processor", "Roaster", "Distributor"];

  return (
    <RoleClient allowedRoles={allowedRoles}>
      {({ userRole }) => {
        const role = userRole === "Admin" ? activeFormTab : userRole;

        const activeForm = (() => {
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
                <div className="rounded-xl border border-base-300 bg-base-100 p-6 shadow-sm text-center">
                  <h3 className="text-xl font-semibold mb-2">Insufficient Permissions!</h3>
                  <p className="text-muted">You do not have a supply chain role assigned to submit batches.</p>
                </div>
              );
          }
        })();

        return (
          <div className="w-full min-h-[calc(100vh-4rem)] bg-base-200">
            <section className="max-w-7xl mx-auto flex flex-col section-padding">
              <AdminRoleSelector
                userRole={userRole}
                activeFormTab={activeFormTab}
                setActiveFormTab={setActiveFormTab}
              />

              {/* Status Dashboard */}
              <StatusDashboard userRole={userRole} />

              {/* Form */}
              <div className="mt-4 flex-1 min-h-0 no-scrollbar">{activeForm}</div>
            </section>
          </div>
        );
      }}
    </RoleClient>
  );
};

export default SubmitPage;
