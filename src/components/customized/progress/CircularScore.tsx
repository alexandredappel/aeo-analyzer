"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CircularScoreProps {
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  circleStrokeWidth?: number;
  progressStrokeWidth?: number;
  shape?: "square" | "round";
  className?: string;
  progressClassName?: string;
  showLabel?: boolean; // default false (no percentage label inside)
  renderLabel?: (progress: number) => number | string;
  labelClassName?: string;
}

export const CircularScore: React.FC<CircularScoreProps> = ({
  value,
  className,
  progressClassName,
  showLabel = false,
  renderLabel,
  labelClassName,
  shape = "round",
  size = 64,
  strokeWidth,
  circleStrokeWidth = 8,
  progressStrokeWidth = 8,
}) => {
  const clamped = Math.max(0, Math.min(100, value));
  const radius = size / 2 - 10;
  const circumference = Math.ceil(3.14 * radius * 2);
  const percentage = Math.ceil(circumference * ((100 - clamped) / 100));

  const viewBox = `-${size * 0.125} -${size * 0.125} ${size * 1.25} ${size * 1.25}`;

  return (
    <div className="relative">
      <svg
        width={size}
        height={size}
        viewBox={viewBox}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: "rotate(-90deg)" }}
        className="relative"
      >
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          fill="transparent"
          strokeWidth={strokeWidth ?? circleStrokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset="0"
          className={cn("stroke-primary/25", className)}
        />
        <circle
          r={radius}
          cx={size / 2}
          cy={size / 2}
          strokeWidth={strokeWidth ?? progressStrokeWidth}
          strokeLinecap={shape}
          strokeDashoffset={percentage}
          fill="transparent"
          strokeDasharray={circumference}
          className={cn("stroke-primary", progressClassName)}
        />
      </svg>
      {showLabel && (
        <div
          className={cn(
            "absolute inset-0 flex items-center justify-center leading-none",
            labelClassName
          )}
          style={{ fontSize: `${Math.round(size * 0.28)}px` }}
        >
          {renderLabel ? renderLabel(clamped) : clamped}
        </div>
      )}
    </div>
  );
};

export default CircularScore;


