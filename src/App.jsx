import React, { useState } from 'react';
import AuthPanel from './components/AuthPanel.jsx';
import CommunityFeed from './components/CommunityFeed.jsx';
import { isSupabaseConfigured } from './lib/supabaseClient';

export default function App() {
  const [session, setSession] = useState(null);

  return (
    <div style={{minHeight:'100vh', background:'linear-gradient(180deg,#eef2ff,#ffffff)', padding:'2rem'}}>
      <header style={{display:'flex', alignItems:'center', justifyContent:'space-between', maxWidth:960, margin:'0 auto'}}>
        <div style={{display:'flex', alignItems:'center', gap:12}}>
          <div style={{width:44, height:44, borderRadius:12, display:'grid', placeItems:'center', color:'#fff', fontWeight:800, background:'linear-gradient(135deg,#2563eb,#f97316)'}}>50+</div>
          <div>
            <h1 style={{margin:0, fontSize:22}}>50plus Health & Wellness</h1>
            <p style={{margin:0, color:'#64748b', fontSize:12}}>Personalized guidance for thriving after 50</p>
          </div>
        </div>
        <span style={{background:'#ecfdf5', color:'#16a34a', padding:'2px 8px', borderRadius:999, fontSize:12, fontWeight:700}}>MVP</span>
      </header>

      <main style={{maxWidth:960, margin:'1.5rem auto', display:'grid', gap:16}}>
        {!session ? (
          <>
            <section>
              <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16}}>
                <h2 style={{marginTop:0, color:'#2563eb'}}>Welcome</h2>
                <p>Sign in below to unlock community posting and cloud saves. We use passwordless email magic links.</p>
                {!isSupabaseConfigured && (
                  <p style={{color:'#b91c1c', fontWeight:600}}>Environment variables missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel.</p>
                )}
              </div>
            </section>
            <section>
              <AuthPanel onSession={setSession} />
            </section>
          </>
        ) : (
          <>
            <section>
              <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:16, padding:16}}>
                <h2 style={{marginTop:0, color:'#2563eb'}}>Community</h2>
                <p style={{margin:0, color:'#64748b'}}>Share wins, ask questions, and encourage others.</p>
              </div>
            </section>
            <section>
              <CommunityFeed session={session} />
            </section>
          </>
        )}
      </main>

      <footer style={{maxWidth:960, margin:'2rem auto', color:'#64748b', fontSize:12}}>
        © {new Date().getFullYear()} 50plus Health & Wellness. For education only.
      </footer>
    </div>
  );
}
