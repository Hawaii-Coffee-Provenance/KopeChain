type MapPinProps = {
  color: string;
  className?: string;
};

const MapPin = ({ color, className = "w-8 h-8" }: MapPinProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    className={className}
    style={{ filter: "drop-shadow(0 2px 5px rgba(0,0,0,0.35))" }}
  >
    {/* Outer pin */}
    <path
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
      fill={color}
      stroke="var(--color-base-100)"
      strokeWidth="1.2"
      strokeLinejoin="round"
    />
    {/* Inner circle */}
    <path d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" fill="var(--color-base-100)" />
  </svg>
);

export default MapPin;
