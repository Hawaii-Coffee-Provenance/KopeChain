import { useRouter } from "next/navigation";
import { useCoffeeTracker } from "~~/hooks/useCoffeeTracker";

type Props = {
  onOpenQr?: () => void;
};

const HeroSection = ({ onOpenQr }: Props) => {
  const router = useRouter();
  const { stats } = useCoffeeTracker();
  const newBatchesThisWeek = stats?.batchesThisWeek;

  return (
    <div className="flex flex-col justify-center items-center text-center section-padding py-20 max-w-3xl mx-auto">
      <div className="flex items-center justify-center gap-2 mb-7">
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
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque
        rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec
        eleifend nec quam ac suscipit.
      </p>

      <div className="flex flex-row w-full max-w-md justify-center gap-3 mb-5 mx-auto">
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

      <p className="flex items-center justify-center gap-2 text-center text-hint mt-3 text-sm">
        <span className="inline-grid *:[grid-area:1/1]">
          <span className="status status-success animate-ping"></span>
          <span className="status status-success"></span>
        </span>
        {newBatchesThisWeek ?? "-"} new batches tracked in the past week
      </p>
    </div>
  );
};

export default HeroSection;
