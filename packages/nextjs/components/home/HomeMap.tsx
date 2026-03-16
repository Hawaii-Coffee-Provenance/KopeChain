import { Map3D } from "../map/Map3D";

export const HomeMap = () => {
  return (
    <>
      <div className="relative w-full rounded-xl overflow-hidden border border-base-300 shadow-sm">
        <Map3D className="w-full h-[500px] bg-base-100" />

        <div className="absolute bottom-4 left-4 z-10 bg-base-100 border border-base-300 rounded-lg px-4 py-2 flex flex-col gap-2">
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-stage-harvest flex-shrink-0" />
            Coffee Farm
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-stage-process flex-shrink-0" />
            Processing Station
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-stage-roast flex-shrink-0" />
            Roasting Facility
          </div>
          <div className="flex items-center gap-2 text-xs text-muted">
            <span className="w-2.5 h-2.5 rounded-full bg-stage-distribute flex-shrink-0" />
            Distribution Hub
          </div>
        </div>
      </div>
    </>
  );
};
