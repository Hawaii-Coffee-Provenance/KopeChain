"use client";

import { motion, useMotionTemplate } from "framer-motion";
import { STAGES, STAGE_COLORS, STAGE_STYLES } from "~~/utils/coffee";

const TimelineSpine = ({
  stepsLength,
  activeProgress,
  fillHeight,
}: {
  stepsLength: number;
  activeProgress: number;
  fillHeight: any;
}) => {
  return (
    <div className="relative flex-shrink-0 order-1 lg:order-2 w-6 bg-base-300 dark:bg-base-100 rounded-full flex flex-col items-center overflow-visible mt-8 mb-8">
      {/* Step Nodes */}
      {Array.from({ length: stepsLength }).map((_, index) => {
        {
          /* Calculate position and active state */
        }
        const nodePosition = (index / (stepsLength - 1)) * 100;
        const isActive = activeProgress >= index / (stepsLength - 1) - 0.05;

        let dotColorClass = "border-transparent bg-base-300 dark:bg-base-100 text-base-content";

        if (isActive) {
          const stage = STAGES[index];
          if (stage) {
            dotColorClass = `border-transparent ${STAGE_STYLES[stage]}`;
          }
        }

        return (
          <div
            key={index}
            className={`absolute w-15 h-15 flex items-center justify-center rounded-full border-2 z-10 transition-colors duration-200 shadow-md ${dotColorClass}`}
            style={{
              top: `${nodePosition}%`,
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
          >
            <span className="font-bold text-xl leading-none">{index + 1}</span>
          </div>
        );
      })}

      {/* Dynamic Color Filled Line */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full rounded-full origin-top"
        style={{
          clipPath: useMotionTemplate`inset(0 0 calc(100% - ${fillHeight}) 0 round 999px)`,
          backgroundImage: `linear-gradient(to bottom, 
            ${STAGE_COLORS.Harvested} 0%, 
            ${STAGE_COLORS.Harvested} 33.33%, 
            ${STAGE_COLORS.Processed} 33.33%, 
            ${STAGE_COLORS.Processed} 66.66%, 
            ${STAGE_COLORS.Roasted} 66.66%, 
            ${STAGE_COLORS.Roasted} 100%
          )`,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};

export default TimelineSpine;
