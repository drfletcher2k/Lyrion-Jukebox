import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import styles from './QRCodeDisplay.module.css';

export default function QRCodeDisplay({ url }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!url || !canvasRef.current) return;
    QRCode.toCanvas(canvasRef.current, url, {
      width: 160,
      margin: 1,
      color: {
        dark: '#ededf5',
        light: '#17171e',
      },
    });
  }, [url]);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
      <span className={styles.hint}>Scan to request</span>
    </div>
  );
}
