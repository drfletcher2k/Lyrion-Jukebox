import styles from './NowPlaying.module.css';

function formatDuration(ms) {
  if (!ms) return '0:00';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NowPlaying({ nowPlaying }) {
  if (!nowPlaying) {
    return (
      <div className={styles.empty}>
        <span>Nothing playing</span>
      </div>
    );
  }

  const progress =
    nowPlaying.duration_ms && nowPlaying.position_ms
      ? Math.min(100, (nowPlaying.position_ms / nowPlaying.duration_ms) * 100)
      : 0;

  return (
    <div className={styles.container}>
      {nowPlaying.albumArtUrl ? (
        <img src={nowPlaying.albumArtUrl} alt={nowPlaying.album} className={styles.art} />
      ) : (
        <div className={styles.artPlaceholder} />
      )}
      <div className={styles.info}>
        <div className={styles.title}>{nowPlaying.title || 'Unknown'}</div>
        <div className={styles.artist}>{nowPlaying.artist || ''}</div>
        <div className={styles.album}>{nowPlaying.album || ''}</div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
        <div className={styles.times}>
          <span>{formatDuration(nowPlaying.position_ms)}</span>
          <span>{formatDuration(nowPlaying.duration_ms)}</span>
        </div>
      </div>
    </div>
  );
}
