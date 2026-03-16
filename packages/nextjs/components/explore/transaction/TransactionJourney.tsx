"use client";

import { DataRow } from "./DataRow";
import { zeroAddress } from "viem";
import { BlockieAddressLink } from "~~/components/explore/BlockieAddressLink";
import {
  PROCESSING_METHODS,
  REGIONS,
  ROASTING_METHODS,
  ROAST_LEVELS,
  STAGE_COLORS,
  VARIETIES,
  formatCoordinates,
} from "~~/utils/coffee";

const TransactionJourney = ({ batch }: { batch: any }) => {
  if (!batch) return <div className="text-base-content/50">No batch data available</div>;

  const hasProcessed = batch?.processor && batch.processor !== zeroAddress;
  const hasRoasted = batch?.roaster && batch.roaster !== zeroAddress;
  const hasDistributed = batch?.distributor && batch.distributor !== zeroAddress;

  return (
    <div className="flex flex-col w-full text-base-content pb-6">
      <h3 className="text-label text-base! mb-3 mt-2" style={{ color: STAGE_COLORS.Harvested }}>
        Harvest
      </h3>
      <DataRow title="Farm Name" value={batch?.farmName ?? "—"} />
      <DataRow title="Region" value={batch?.region !== undefined ? REGIONS[batch.region] : "—"} />
      <DataRow title="Variety" value={batch?.variety !== undefined ? VARIETIES[batch.variety] : "—"} />
      <DataRow title="Elevation" value={batch?.elevation ? `${batch.elevation} ft` : "—"} />
      <DataRow title="Weight" value={batch?.harvestWeight ? `${Number(batch.harvestWeight)} kg` : "—"} />
      <DataRow
        title="Date"
        value={
          batch?.harvestDate && Number(batch.harvestDate) !== 0
            ? new Date(Number(batch.harvestDate) * 1000).toLocaleDateString()
            : "—"
        }
      />
      <DataRow title="Location" value={formatCoordinates(batch?.harvestLocation)} />

      {hasProcessed && (
        <>
          <h3 className="text-label text-base! mb-3 mt-8" style={{ color: STAGE_COLORS.Processed }}>
            Process
          </h3>
          <DataRow
            title="Method"
            value={batch?.processingMethod !== undefined ? PROCESSING_METHODS[batch.processingMethod] : "—"}
          />
          <DataRow
            title="Weight In"
            value={batch?.processingBeforeWeight ? `${Number(batch.processingBeforeWeight)} kg` : "—"}
          />
          <DataRow
            title="Weight Out"
            value={batch?.processingAfterWeight ? `${Number(batch.processingAfterWeight)} kg` : "—"}
          />
          <DataRow title="SCA Score" value={batch?.scaScore ?? "—"} />
          <DataRow title="Moisture" value={batch?.moistureContent ? `${batch.moistureContent}%` : "—"} />
          <DataRow title="Dry Temp" value={batch?.dryTemperature ? `${batch.dryTemperature}°F` : "—"} />
          <DataRow title="Humidity" value={batch?.humidity ? `${batch.humidity}%` : "—"} />
          <DataRow
            title="Date"
            value={
              batch?.processingDate && Number(batch.processingDate) !== 0
                ? new Date(Number(batch.processingDate) * 1000).toLocaleDateString()
                : "—"
            }
          />
          <DataRow title="Location" value={formatCoordinates(batch?.processingLocation)} />
        </>
      )}

      {hasRoasted && (
        <>
          <h3 className="text-label text-base! mb-3 mt-8" style={{ color: STAGE_COLORS.Roasted }}>
            Roast
          </h3>
          <DataRow
            title="Method"
            value={batch?.roastingMethod !== undefined ? ROASTING_METHODS[batch.roastingMethod] : "—"}
          />
          <DataRow
            title="Weight In"
            value={batch?.roastingBeforeWeight ? `${Number(batch.roastingBeforeWeight)} kg` : "—"}
          />
          <DataRow
            title="Weight Out"
            value={batch?.roastingAfterWeight ? `${Number(batch.roastingAfterWeight)} kg` : "—"}
          />
          <DataRow title="Level" value={batch?.roastLevel !== undefined ? ROAST_LEVELS[batch.roastLevel] : "—"} />
          <DataRow title="Transport Time" value={batch?.transportTime ? `${batch.transportTime} hrs` : "—"} />
          <DataRow
            title="Date"
            value={
              batch?.roastingDate && Number(batch.roastingDate) !== 0
                ? new Date(Number(batch.roastingDate) * 1000).toLocaleDateString()
                : "—"
            }
          />
          <DataRow title="Location" value={formatCoordinates(batch?.roastingLocation)} />
        </>
      )}

      {hasDistributed && (
        <>
          <h3 className="text-label text-base! mb-2 mt-8" style={{ color: STAGE_COLORS.Distributed }}>
            Distribute
          </h3>
          <DataRow title="Bag Count" value={batch?.bagCount ? `${batch.bagCount}` : "—"} />
          <DataRow title="Weight" value={batch?.distributionWeight ? `${Number(batch.distributionWeight)} kg` : "—"} />
          <DataRow title="Destination" value={batch?.destination ?? "—"} />
          <DataRow
            title="Date"
            value={
              batch?.distributionDate && Number(batch.distributionDate) !== 0
                ? new Date(Number(batch.distributionDate) * 1000).toLocaleDateString()
                : "—"
            }
          />
          <DataRow title="Location" value={formatCoordinates(batch?.distributionLocation)} />
          <DataRow title="Distributor" hasBorder={true}>
            {batch?.distributor && batch.distributor !== zeroAddress ? (
              <BlockieAddressLink address={batch.distributor} disableTruncation />
            ) : (
              <span className="text-base-content/50 font-medium text-md">Pending</span>
            )}
          </DataRow>
        </>
      )}
    </div>
  );
};

export default TransactionJourney;
