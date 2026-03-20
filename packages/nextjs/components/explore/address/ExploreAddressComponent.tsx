"use client";

import { Address as AddressType } from "viem";

const ExploreAddressComponent = ({
  address,
}: {
  address: AddressType;
  contractData: { bytecode: string; assembly: string } | null;
}) => {
  return (
    <div className="flex flex-col lg:flex-row w-full min-h-[calc(100vh-4rem)] lg:h-[calc(100vh-4rem)] bg-base-200/50">
      <div className="w-full lg:w-1/3 flex flex-col gap-6 section-padding py-6 lg:h-full lg:border-r border-base-300 order-2 lg:order-1">
        <div className="flex-1 rounded-3xl bg-base-100 border border-base-300 p-8 flex flex-col min-h-[350px] aspect-square lg:aspect-auto relative overflow-hidden">
          <h2 className="text-label mb-6">TODO</h2>
        </div>

        <div className="flex-1 rounded-3xl bg-base-100 border border-base-300 p-8 flex flex-col min-h-[350px] aspect-square lg:aspect-auto relative overflow-hidden">
          <h2 className="text-label mb-6">TODO</h2>
        </div>
      </div>

      <div className="w-full lg:w-2/3 flex flex-col lg:h-full min-h-[600px] lg:min-h-0 order-1 lg:order-2 section-padding py-6 lg:p-6 pb-20 overflow-y-auto no-scrollbar">
        <div className="w-full h-full rounded-3xl bg-base-100 border border-base-300 p-8 relative min-h-[500px]">
          <h2 className="text-label mb-6">{address}</h2>
        </div>
      </div>
    </div>
  );
};

export default ExploreAddressComponent;
