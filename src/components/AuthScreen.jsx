import { useState } from 'react';
import { createProfile, loginProfile } from '../services/authService';

export default function AuthScreen({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [id, setId] = useState('');
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setError(''); setBusy(true);
    try {
      if (mode === 'login') await loginProfile(id, pin);
      else await createProfile(id, pin, id);
      onAuth(id);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  };

  return (
    <div style={{ padding: 40, maxWidth: 400, margin: 'auto', fontFamily: 'sans-serif' }}>
      <h2>{mode === 'login' ? 'Log In' : 'Sign Up'}</h2>
      <input placeholder="Profile ID" value={id} onChange={e => setId(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }} />
      <input placeholder="PIN (4-6 digits)" type="password" value={pin} onChange={e => setPin(e.target.value)}
        style={{ width: '100%', padding: 8, marginBottom: 10 }} />
      <button onClick={submit} disabled={busy} style={{ marginRight: 10 }}>
        {busy ? '...' : (mode === 'login' ? 'Log In' : 'Create Profile')}
      </button>
      <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}>
        Switch to {mode === 'login' ? 'Sign Up' : 'Log In'}
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}