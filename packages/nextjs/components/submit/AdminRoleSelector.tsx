"use client";

type AdminRoleSelectorProps = {
  userRole: string | undefined;
  activeFormTab: string;
  setActiveFormTab: (tab: string) => void;
};

const AdminRoleSelector = ({ userRole, activeFormTab, setActiveFormTab }: AdminRoleSelectorProps) => {
  if (userRole !== "Admin") return null;

  return (
    <div className="flex justify-end mb-4">
      <div className="flex items-center gap-2">
        <span className="text-label text-muted text-sm">Role: </span>
        <select
          className="select select-bordered select-sm w-fit shrink-0 focus:border-primary focus:ring-1 focus:ring-primary"
          value={activeFormTab}
          onChange={e => setActiveFormTab(e.target.value)}
        >
          {["Farmer", "Processor", "Roaster", "Distributor"].map(tab => (
            <option key={tab} value={tab}>
              {tab}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default AdminRoleSelector;
