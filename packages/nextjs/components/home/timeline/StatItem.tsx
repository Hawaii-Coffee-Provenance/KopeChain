import { Stat } from "./index";

const StatItem = ({ stat }: { stat: Stat }) => (
  <div className="flex flex-col">
    <div className={`flex items-baseline text-muted`}>
      <span className="text-4xl font-serif text-muted">{stat.value}</span>
      {stat.unit && <span className="text-lg ml-1">{stat.unit}</span>}
    </div>
    <span className={`text-xs font-bold tracking-widest mt-1 text-muted whitespace-nowrap`}>{stat.label}</span>
  </div>
);

export default StatItem;
