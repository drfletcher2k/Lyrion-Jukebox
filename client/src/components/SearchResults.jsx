import styles from './SearchResults.module.css';

const SKELETON_COUNT = 5;

function formatDuration(ms) {
  if (!ms) return '';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function SkeletonRow() {
  return (
    <div className={styles.skeletonRow}>
      <div className={`${styles.skeletonArt} ${styles.shimmer}`} />
      <div className={styles.skeletonInfo}>
        <div className={`${styles.skeletonTitle} ${styles.shimmer}`} />
        <div className={`${styles.skeletonSub} ${styles.shimmer}`} />
      </div>
      <div className={styles.skeletonRight}>
        <div className={`${styles.skeletonDuration} ${styles.shimmer}`} />
        <div className={`${styles.skeletonBtn} ${styles.shimmer}`} />
      </div>
    </div>
  );
}

export default function SearchResults({ tracks, onRequest, requesting, isLoading }) {
  if (isLoading) {
    return (
      <div className={styles.list}>
        {Array.from({ length: SKELETON_COUNT }, (_, i) => (
          <SkeletonRow key={i} />
        ))}
      </div>
    );
  }

  if (!tracks.length) return null;

  return (
    <div className={styles.list}>
      {tracks.map((track) => (
        <div key={track.spotify_track_id} className={styles.row}>
          {track.album_art_url ? (
            <img
              src={track.album_art_url}
              alt={track.album}
              className={styles.art}
            />
          ) : (
            <div className={styles.artPlaceholder} />
          )}
          <div className={styles.info}>
            <div className={styles.title}>{track.title}</div>
            <div className={styles.sub}>
              {track.artist}&mdash;{track.album}
            </div>
          </div>
          <div className={styles.right}>
            <span className={styles.duration}>
              {formatDuration(track.duration_ms)}
            </span>
            <button
              className="btn-primary"
              onClick={() => onRequest(track)}
              disabled={requesting === track.spotify_track_id}
            >
              {requesting === track.spotify_track_id ? '…' : 'Request'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
