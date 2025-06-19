import React from 'react';

// Define asset type
interface Asset {
  id: number;
  type: 'machinery' | 'operator';
  x: number;
  y: number;
}

const AssetLayout: React.FC = () => {
  const assets: Asset[] = [
    { id: 1, type: 'machinery', x: 30, y: 30 },
    { id: 2, type: 'machinery', x: 100, y: 60 },
    { id: 3, type: 'operator', x: 60, y: 120 },
    { id: 4, type: 'operator', x: 140, y: 100 },
  ];

  const getAssetColor = (type: Asset['type']): string => {
    return type === 'machinery' ? 'orange' : 'blue';
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.rectangle}>
        {/* Asset Area */}
        <div style={styles.assetArea}>
          <div style={styles.label}>Asset Area</div>
          {assets.map((asset) => (
            <div
              key={asset.id}
              style={{
                ...styles.assetDot,
                backgroundColor: getAssetColor(asset.type),
                left: asset.x,
                top: asset.y,
              }}
            >
              <div style={styles.tooltip}>ID: #{asset.id}</div>
            </div>
          ))}
        </div>

        {/* Office */}
        <div style={styles.office}>
          <div style={styles.label}>Office</div>
        </div>

        {/* Storage Area */}
        <div style={styles.storage}>
          <div style={styles.label}>Storage Area</div>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  wrapper: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#f0f2f5',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  rectangle: {
    width: '700px',
    height: '500px',
    backgroundColor: 'white',
    border: '2px solid #ccc',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    position: 'relative',
  },
  label: {
    fontWeight: 'bold',
    fontSize: '14px',
    marginBottom: '4px',
  },
  assetArea: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: '250px',
    height: '200px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '6px',
  },
  office: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: '200px',
    height: '100px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '6px',
  },
  storage: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: '200px',
    height: '100px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    padding: '6px',
  },
  assetDot: {
    width: 20,
    height: 20,
    borderRadius: '50%',
    position: 'absolute',
    cursor: 'pointer',
  },
  tooltip: {
    position: 'absolute',
    top: -28,
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'black',
    color: 'white',
    padding: '3px 8px',
    fontSize: '12px',
    borderRadius: '4px',
    whiteSpace: 'nowrap',
    opacity: 0,
    pointerEvents: 'none',
    transition: 'opacity 0.2s ease',
  },
};

// Tooltip hover effect using JavaScript
if (typeof window !== 'undefined') {
  setTimeout(() => {
    const styleSheet = document.styleSheets[0];
    styleSheet.insertRule(
      `div[style*="border-radius: 50%"]:hover > div {
        opacity: 1;
      }`,
      styleSheet.cssRules.length
    );
  }, 0);
}

export default AssetLayout;
