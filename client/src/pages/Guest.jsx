import { useState } from 'react';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import ErrorDisplay from '../components/ErrorDisplay';
import styles from './Guest.module.css';

const apiBase = import.meta.env.VITE_API_BASE_URL || '';

export default function GuestPage() {
  const [tracks, setTracks] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [requesting, setRequesting] = useState(null);
  const [confirmation, setConfirmation] = useState(null);
  const [error, setError] = useState(null);
  const [guestName, setGuestName] = useState('');

  async function handleRequest(track) {
    setRequesting(track.spotify_track_id);
    setError(null);
    try {
      const res = await fetch(`${apiBase}/api/queue/request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...track,
          guest_name: guestName.trim() || null,
          source: 'phone',
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }
      setConfirmation({ track, position: data.position });
      setTracks([]);
      setTimeout(() => setConfirmation(null), 6000);
    } catch (err) {
      setError(err.message);
    } finally {
      setRequesting(null);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.logo}>♫</div>
        <h1 className={styles.title}>Request a Song</h1>
      </div>

      <div className={styles.nameField}>
        <input
          type="text"
          placeholder="Your name (optional)"
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          maxLength={50}
        />
      </div>

      <SearchBar onResults={setTracks} onLoading={setIsSearching} />

      {error && (
        <div className={styles.feedback}>
          <ErrorDisplay message={error} onDismiss={() => setError(null)} />
        </div>
      )}

      {confirmation && (
        <div className={styles.confirmation}>
          <div className={styles.confirmIcon}>✓</div>
          <div>
            <strong>{confirmation.track.title}</strong> added to the queue
            {confirmation.position && ` — position #${confirmation.position}`}
          </div>
        </div>
      )}

      <SearchResults
        tracks={tracks}
        onRequest={handleRequest}
        requesting={requesting}
        isLoading={isSearching}
      />
    </div>
  );
}
