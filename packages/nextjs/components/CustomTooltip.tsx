"use client";

import React from "react";

type CustomTooltipProps = {
  message: string;
  children: React.ReactNode;
  onClick?: () => void;
  open?: boolean;
  className?: string;
};

export const CustomTooltip = ({ message, children, onClick, open, className = "" }: CustomTooltipProps) => {
  return (
    <div
      className={`tooltip tooltip-top flex w-fit max-w-full ${onClick ? "cursor-pointer" : ""} ${
        open ? "tooltip-open" : ""
      } ${className}`}
      data-tip={message}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

export default CustomTooltip;
