import styles from './SearchResults.module.css';

function formatDuration(ms) {
  if (!ms) return '';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function SearchResults({ tracks, onRequest, requesting }) {
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
              {track.artist} &mdash; {track.album}
            </div>
          </div>
          <div className={styles.right}>
            <span className={styles.duration}>{formatDuration(track.duration_ms)}</span>
            <button
              className="btn-primary"
              onClick={() => onRequest(track)}
              disabled={requesting === track.spotify_track_id}
            >
              {requesting === track.spotify_track_id ? '...' : 'Request'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
