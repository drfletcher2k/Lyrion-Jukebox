import { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';

export default function SearchBar({ onResults, onLoading }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const apiBase = import.meta.env.VITE_API_BASE_URL || '';

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim()) {
      onResults([]);
      if (onLoading) onLoading(false);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      if (onLoading) onLoading(true);
      try {
        const res = await fetch(
          `${apiBase}/api/spotify/search?query=${encodeURIComponent(query.trim())}`
        );
        if (!res.ok) throw new Error('Search failed');
        const data = await res.json();
        onResults(data.tracks || []);
      } catch {
        onResults([]);
      } finally {
        setLoading(false);
        if (onLoading) onLoading(false);
      }
    }, 400);

    return () => clearTimeout(debounceRef.current);
  }, [query]);

  return (
    <div className={styles.wrapper}>
      <input
        type="text"
        placeholder="Search for a song or artist…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {loading && (
        <span className={styles.spinnerWrap}>
          <span className="spinner" />
        </span>
      )}
    </div>
  );
}
