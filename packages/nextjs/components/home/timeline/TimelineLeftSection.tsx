"use client";

import { StepType } from "./index";
import { AnimatePresence, motion } from "framer-motion";

const TimelineLeftSection = ({ activeItem, activeIndex }: { activeItem: StepType; activeIndex: number }) => (
  <div className="hidden lg:flex flex-1 flex-col justify-center items-start pr-8 md:pr-16 text-left relative min-h-0">
    {/* Desktop Header */}
    <AnimatePresence mode="wait">
      <motion.div
        key={`left-${activeIndex}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full flex flex-col items-start max-w-sm ml-auto"
      >
        <p className={`text-label ${activeItem.color} font-bold mb-3`}>
          Step 0{activeItem.step} — {activeItem.title}
        </p>
        <h3 className={`heading-card leading-tight text-base-content whitespace-pre-line m-0 font-bold`}>
          {activeItem.header}
        </h3>
      </motion.div>
    </AnimatePresence>
  </div>
);

export default TimelineLeftSection;
