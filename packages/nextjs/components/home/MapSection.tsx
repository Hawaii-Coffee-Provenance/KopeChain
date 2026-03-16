"use client";

import { HomeMap } from "./HomeMap";

export const MapSection = () => {
  return (
    <section className="w-full bg-base-200 py-20">
      <div className="max-w-7xl mx-auto section-padding">
        <div className="flex items-end justify-between mb-8">
          <div>
            <span className="text-label text-primary! mb-3 block">Grown on the Islands</span>
            <h2 className="heading-section">
              <span className="font-semibold">Hawaiian Coffee Belt</span>
            </h2>
          </div>
        </div>

        <HomeMap />
      </div>
    </section>
  );
};
