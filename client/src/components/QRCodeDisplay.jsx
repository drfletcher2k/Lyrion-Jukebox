import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import styles from './QRCodeDisplay.module.css';

export default function QRCodeDisplay({ url }) {
  const [dataUrl, setDataUrl] = useState('');

  useEffect(() => {
    if (!url) return;
    QRCode.toDataURL(url, {
      width: 140,
      margin: 2,
      color: {
        dark: '#ededf5',
        light: '#17171e',
      },
    })
      .then(setDataUrl)
      .catch(() => {});
  }, [url]);

  if (!dataUrl) return null;

  return (
    <div className={styles.wrapper}>
      <img src={dataUrl} alt="QR code to request a song" className={styles.qrImg} />
      <span className={styles.hint}>Scan to request</span>
    </div>
  );
}
