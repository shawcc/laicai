import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { useGameStore } from '@/store/useGameStore';

type AuthState = {
  user: User | null;
  isAuthLoading: boolean;
  authMessage?: string;
  signInWithEmail: (email: string) => Promise<void>;
  signOut: () => Promise<void>;
};

function getNickname(user: User) {
  const metadataName = user.user_metadata?.name || user.user_metadata?.full_name;
  if (typeof metadataName === 'string' && metadataName.trim()) {
    return metadataName.trim();
  }
  return user.email?.split('@')[0] || '世界杯玩家';
}

async function ensureProfile(user: User) {
  if (!supabase) {
    return;
  }

  await supabase.from('profiles').upsert({
    id: user.id,
    nickname: getNickname(user),
    avatar_url: typeof user.user_metadata?.avatar_url === 'string' ? user.user_metadata.avatar_url : null,
    updated_at: new Date().toISOString(),
  });
}

export function useSupabaseAuth(): AuthState {
  const setCurrentUserId = useGameStore((state) => state.setCurrentUserId);
  const hydrateFromSupabase = useGameStore((state) => state.hydrateFromSupabase);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(Boolean(isSupabaseConfigured));
  const [authMessage, setAuthMessage] = useState<string>();

  const syncUser = useCallback(
    async (nextUser: User | null) => {
      setUser(nextUser);
      if (!nextUser) {
        return;
      }
      await ensureProfile(nextUser);
      setCurrentUserId(nextUser.id);
      await hydrateFromSupabase();
    },
    [hydrateFromSupabase, setCurrentUserId],
  );

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      setAuthMessage('Supabase 未配置，当前使用演示用户');
      return;
    }

    let isMounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!isMounted) {
        return;
      }
      void syncUser(data.session?.user ?? null).finally(() => setIsAuthLoading(false));
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncUser(session?.user ?? null);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [syncUser]);

  async function signInWithEmail(email: string) {
    if (!supabase) {
      setAuthMessage('Supabase 未配置，无法发送登录邮件');
      return;
    }

    setIsAuthLoading(true);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: window.location.origin,
      },
    });
    setIsAuthLoading(false);
    setAuthMessage(error ? error.message : '登录邮件已发送，请去邮箱点击 Magic Link');
  }

  async function signOut() {
    if (!supabase) {
      return;
    }
    await supabase.auth.signOut();
    setUser(null);
    setAuthMessage('已退出登录');
  }

  return {
    user,
    isAuthLoading,
    authMessage,
    signInWithEmail,
    signOut,
  };
}
