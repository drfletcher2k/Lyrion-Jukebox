import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRCodeDisplay({ url }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 180,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });
  }, [url]);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <canvas ref={canvasRef} style={{ borderRadius: 8 }} />
      <span style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center' }}>
        Scan to request a song
      </span>
    </div>
  );
}
