"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ProgressCircleProps {
  value: number;
  size?: number | "sm" | "md" | "lg";
  strokeWidth?: number;
  className?: string;
  textClassName?: string;
  showPercentage?: boolean;
  color?: string;
  bgColor?: string;
}

/**
 * Componente de círculo de progresso que exibe um valor percentual em um formato circular
 */
export function ProgressCircle({
  value,
  size = 100,
  strokeWidth = 4,
  className,
  textClassName,
  showPercentage = true,
  color = "hsl(var(--primary))",
  bgColor = "hsl(var(--muted))",
}: ProgressCircleProps) {
  // Converter string de tamanho para número
  let sizeNumber = size;
  if (size === "sm") sizeNumber = 60;
  if (size === "md") sizeNumber = 100;
  if (size === "lg") sizeNumber = 120;
  
  // Converter para número garantindo que é um valor numérico
  const sizeValue = typeof sizeNumber === "number" ? sizeNumber : 100;
  
  const normalizedValue = Math.min(100, Math.max(0, value));
  const radius = (sizeValue - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (normalizedValue / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)} style={{ height: sizeValue, width: sizeValue }}>
      <svg className="absolute" width={sizeValue} height={sizeValue}>
        <circle
          className="transition-all duration-300 ease-in-out"
          stroke={bgColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={sizeValue / 2}
          cy={sizeValue / 2}
        />
        <circle
          className="transition-all duration-300 ease-in-out"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={sizeValue / 2}
          cy={sizeValue / 2}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform={`rotate(-90 ${sizeValue / 2} ${sizeValue / 2})`}
        />
      </svg>
      {showPercentage && (
        <div className={cn("text-center font-medium", textClassName)}>
          <span>{Math.round(normalizedValue)}%</span>
        </div>
      )}
    </div>
  );
} 