'use client';

import { useEffect } from 'react';

export default function ChunkErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const errorMessage = event.message || '';
      if (
        errorMessage.includes('Loading chunk') ||
        errorMessage.includes('ChunkLoadError') ||
        errorMessage.includes('Failed to load chunk') ||
        errorMessage.includes('Failed to fetch dynamically imported module')
      ) {
        console.log('Chunk error detected, reloading page...');
        // Force reload sans cache
        window.location.reload();
      }
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason?.message || event.reason?.toString() || '';
      if (
        reason.includes('Loading chunk') ||
        reason.includes('ChunkLoadError') ||
        reason.includes('Failed to load chunk') ||
        reason.includes('Failed to fetch dynamically imported module')
      ) {
        console.log('Chunk error detected (promise), reloading page...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}