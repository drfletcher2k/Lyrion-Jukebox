import { useState } from 'react';
import styles from './NowPlaying.module.css';

function formatDuration(ms) {
  if (!ms) return '0:00';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function NowPlaying({ nowPlaying, isLoading = false }) {
  const [artErrorId, setArtErrorId] = useState(null);

  if (isLoading) {
    return (
      <div className={styles.container} aria-busy="true">
        <div className={`${styles.artPlaceholder} ${styles.shimmer}`} />
        <div className={styles.info}>
          <div className={`${styles.skeletonLabel} ${styles.shimmer}`} />
          <div className={`${styles.skeletonTitle} ${styles.shimmer}`} />
          <div className={`${styles.skeletonArtist} ${styles.shimmer}`} />
          <div className={`${styles.skeletonAlbum} ${styles.shimmer}`} />
          <div className={`${styles.skeletonProgress} ${styles.shimmer}`} />
        </div>
      </div>
    );
  }

  if (!nowPlaying) {
    return (
      <div className={styles.empty}>
        <span className={styles.emptyIcon}>♪</span>
        <span>Nothing playing right now</span>
      </div>
    );
  }

  const progress =
    nowPlaying.duration_ms && nowPlaying.position_ms
      ? Math.min(100, (nowPlaying.position_ms / nowPlaying.duration_ms) * 100)
      : 0;

  const artError = artErrorId === nowPlaying.spotify_track_id;

  return (
    <div className={styles.container}>
      {nowPlaying.albumArtUrl && !artError ? (
        <img
          src={nowPlaying.albumArtUrl}
          alt={nowPlaying.album}
          className={styles.art}
          onError={() => setArtErrorId(nowPlaying.spotify_track_id)}
        />
      ) : (
        <div className={styles.artPlaceholder} />
      )}
      <div className={styles.info}>
        <div className={styles.liveRow}>
          <span className={styles.liveDot} />
          <span className={styles.liveLabel}>Now Playing</span>
        </div>
        <div className={styles.title}>{nowPlaying.title || 'Unknown'}</div>
        <div className={styles.artist}>{nowPlaying.artist || ''}</div>
        <div className={styles.album}>{nowPlaying.album || ''}</div>
        <div className={styles.progressBar}>
          <div
            className={styles.progressFill}
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className={styles.times}>
          <span>{formatDuration(nowPlaying.position_ms)}</span>
          <span>{formatDuration(nowPlaying.duration_ms)}</span>
        </div>
      </div>
    </div>
  );
}
