import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

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
    const { data: listener } = supabase.auth.onAuthStateChange((_event, sess) => {
      setSession(sess);
      onSession?.(sess);
    });
    return () => listener?.subscription?.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-xl border p-4 bg-white text-sm">
        <p className="font-medium">Cloud login is not configured</p>
        <p className="text-gray-600 mt-1">Add your Supabase keys in <code>.env.local</code> or in Vercel → Project → Settings → Environment Variables. See README for setup.</p>
      </div>
    );
  }

  async function sendMagicLink(e) {
    e.preventDefault();
    setStatus('loading');
    setMessage('');
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin }
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
    <div className="rounded-xl border p-4 bg-white text-sm">
      {!session ? (
        <form onSubmit={sendMagicLink} className="grid gap-2">
          <label className="text-xs font-medium text-gray-700">Email for login</label>
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="border rounded-xl px-3 py-2"
            placeholder="you@example.com"
          />
          <button type="submit" className="rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm bg-black text-white hover:opacity-90">
            {status === 'loading' ? 'Sending…' : 'Send magic link'}
          </button>
          {message && <p className="text-gray-700">{message}</p>}
        </form>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">Signed in</p>
            <p className="text-gray-600 text-xs">User ID: {session.user?.id}</p>
          </div>
          <button onClick={signOut} className="rounded-2xl px-4 py-2 text-sm font-semibold border bg-white hover:bg-gray-50">Sign out</button>
        </div>
      )}
    </div>
  );
}
