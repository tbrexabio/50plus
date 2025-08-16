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
    setLoading(true);
    setError('');
    const { error } = await supabase.from('posts').insert({
      content: content.trim()
    });
    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      setContent('');
      await loadPosts();
    }
  }

  if (!isSupabaseConfigured) {
    return (
      <div className="rounded-2xl border p-4 bg-white">
        <p className="text-sm text-gray-700">Community will activate after Supabase is configured. See README for setup.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {session ? (
        <form onSubmit={createPost} className="rounded-2xl border p-4 bg-white grid gap-2">
          <label className="text-xs font-medium text-gray-700">Share an update</label>
          <textarea
            rows={3}
            value={content}
            onChange={e => setContent(e.target.value)}
            className="border rounded-xl px-3 py-2"
            placeholder="What habit moved the needle for you this week?"
          />
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="rounded-2xl px-4 py-2 text-sm font-semibold shadow-sm bg-black text-white hover:opacity-90">
              {loading ? 'Posting…' : 'Post'}
            </button>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        </form>
      ) : (
        <div className="rounded-2xl border p-4 bg-white text-sm text-gray-700">Sign in to post.</div>
      )}

      <div className="grid gap-3">
        {posts.map(p => (
          <div key={p.id} className="rounded-2xl border p-4 bg-white">
            <p className="text-sm whitespace-pre-wrap">{p.content}</p>
            <p className="text-xs text-gray-500 mt-2">{new Date(p.created_at).toLocaleString()}</p>
          </div>
        ))}
        {!posts.length && <div className="text-sm text-gray-600">No posts yet.</div>}
      </div>
    </div>
  );
}
