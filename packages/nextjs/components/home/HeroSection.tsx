export const HeroSection = () => {
  return (
    <div className="flex flex-col justify-center items-center lg:items-start text-center lg:text-start lg:pl-32 px-8 py-20">
      <div className="flex items-center gap-2 mb-7">
        <span className="w-5 h-px bg-primary" />
        <span className="text-primary text-xs font-medium tracking-[0.2em] uppercase">Hawaiian Coffee · On-Chain</span>
      </div>

      <h1 className="flex flex-col gap-1 font-serif text-5xl lg:text-7xl font-light leading-[1.08] text-base-content mb-7">
        <span>
          <span className="italic text-accent">Track</span> Every
        </span>
        <span className="font-semibold">Bean&apos;s Journey</span>
        <span>to Your Cup</span>
      </h1>

      <p className="text-secondary text-base font-light leading-relaxed max-w-md mb-10">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sem erat, finibus non nisl nec, scelerisque
        rutrum ligula. Cras dictum congue ante commodo posuere. Etiam imperdiet eu lacus facilisis ornare. Donec
        eleifend nec quam ac suscipit.
      </p>

      <div className="flex flex-nowrap gap-3 mb-10">
        <button className="btn btn-primary px-7 text-sm tracking-wide flex-1 min-w-[10rem] text-nowrap">
          Track Your Coffee
        </button>
        <button className="btn btn-ghost border border-base-300 px-7 text-sm tracking-wide flex-1 min-w-[10rem text-nowrap]">
          View on Chain
        </button>
      </div>
    </div>
  );
};
