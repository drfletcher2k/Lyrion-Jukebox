import { useState, useEffect, useCallback } from 'react';
import NowPlaying from '../components/NowPlaying';
import QueueList from '../components/QueueList';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import QRCodeDisplay from '../components/QRCodeDisplay';
import ErrorDisplay from '../components/ErrorDisplay';
import styles from './Kiosk.module.css';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';
const POLL_INTERVAL = 5000;

export default function KioskPage() {
  const [nowPlaying, setNowPlaying] = useState(null);
  const [queue, setQueue] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [requesting, setRequesting] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState(null);
  const [qrUrl, setQrUrl] = useState('');

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch(`${apiBase}/api/queue/status`);
      if (!res.ok) return;
      const data = await res.json();
      setNowPlaying(data.nowPlaying);
      setQueue(data.queue || []);
    } catch {
      // Silent — don't disrupt kiosk display on transient failures
    }
  }, []);

  useEffect(() => {
    fetchStatus();
    const id = setInterval(fetchStatus, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [fetchStatus]);

  useEffect(() => {
    // Ask server for PUBLIC_BASE_URL-based guest URL
    fetch(`${apiBase}/api/queue/status`)
      .then(() => {
        // Derive guest URL from current host if VITE_API_BASE_URL not set
        const base = import.meta.env.VITE_PUBLIC_BASE_URL ||
          (typeof window !== 'undefined' ? window.location.origin : '');
        setQrUrl(`${base}/guest`);
      })
      .catch(() => {});
  }, []);

  async function handleRequest(track) {
    setRequesting(track.spotify_track_id);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/queue/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...track, source: 'tablet' }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setConfirmation({ track, position: data.position });
      setTracks([]);
      fetchStatus();
      setTimeout(() => setConfirmation(null), 5000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRequesting(null);
    }
  }

  async function handleRemove(id) {
    try {
      await fetch(`${apiBase}/api/admin/queue/${id}`, { method: 'DELETE' });
      fetchStatus();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleMove(id, direction) {
    try {
      await fetch(`${apiBase}/api/admin/queue/${id}/move`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ direction }),
      });
      fetchStatus();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleSkip(id) {
    try {
      await fetch(`${apiBase}/api/admin/queue/${id}/skip`, { method: 'POST' });
      fetchStatus();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.brandArea}>
          <span className={styles.logo}>&#9835;</span>
          <h1 className={styles.title}>Lyrion Jukebox</h1>
        </div>
        {qrUrl && (
          <div className={styles.qrArea}>
            <QRCodeDisplay url={qrUrl} />
          </div>
        )}
      </div>

      <div className={styles.layout}>
        <div className={styles.left}>
          <div className={styles.section}>
            <div className="section-title">Now Playing</div>
            <NowPlaying nowPlaying={nowPlaying} />
          </div>

          <div className={styles.section}>
            <div className="section-title">Request Queue</div>
            <QueueList
              queue={queue}
              adminMode
              onRemove={handleRemove}
              onMove={handleMove}
              onSkip={handleSkip}
            />
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.section}>
            <div className="section-title">Search &amp; Request</div>

            {error && (
              <div className={styles.feedbackRow}>
                <ErrorDisplay message={error} onDismiss={() => setError(null)} />
              </div>
            )}

            {confirmation && (
              <div className={`${styles.confirmation} fade-in`}>
                &#10003; <strong>{confirmation.track.title}</strong> added
                {confirmation.position && ` — #${confirmation.position}`}
              </div>
            )}

            <SearchBar onResults={setTracks} />
            <SearchResults
              tracks={tracks}
              onRequest={handleRequest}
              requesting={requesting}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
