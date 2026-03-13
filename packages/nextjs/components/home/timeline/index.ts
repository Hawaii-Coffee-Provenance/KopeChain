import { useMemo } from "react";

export type Stat = { value: string; unit: string; label: string };

export type StepType = {
  step: number;
  title: string;
  color: string;
  borderColor: string;
  header: string;
  content: string;
  stat1: Stat;
  stat2: Stat;
  stat3: Stat;
};

export const CONTENT = [
  {
    step: 1,
    title: "Harvest",
    color: "text-stage-harvest",
    borderColor: "border-stage-harvest",
    header: "Where Every\nJourney Begins",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
  },
  {
    step: 2,
    title: "Process",
    color: "text-stage-process",
    borderColor: "border-stage-process",
    header: "Cherry to\nGreen Bean",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
  },
  {
    step: 3,
    title: "Roast",
    color: "text-stage-roast",
    borderColor: "border-stage-roast",
    header: "Unlocking\nthe Flavour",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
  },
  {
    step: 4,
    title: "Distribute",
    color: "text-stage-distribute",
    borderColor: "border-stage-distribute",
    header: "From Island\nto Your Cup",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
  },
];

export const useTimelineSteps = (stats: any) => {
  return useMemo<StepType[]>(() => {
    return CONTENT.map(stepItem => {
      if (!stats) {
        return {
          ...stepItem,
          stat1: { value: "—", unit: "", label: "" },
          stat2: { value: "—", unit: "", label: "" },
          stat3: { value: "—", unit: "", label: "" },
        };
      }

      switch (stepItem.step) {
        case 1:
          return {
            ...stepItem,
            stat1: { value: stats.averageElevation?.toLocaleString() ?? "—", unit: "ft", label: "Avg Elevation" },
            stat2: { value: stats.averageYield?.toLocaleString() ?? "—", unit: "kg", label: "Avg Yield" },
            stat3: { value: stats.varietyCount?.toString() ?? "—", unit: "", label: "Varieties" },
          };
        case 2:
          return {
            ...stepItem,
            stat1: { value: stats.averageMoisture?.toString() ?? "—", unit: "%", label: "Avg Moisture" },
            stat2: { value: stats.averageScaScore?.toString() ?? "—", unit: "", label: "Avg SCA Score" },
            stat3: { value: stats.processMethodCount?.toString() ?? "—", unit: "", label: "Methods" },
          };
        case 3:
          return {
            ...stepItem,
            stat1: { value: stats.averageTransportTime?.toString() ?? "—", unit: "hrs", label: "Avg Transport" },
            stat2: { value: stats.averageRoastWeightLoss?.toString() ?? "—", unit: "%", label: "Avg Weight Loss" },
            stat3: { value: stats.roastMethodCount?.toString() ?? "—", unit: "", label: "Methods" },
          };
        case 4:
          return {
            ...stepItem,
            stat1: { value: stats.islandCount?.toString() ?? "—", unit: "", label: "Islands" },
            stat2: { value: stats.verifiedCount?.toString() ?? "—", unit: "", label: "Batches Verified" },
            stat3: { value: "100", unit: "%", label: "On The Chain" },
          };
        default:
          return {
            ...stepItem,
            stat1: { value: "—", unit: "", label: "" },
            stat2: { value: "—", unit: "", label: "" },
            stat3: { value: "—", unit: "", label: "" },
          };
      }
    });
  }, [stats]);
};
