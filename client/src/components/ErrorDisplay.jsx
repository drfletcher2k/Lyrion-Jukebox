import styles from './ErrorDisplay.module.css';

export default function ErrorDisplay({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className={styles.container}>
      <span className={styles.message}>{message}</span>
      {onDismiss && (
        <button className={styles.dismiss} onClick={onDismiss} aria-label="Dismiss">
          ✕
        </button>
      )}
    </div>
  );
}
