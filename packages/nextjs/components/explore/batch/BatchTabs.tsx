"use client";

const BatchTabs = ({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: string[];
  activeTab: string;
  setActiveTab: (tab: any) => void;
}) => {
  return (
    <div className="flex gap-4 border-b border-base-300 w-full mt-2">
      {tabs.map(tab => (
        <button
          key={tab}
          onClick={() => setActiveTab(tab)}
          className={`pb-3 text-sm font-bold tracking-wide uppercase transition-all mb-[-1px] border-b-2 ${
            activeTab === tab
              ? "border-base-content text-base-content"
              : "border-transparent text-base-content/50 hover:text-base-content/80"
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  );
};

export default BatchTabs;
