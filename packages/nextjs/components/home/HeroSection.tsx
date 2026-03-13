import { useRouter } from "next/navigation";

type Props = {
  onOpenQr?: () => void;
};

export const HeroSection = ({ onOpenQr }: Props) => {
  const router = useRouter();

  return (
    <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-start lg:pl-32 px-8 py-20">
      <div className="flex items-center gap-2 mb-7">
        <span className="w-5 h-px bg-primary" />
        <span className="text-label text-primary">Hawaiian Coffee · On the Chain</span>
      </div>

      <h1 className="heading-hero flex flex-col gap-1 mb-7">
        <span>
          <span className="italic text-accent">Track</span> Every
        </span>
        <span className="font-semibold">Bean&apos;s Journey</span>
        <span>to Your Cup</span>
      </h1>

      <p className="text-muted text-base font-light leading-relaxed max-w-md mb-10">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque
        rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec
        eleifend nec quam ac suscipit.
      </p>

      <div className="flex flex-nowrap gap-3 mb-10">
        <button
          onClick={onOpenQr}
          className="btn btn-primary px-7 text-sm tracking-wide flex-1 min-w-[10rem] text-nowrap"
        >
          Scan Your Coffee
        </button>
        <button
          onClick={() => router.push("/explore")}
          className="btn btn-ghost border px-7 text-sm tracking-wide flex-1 min-w-[10rem] text-nowrap"
        >
          Explore the Chain
        </button>
      </div>
    </div>
  );
};
