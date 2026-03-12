import { BatchSearch } from "./BatchSearch";

type Props = {
  onSearch: (query: string) => void;
};

export const BatchLookup = ({ onSearch }: Props) => {
  return (
    <div className="grid grid-cols-3 gap-px bg-base-300 border border-base-300 rounded-xl overflow-hidden mb-6">
      <div className="col-span-2 bg-base-100 p-7 flex flex-col gap-3">
        <div className="text-muted uppercase tracking-[0.2em]">Search</div>
        <BatchSearch onSearch={onSearch} />
      </div>

      <div className="bg-base-100 p-7 flex flex-col gap-3">
        <div className="text-muted uppercase tracking-[0.2em]">Scan QR Code</div>
        <div className="flex-1 flex items-center justify-center border-2 border-dashed border-base-300 rounded-xl text-secondary/40 min-h-[64px]" />
      </div>
    </div>
  );
};
