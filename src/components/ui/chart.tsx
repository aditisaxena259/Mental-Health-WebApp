// components/ui/chart.tsx
"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: ChartData[];
  className?: string;
  height?: string;
}

export function BarChart({ data, className, height = "h-64" }: BarChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value));

  return (
    <div className={cn("w-full", height, className)}>
      <div className="flex items-end justify-between gap-2 h-full">
        {data.map((item, index) => (
          <div key={index} className="flex-1 flex flex-col items-center gap-2">
            <div className="w-full flex items-end h-full">
              <div
                className={cn(
                  "w-full rounded-t-md transition-all duration-500 ease-out hover:opacity-80",
                  item.color || "bg-primary"
                )}
                style={{
                  height: `${(item.value / maxValue) * 100}%`,
                }}
                title={`${item.label}: ${item.value}`}
              />
            </div>
            <span className="text-xs text-muted-foreground text-center">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface DonutChartProps {
  data: ChartData[];
  className?: string;
  size?: number;
}

export function DonutChart({ data, className, size = 200 }: DonutChartProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let cumulativePercent = 0;

  const colors = [
    "text-blue-500",
    "text-green-500",
    "text-amber-500",
    "text-red-500",
    "text-purple-500",
  ];

  return (
    <div className={cn("flex items-center gap-6", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg
          viewBox="0 0 100 100"
          className="transform -rotate-90"
          style={{ width: size, height: size }}
        >
          {data.map((item, index) => {
            const percent = (item.value / total) * 100;
            const strokeDasharray = `${percent} ${100 - percent}`;
            const strokeDashoffset = -cumulativePercent;
            cumulativePercent += percent;

            return (
              <circle
                key={index}
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke={
                  item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`
                }
                strokeWidth="20"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
                className="transition-all duration-500"
              />
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-muted-foreground">Total</div>
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor:
                  item.color || `hsl(${(index * 360) / data.length}, 70%, 50%)`,
              }}
            />
            <span className="text-sm">
              {item.label}: <span className="font-semibold">{item.value}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: { x: string; y: number }[];
  className?: string;
  height?: string;
}

export function LineChart({
  data,
  className,
  height = "h-64",
}: LineChartProps) {
  const maxY = Math.max(...data.map((d) => d.y));
  const minY = Math.min(...data.map((d) => d.y));
  const range = maxY - minY || 1;

  const points = data
    .map((point, index) => {
      const x = (index / (data.length - 1)) * 100;
      const y = 100 - ((point.y - minY) / range) * 100;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className={cn("w-full", height, className)}>
      <svg
        viewBox="0 0 100 100"
        className="w-full h-full"
        preserveAspectRatio="none"
      >
        <polyline
          points={points}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          className="transition-all duration-500"
        />
        {data.map((point, index) => {
          const x = (index / (data.length - 1)) * 100;
          const y = 100 - ((point.y - minY) / range) * 100;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="2"
              fill="hsl(var(--primary))"
              className="hover:r-3 transition-all"
            />
          );
        })}
      </svg>
      <div className="flex justify-between mt-2">
        {data.map((point, index) => (
          <span key={index} className="text-xs text-muted-foreground">
            {point.x}
          </span>
        ))}
      </div>
    </div>
  );
}
