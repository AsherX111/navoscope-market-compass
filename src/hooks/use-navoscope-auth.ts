import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { readDisplayName, authError } from '@/lib/navoscope-auth';

export function useNavoscopeAuth() {
  const [account, setAccount] = useState<{ id: string; userName: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let alive = true;
    let revision = 0;
    const refresh = async () => {
      const current = ++revision;
      setLoading(true);
      try {
        const { data: { user }, error: authFailure } = await supabase.auth.getUser();
        if (!user) {
          if (alive && current === revision) { setAccount(null); setError(null); }
          return;
        }
        if (authFailure) throw authFailure;
        const userName = await readDisplayName(user.id);
        if (alive && current === revision) { setAccount({ id: user.id, userName }); setError(null); }
      } catch (e) {
        if (alive && current === revision) { setAccount(null); setError(authError(e)); }
      } finally { if (alive && current === revision) setLoading(false); }
    };
    const { data: { subscription } } = supabase.auth.onAuthStateChange(event => {
      if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') {
        // Do not call SDK methods synchronously inside its auth lock.
        setTimeout(() => { if (alive) void refresh(); }, 0);
      }
    });
    void refresh();
    return () => { alive = false; subscription.unsubscribe(); };
  }, []);
  return { account, loading, error };
}