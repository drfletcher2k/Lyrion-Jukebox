import { useState, useEffect, useRef } from 'react';
import styles from './SearchBar.module.css';

function SearchIcon() {
  return (
    <svg
      className={styles.searchIcon}
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="7.5" cy="7.5" r="5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 12L16 16"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
      <SearchIcon />
      <input
        className={styles.input}
        type="text"
        placeholder="Search for a song or artist…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Search for a song or artist"
      />
      {loading && (
        <span className={styles.spinnerWrap}>
          <span className="spinner" />
        </span>
      )}
    </div>
  );
}
