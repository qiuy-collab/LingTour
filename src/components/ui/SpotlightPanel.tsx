"use client";

import { type ReactNode, useState } from "react";

type SpotlightPanelProps = {
  children: ReactNode;
  className?: string;
  dark?: boolean;
};

export function SpotlightPanel({ children, className = "", dark = false }: SpotlightPanelProps) {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  return (
    <div
      className={`spotlight-panel ${dark ? "spotlight-panel-dark" : ""} ${className}`}
      style={{
        "--spot-x": `${position.x}%`,
        "--spot-y": `${position.y}%`,
      } as React.CSSProperties}
      onMouseMove={(event) => {
        const rect = event.currentTarget.getBoundingClientRect();
        setPosition({
          x: ((event.clientX - rect.left) / rect.width) * 100,
          y: ((event.clientY - rect.top) / rect.height) * 100,
        });
      }}
    >
      {children}
    </div>
  );
}
