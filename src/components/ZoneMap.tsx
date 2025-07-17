import React from 'react';

interface ZoneMapProps {
  isDarkMode
: boolean;
  zoneCoordinates: {
    [key: string]: { x: number; y: number; width: number; height: number } | null;
  };
  selectedZone: string;
}

const ZoneMap: React.FC<ZoneMapProps> = ({
  isDarkMode
,
  zoneCoordinates,
  selectedZone,
}) => {
  const getFillColor = (zone: string) => {
    const baseColor = isDarkMode
 ? '#444' : '#d3d3d3';
    const selectedColor = isDarkMode
 ? '#8884d8' : '#8884d8';
    return selectedZone === zone ? selectedColor : baseColor;
  };

  const getTextColor = () => (isDarkMode
 ? '#fff' : '#000');

  return (
    <>
      {Object.entries(zoneCoordinates).map(([zoneName, coords]) => {
        if (!coords) return null;

        return (
          <g key={zoneName}>
            <rect
              x={coords.x}
              y={coords.y}
              width={coords.width}
              height={coords.height}
              fill={getFillColor(zoneName)}
              stroke={selectedZone === zoneName ? '#FFD700' : 'none'}
              strokeWidth={selectedZone === zoneName ? 3 : 0}
              rx={6}
              ry={6}
            />
            <text
              x={coords.x + 10}
              y={coords.y + 20}
              fontSize="14"
              fill={getTextColor()}
            >
              {zoneName}
            </text>
          </g>
        );
      })}
    </>
  );
};

export default ZoneMap;
