type SkeletonProps = {
  className?: string;
};

const Skeleton = ({ className = "" }: SkeletonProps) => (
  <div className={`bg-base-300 rounded animate-pulse ${className}`} />
);

export default Skeleton;
