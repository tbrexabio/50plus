const SITE_URL = import.meta.env.VITE_SITE_URL || window.location.origin;

const { error } = await supabase.auth.signInWithOtp({
  email,
  options: {
    emailRedirectTo: SITE_URL, // always send users back to your live site
  },
});
