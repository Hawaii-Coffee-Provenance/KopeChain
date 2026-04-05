"use client";

import StatItem from "./StatItem";
import { StepType } from "./index";
import { AnimatePresence, motion } from "framer-motion";

const TimelineRightSection = ({ activeItem, activeIndex }: { activeItem: StepType; activeIndex: number }) => (
  <div className="flex-1 order-2 lg:order-3 flex flex-col justify-center items-start pl-10 text-left relative min-h-0">
    {/* Mobile Header */}
    <AnimatePresence mode="wait">
      <motion.div
        key={`header-${activeIndex}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full lg:hidden mb-6"
      >
        <p className="text-label text-sm!">
          Step 0{activeItem.step}
          <span className="mx-2">—</span>
          <span className={activeItem.color}>{activeItem.title}</span>
        </p>
        <h3 className={`heading-card leading-tight text-base-content whitespace-pre-line m-0 font-bold`}>
          {activeItem.header}
        </h3>
      </motion.div>
    </AnimatePresence>

    {/* Content + Stats */}
    <AnimatePresence mode="wait">
      <motion.div
        key={`right-${activeIndex}`}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3, ease: "easeOut", delay: 0.1 }}
        className="w-full max-w-md"
      >
        <p className="text-md text-muted leading-relaxed font-medium m-0">{activeItem.content}</p>

        <div className="mt-8 border-t border-base-300 pt-6 flex items-end gap-4">
          <StatItem stat={activeItem.stat1} />
          <StatItem stat={activeItem.stat2} />
          <StatItem stat={activeItem.stat3} />
        </div>
      </motion.div>
    </AnimatePresence>
  </div>
);

export default TimelineRightSection;
