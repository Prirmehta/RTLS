// src/components/TooltipWrapper.tsx
import React, { useState } from "react";

const TooltipWrapper = ({
  children,
  message
}: {
  children: React.ReactNode;
  message: string;
}) => {
  const [visible, setVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    setCoords({ x: e.clientX, y: e.clientY });
    setVisible(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setCoords({ x: e.clientX, y: e.clientY });
  };

  const handleMouseLeave = () => {
    setVisible(false);
  };

  return (
    <div
      style={{ position: "relative", display: "inline-block" }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {visible && (
        <div
          style={{
            position: "fixed",
            top: coords.y + 10,
            left: coords.x + 10,
            background: "#333",
            color: "#fff",
            padding: "4px 8px",
            borderRadius: "4px",
            fontSize: "12px",
            pointerEvents: "none",
            zIndex: 999
          }}
        >
          {message}
        </div>
      )}
      {children}
    </div>
  );
};

export default TooltipWrapper;
