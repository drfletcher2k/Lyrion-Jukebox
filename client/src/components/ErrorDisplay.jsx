export default function ErrorDisplay({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      style={{
        background: '#3a1a1a',
        border: '1px solid var(--danger)',
        borderRadius: 'var(--radius)',
        padding: '12px 16px',
        color: '#f87171',
        fontSize: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <span>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: '#f87171',
            fontSize: 16,
            padding: '0 4px',
            cursor: 'pointer',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
