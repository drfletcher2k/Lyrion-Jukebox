import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import styles from './QRCodeDisplay.module.css';

export default function QRCodeDisplay({ url, size = 96 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    const computed = getComputedStyle(document.documentElement);
    const dark = computed.getPropertyValue('--text').trim() || '#ededf5';
    const light = computed.getPropertyValue('--surface2').trim() || '#17171e';

    QRCode.toCanvas(canvasRef.current, url, {
      width: size,
      margin: 1,
      color: { dark, light },
    });
  }, [url, size]);

  return (
    <div className={styles.wrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
        aria-label="QR code for guest song requests"
      />
      <span className={styles.hint}>Scan to request</span>
    </div>
  );
}
