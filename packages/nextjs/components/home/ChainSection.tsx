"use client";

import { useState } from "react";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/react/24/outline";

const STEPS = [
  {
    step: 1,
    title: "Harvest",
    color: "text-primary",
    borderColor: "border-primary",
    h1: "Where Every",
    h2: "Journey Begins",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
    image: "/harvest.png",
  },
  {
    step: 2,
    title: "Process",
    color: "text-accent",
    borderColor: "border-accent",
    h1: "Cherry to",
    h2: "Green Bean",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
    image: "/process.png",
  },
  {
    step: 3,
    title: "Roast",
    color: "text-[#B07D3A]",
    borderColor: "border-[#B07D3A]",
    h1: "Unlocking",
    h2: "the Flavour",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
    image: "/roast.png",
  },
  {
    step: 4,
    title: "Distribute",
    color: "text-secondary",
    borderColor: "border-secondary",
    h1: "From Island",
    h2: "to Your Cup",
    content:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec eleifend nec quam ac suscipit.",
    image: "/distribute.png",
  },
];

export const ChainSection = () => {
  const [activeStep, setActiveStep] = useState<number>(1);
  const active = STEPS[activeStep - 1];

  const goTo = (next: number) => setActiveStep(next);
  const prev = () => {
    if (activeStep > 1) goTo(activeStep - 1);
  };
  const next = () => {
    if (activeStep < STEPS.length) goTo(activeStep + 1);
  };

  return (
    <section className="w-full bg-base-200 py-20 border-t border-base-300">
      <div className="max-w-7xl mx-auto px-6 lg:px-16">
        <div className="flex items-end justify-between mb-12">
          <div>
            <span className="text-primary text-xs font-medium tracking-[0.2em] uppercase mb-3 block">How It Works</span>
            <h2 className="font-serif text-5xl lg:text-6xl font-light leading-[1.08] text-base-content">
              <span className="flex items-center gap-4">
                <span className="font-semibold">The Supply Chain</span>
                <span className="w-12 h-0.5 bg-base-content mt-1 flex-shrink-0 opacity-20" />
              </span>
              <span className="italic text-accent block">Every Step Recorded</span>
            </h2>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 lg:items-stretch lg:h-[420px]">
          <ul className="steps steps-horizontal lg:steps-vertical flex-shrink-0">
            {STEPS.map(({ step, title }) => (
              <li
                key={step}
                onClick={() => goTo(step)}
                className={`step cursor-pointer text-sm lg:text-base font-medium transition-colors
          ${step <= activeStep ? "step-primary" : ""}
          ${step === activeStep ? "text-base-content" : "text-base-content/40"}
        `}
                style={{ height: "calc(420px / 4)" }}
              >
                <span className="hidden lg:inline">{title}</span>
                <span className="lg:hidden text-xs">{title}</span>
              </li>
            ))}
          </ul>

          <div className="flex-1 relative h-full">
            <div className="absolute top-2 left-0 w-full flex justify-center z-10">
              <button
                onClick={prev}
                disabled={activeStep === 1}
                className="btn btn-ghost btn-sm disabled:opacity-80"
                aria-label="Previous step"
              >
                <ChevronUpIcon className="h-4 w-4" />
              </button>
            </div>

            <div className="absolute bottom-2 left-0 w-full flex justify-center z-10">
              <button
                onClick={next}
                disabled={activeStep === STEPS.length}
                className="btn btn-ghost btn-sm disabled:opacity-80"
                aria-label="Next step"
              >
                <ChevronDownIcon className="h-4 w-4" />
              </button>
            </div>

            <div
              key={activeStep}
              className={`h-full bg-base-100 border ${active.borderColor} rounded-xl p-6 lg:p-10 flex flex-col gap-4 lg:gap-6 overflow-hidden animate-[slideIn_0.35s_ease_both]`}
            >
              <p className={`text-xs font-medium tracking-[0.2em] uppercase ${active.color}`}>
                Step 0{active.step} — {active.title}
              </p>
              <h3 className={`font-serif text-3xl lg:text-5xl font-light leading-[1.08] ${active.color}`}>
                {active.h1}
                <br />
                <span className="font-semibold">{active.h2}</span>
              </h3>
              <p className="text-sm text-base-content/60 leading-relaxed max-w-lg">{active.content}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
