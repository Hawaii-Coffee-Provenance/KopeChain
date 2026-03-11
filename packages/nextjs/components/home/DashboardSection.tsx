export const DashboardSection = () => {
  return (
    <div className="flex flex-col justify-center px-8 lg:pr-32 py-20 gap-6">
      <div className="flex w-full bg-base-100 border border-base-300 rounded-xl overflow-hidden focus-within:ring-1 focus-within:ring-primary transition-all">
        <input
          type="text"
          placeholder="Enter Batch ID..."
          className="flex-1 bg-transparent px-5 py-4 text-base-content placeholder-secondary/50 outline-none"
        />
        <button
          type="button"
          className="btn btn-ghost rounded-none border-0 border-l border-base-300 px-7 text-sm tracking-wide h-auto"
        >
          Submit
        </button>
      </div>

      <div className="grid grid-cols-2 gap-px bg-base-300 border border-base-300 rounded-xl overflow-hidden">
        <div className="bg-base-100 p-7 hover:bg-base-200 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">---</div>
          <div className="text-xs text-secondary uppercase tracking-widest">Total Batches</div>
        </div>

        <div className="bg-base-100 p-7 hover:bg-base-200 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">---</div>
          <div className="text-xs text-secondary uppercase tracking-widest">Verified Batches</div>
        </div>

        <div className="bg-base-100 p-7 hover:bg-base-200 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">---</div>
          <div className="text-xs text-secondary uppercase tracking-widest">AVG SCA Score</div>
        </div>

        <div className="bg-base-100 p-7 hover:bg-base-200 transition-colors">
          <div className="font-serif text-5xl font-light text-base-content leading-none mb-1">---</div>
          <div className="text-xs text-secondary uppercase tracking-widest">Registered Farms</div>
        </div>
      </div>

      <div className="flex items-center gap-3 px-5 py-4 bg-base-100 border border-base-300 rounded-xl text-sm text-secondary">
        <div className="inline-grid *:[grid-area:1/1]">
          <div className="status status-success animate-ping"></div>
          <div className="status status-success"></div>
        </div>
        - new batches tracked in the past week
      </div>
    </div>
  );
};
