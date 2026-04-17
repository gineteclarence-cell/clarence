import { useState, useEffect } from 'react';

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false);

  const toggleOffline = () => {
    const newState = !isOffline;
    setIsOffline(newState);
    localStorage.setItem('offline_mode', JSON.stringify(newState));
    
    if (newState) {
      console.log('Offline mode activated. Data will be cached locally.');
    } else {
      console.log('Online mode activated. Syncing data...');
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem('offline_mode');
    if (saved) setIsOffline(JSON.parse(saved));
  }, []);

  return { isOffline, toggleOffline };
}
