"use client";

import { useCallback, useState } from "react";
import QrModal from "../components/QrModal";
import ActivitySection from "../components/home/ActivitySection";
import ChainSection from "../components/home/ChainSection";
import HeroSection from "../components/home/HeroSection";
import MapSection from "../components/home/MapSection";
import type { NextPage } from "next";

const Home: NextPage = () => {
  const [qrOpen, setQrOpen] = useState(false);

  const handleQrClose = useCallback(() => {
    setQrOpen(false);
  }, []);

  return (
    <div className="min-h-screen bg-base-200">
      <QrModal isOpen={qrOpen} onClose={handleQrClose} />
      <section className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
        <HeroSection onOpenQr={() => setQrOpen(true)} />
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
