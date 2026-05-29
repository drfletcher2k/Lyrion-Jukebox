import styles from './QueueList.module.css';

const STATUS_LABELS = {
  pending: 'Pending',
  inserted: 'Up Next',
  playing: 'Playing',
};

const SKELETON_COUNT = 3;

function SkeletonRow({ delay }) {
  return (
    <div className={styles.skeletonRow} style={{ animationDelay: `${delay}ms` }}>
      <div className={`${styles.skeletonPos} ${styles.shimmer}`} />
      <div className={`${styles.skeletonArt} ${styles.shimmer}`} />
      <div className={styles.skeletonInfo}>
        <div className={`${styles.skeletonTitle} ${styles.shimmer}`} />
        <div className={`${styles.skeletonSub} ${styles.shimmer}`} />
      </div>
      <div className={`${styles.skeletonBadge} ${styles.shimmer}`} />
    </div>
  );
}

export default function QueueList({ queue, adminMode, onRemove, onMove, onSkip, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonRow key={i} delay={i * 60} />
        ))}
      </div>
    );
  }

  if (!queue || !queue.length) {
    return <div className={styles.empty}>No requests in the queue yet</div>;
  }

  const pendingItems = queue.filter((q) => q.status === 'pending');

  return (
    <div className={styles.list}>
      {queue.map((item, idx) => (
        <div key={item.id} className={styles.row} data-status={item.status}>
          <span className={styles.pos}>{idx + 1}</span>
          {item.album_art_url ? (
            <img
              src={item.album_art_url}
              alt={item.album}
              className={styles.art}
            />
          ) : (
            <div className={styles.artPlaceholder} />
          )}
          <div className={styles.info}>
            <div className={styles.title}>{item.title}</div>
            <div className={styles.sub}>{item.artist}</div>
            {item.guest_name && (
              <div className={styles.guest}>Requested by {item.guest_name}</div>
            )}
          </div>
          <div className={styles.right}>
            <span className={`${styles.badge} ${styles[item.status] || ''}`}>
              {STATUS_LABELS[item.status] || item.status}
            </span>
            {adminMode && (
              <div className={styles.adminBtns}>
                {item.status === 'pending' && (
                  <>
                    <button
                      className="btn-ghost"
                      title="Move up"
                      onClick={() => onMove(item.id, 'up')}
                      disabled={idx === 0}
                    >
                      ↑
                    </button>
                    <button
                      className="btn-ghost"
                      title="Move down"
                      onClick={() => onMove(item.id, 'down')}
                      disabled={idx === pendingItems.length - 1}
                    >
                      ↓
                    </button>
                    <button
                      className="btn-danger"
                      title="Remove"
                      onClick={() => onRemove(item.id)}
                    >
                      ✕
                    </button>
                  </>
                )}
                {(item.status === 'inserted' || item.status === 'playing') && (
                  <button
                    className="btn-danger"
                    title="Skip"
                    onClick={() => onSkip(item.id)}
                  >
                    Skip
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
