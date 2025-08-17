import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

export default function CommunityFeed({ session }) {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function loadPosts() {
    if (!isSupabaseConfigured) return;
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) setError(error.message);
    else setPosts(data || []);
  }

  useEffect(() => { loadPosts(); }, []);

  async function createPost(e) {
    e.preventDefault();
    if (!content.trim()) return;
    if (!session?.user?.id) {
      setError('You must be signed in to post.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.from('posts').insert({
      user_id: session.user.id,   // REQUIRED for RLS
      content: content.trim(),
    });
    setLoading(false);
    if (error) setError(error.message);
    else {
      setContent('');
      await loadPosts();
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div style={box}>
        <p style={{fontSize:14,color:'#475569'}}>Community will activate after Supabase is configured.</p>
      </div>
    );
  }

  return (
    <div style={{display:'grid', gap:12}}>
      <form onSubmit={createPost} style={box}>
        <label style={label}>Share an update</label>
        <textarea
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What habit moved the needle for you this week?"
          style={input}
        />
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <button type="submit" disabled={loading} style={primary}>
            {loading ? 'Posting…' : 'Post'}
          </button>
          {error && <span style={badgeError}>{error}</span>}
        </div>
      </form>

      <div className="posts" style={{display:'grid', gap:12}}>
        {posts.map((p) => (
          <div key={p.id} style={box}>
            <p style={{whiteSpace:'pre-wrap', fontSize:14}}>{p.content}</p>
            <p style={{marginTop:8, fontSize:12, color:'#64748b'}}>
              {new Date(p.created_at).toLocaleString()}
            </p>
          </div>
        ))}
        {!posts.length && <div style={{fontSize:14,color:'#475569'}}>Be the first to start the conversation.</div>}
      </div>
    </div>
  );
}

const box = { background:'#fff', border:'1px solid #e5e7eb', borderRadius:12, padding:16, boxShadow:'0 1px 2px rgba(0,0,0,0.04)' };
const input = { border:'1px solid #e5e7eb', borderRadius:12, padding:'10px 12px', fontSize:14, width:'100%' };
const label = { fontSize:12, fontWeight:600, color:'#334155', marginBottom:4 };
const primary = { background:'#2563eb', color:'#fff', border:'none', borderRadius:12, padding:'8px 14px', fontWeight:600, cursor:'pointer' };
const badgeError = { background:'#fff7ed', color:'#b45309', borderRadius:999, padding:'2px 8px', fontSize:12, fontWeight:700 };
