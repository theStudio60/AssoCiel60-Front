'use client';

export default function DebugPage() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const storageUrl = process.env.NEXT_PUBLIC_STORAGE_URL;
  
  return (
    <div style={{padding: 40, fontSize: 20, fontFamily: 'monospace'}}>
      <h1>Debug ENV</h1>
      <p>API URL: <strong>{apiUrl || 'UNDEFINED'}</strong></p>
      <p>STORAGE: <strong>{storageUrl || 'UNDEFINED'}</strong></p>
    </div>
  );
}