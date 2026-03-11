export const Mapbox = () => {
  return (
    <>
      <div className="relative w-full rounded-xl overflow-hidden border border-base-300 shadow-sm">
        {/* Placeholder for map */}
        <div className="w-full h-[500px] bg-base-100" />

        <div className="absolute bottom-4 left-4 z-10 bg-base-100 border border-base-300 rounded-lg px-4 py-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-primary flex-shrink-0" />
            Coffee Farm
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-accent flex-shrink-0" />
            Processing Station
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-[#B07D3A] flex-shrink-0" />
            Roasting Facility
          </div>
          <div className="flex items-center gap-2 text-xs text-secondary">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary flex-shrink-0" />
            Distribution Hub
          </div>
        </div>
      </div>

      <p className="text-center text-xs text-secondary mt-3 tracking-wide">
        Click markers to explore · Scroll to zoom · Right-click drag to tilt the terrain
      </p>
    </>
  );
};
