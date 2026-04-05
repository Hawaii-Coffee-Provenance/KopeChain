"use client";

import { useRouter } from "next/navigation";
import HomeLiveScroller from "./HomeLiveScroller";

type Props = {
  onOpenQr?: () => void;
};

const HeroSection = ({ onOpenQr }: Props) => {
  const router = useRouter();
  return (
    <>
      {/* Centered hero content */}
      <div className="flex flex-col items-center text-center max-w-3xl mx-auto w-full">
        <div className="flex items-center justify-center gap-2 mb-8">
          <span className="w-5 h-px bg-primary" />
          <span className="text-label text-primary!">Hawaiian Coffee · On the Chain</span>
          <span className="w-5 h-px bg-primary" />
        </div>

        <h1 className="heading-hero flex flex-col items-center justify-center gap-1 mb-5">
          <span>
            <span className="italic text-accent">Track</span> Every
          </span>
          <span className="font-semibold">Bean&apos;s Journey</span>
          <span>to Your Cup</span>
        </h1>

        <p className="text-muted text-base font-light leading-relaxed max-w-md mb-10 text-center mx-auto">
          Transparent provenance secured on the blockchain.
          <br />
          Use decentralized tracking to verify the authentic island roots and complete physical history of every coffee
          batch.
        </p>

        <div className="flex flex-row w-full max-w-md justify-center gap-3 mx-auto mb-5">
          <button onClick={onOpenQr} className="btn btn-primary flex-1 px-2 sm:px-4 text-base tracking-wide">
            Scan Your Coffee
          </button>
          <button
            onClick={() => router.push("/explore")}
            className="btn btn-ghost border flex-1 px-2 sm:px-4 text-base tracking-wide"
          >
            Explore The Chain
          </button>
        </div>
      </div>

      <HomeLiveScroller />
    </>
  );
};

export default HeroSection;
