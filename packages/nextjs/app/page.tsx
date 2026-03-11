"use client";

import { ActivitySection } from "../components/home/ActivitySection";
import { ChainSection } from "../components/home/ChainSection";
import { DashboardSection } from "../components/home/DashboardSection";
import { HeroSection } from "../components/home/HeroSection";
import { MapSection } from "../components/home/MapSection";
import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <div className="min-h-screen bg-base-200">
      <section className="grid lg:grid-cols-2 min-h-[calc(100vh-4rem)]">
        <HeroSection />
        <DashboardSection />
      </section>

      <section className="grid min-h-[calc(100vh-4rem)]">
        <MapSection />
      </section>

      <section className="grid min-h-[calc(100vh-4rem)]">
        <ChainSection />
      </section>

      <section className="grid min-h-[calc(100vh-4rem)]">
        <ActivitySection />
      </section>
    </div>
  );
};

export default Home;
