"use client";

import { motion, useMotionTemplate } from "framer-motion";

export const TimelineSpine = ({
  stepsLength,
  activeProgress,
  fillHeight,
}: {
  stepsLength: number;
  activeProgress: number;
  fillHeight: any;
}) => {
  return (
    <div className="relative flex-shrink-0 order-1 lg:order-2 w-3 md:w-4 bg-base-300 rounded-full flex flex-col items-center mt-6 lg:mt-8 mb-6 lg:mb-8">
      {/* Step Nodes */}
      {Array.from({ length: stepsLength }).map((_, index) => {
        {
          /* Calculate position and active state */
        }
        const nodePosition = (index / (stepsLength - 1)) * 100;
        const isActive = activeProgress >= index / (stepsLength - 1) - 0.05;

        {
          /* Default dot color changes based on active state */
        }
        let dotColorClass = "border-base-300 bg-base-300 text-cream/90";

        if (isActive) {
          if (index === 0) dotColorClass = "border-stage-harvest bg-stage-harvest text-cream";
          else if (index === 1) dotColorClass = "border-stage-process bg-stage-process text-cream";
          else if (index === 2) dotColorClass = "border-stage-roast bg-stage-roast text-cream";
          else if (index === 3) dotColorClass = "border-stage-distribute bg-stage-distribute text-cream";
        }

        return (
          <div
            key={index}
            className={`absolute w-10 h-10 lg:w-12 lg:h-12 flex items-center justify-center rounded-full border-[4px] lg:border-[6px] z-10 transition-colors duration-500 shadow-md ${dotColorClass}`}
            style={{
              top: `${nodePosition}%`,
              transform: "translateY(-50%)",
            }}
          >
            <span className="font-bold text-sm lg:text-base leading-none">{index + 1}</span>
          </div>
        );
      })}

      {/* Dynamic Color Filled Line */}
      <motion.div
        className="absolute top-0 left-0 w-full h-full rounded-full origin-top"
        style={{
          clipPath: useMotionTemplate`inset(0 0 calc(100% - ${fillHeight}) 0 round 999px)`,
          backgroundImage: `linear-gradient(to bottom, 
            var(--color-stage-harvest) 0%, 
            var(--color-stage-harvest) 33.33%, 
            var(--color-stage-process) 33.33%, 
            var(--color-stage-process) 66.66%, 
            var(--color-stage-roast) 66.66%, 
            var(--color-stage-roast) 100%
          )`,
          boxShadow: "0 0 10px rgba(0,0,0,0.1)",
        }}
      />
    </div>
  );
};
