import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

// Use env var if present; otherwise fall back to current origin.
const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

export default function AuthPanel({ onSession }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [session, setSession] = useState(null);

  useEffect(() => {
    if (!isSupabaseConfigured) return;
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      onSession?.(data.session);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, sess) => {
      setSession(sess);
      onSession?.(sess);
    });
    return () => sub?.subscription?.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div style={cardStyle}>
        <h3 style={h3Style}>Cloud login not configured</h3>
        <p style={mutedStyle}>
          Add <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in Vercel (or <code>.env.local</code>).
        </p>
      </div>
    );
  }

  async function sendMagicLink(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: SITE_URL }
    });
    if (error) {
      setStatus('error');
      setMessage(error.message);
    } else {
      setStatus('sent');
      setMessage('Magic link sent. Check your email to finish signing in.');
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <div style={cardStyle}>
      {!session ? (
        <form onSubmit={sendMagicLink} style={{ display: 'grid', gap: 8 }}>
          <label style={labelStyle}>Email for login</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
            placeholder="you@example.com"
          />
          <button type="submit" style={primaryBtnStyle}>
            {status === 'loading' ? 'Sending…' : 'Send magic link'}
          </button>
          {message && <p>{message}</p>}
        </form>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <p style={{ margin: 0, fontWeight: 600 }}>Signed in</p>
            <p style={mutedStyle}>User ID: {session.user?.id}</p>
          </div>
          <button onClick={signOut} style={ghostBtnStyle}>Sign out</button>
        </div>
      )}
    </div>
  );
}

const cardStyle = { background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 16, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' };
const labelStyle = { fontSize: 12, fontWeight: 600, color: '#334155' };
const inputStyle = { border: '1px solid #e5e7eb', borderRadius: 12, padding: '10px 12px', fontSize: 14 };
const h3Style = { margin: '0 0 8px 0', fontSize: 16 };
const mutedStyle = { color: '#64748b', fontSize: 13 };
const primaryBtnStyle = { background: '#2563eb', color: '#fff', border: 'none', borderRadius: 12, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' };
const ghostBtnStyle = { background: '#fff', color: '#111', border: '1px solid #e5e7eb', borderRadius: 12, padding: '8px 14px', fontWeight: 600, cursor: 'pointer' };
