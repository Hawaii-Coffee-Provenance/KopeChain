import { ReactNode } from "react";

const DataRow = ({
  title,
  value,
  children,
  itemsStart = false,
  hasBorder = true,
}: {
  title: string;
  value?: ReactNode;
  children?: ReactNode;
  itemsStart?: boolean;
  hasBorder?: boolean;
}) => {
  const content = value ?? children;
  return (
    <div
      className={`flex justify-between py-2 border-base-300 ${itemsStart ? "items-start" : "items-center"} ${
        hasBorder ? "border-b border-base-300" : ""
      }`}
    >
      <span
        className={`text-xs font-bold tracking-wide uppercase text-base-content w-[130px] shrink-0 ${
          itemsStart ? "mt-0.5" : ""
        }`}
      >
        {title}
      </span>
      <div className="flex-1 px-4 font-medium text-md text-muted text-left">{content}</div>
    </div>
  );
};

export default DataRow;
