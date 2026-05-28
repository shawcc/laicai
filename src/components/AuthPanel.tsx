import { FormEvent, useState } from 'react';
import { LogOut, Mail, UserRound } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function AuthPanel() {
  const { user, isAuthLoading, authMessage, signInWithEmail, signOut } = useSupabaseAuth();
  const [email, setEmail] = useState('');

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!email.trim()) {
      return;
    }
    await signInWithEmail(email.trim());
  }

  if (user) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-white/12 px-3 py-2 text-xs text-white/85">
        <UserRound className="h-4 w-4 text-sun" />
        <span className="max-w-[180px] truncate font-bold">{user.email}</span>
        <button
          onClick={() => void signOut()}
          className="inline-flex items-center gap-1 border-l border-white/15 pl-2 font-black text-sun transition hover:text-white"
        >
          <LogOut className="h-3.5 w-3.5" />
          退出
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-center gap-2">
      <label className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/45" />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="邮箱登录"
          className="h-9 w-44 rounded-lg border border-white/15 bg-white/12 pl-9 pr-3 text-sm font-bold text-white outline-none placeholder:text-white/45 focus:border-sun"
        />
      </label>
      <button
        disabled={isAuthLoading}
        className="angled-button h-9 bg-sun px-4 text-sm font-black text-night transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAuthLoading ? '发送中' : '登录'}
      </button>
      {authMessage ? <p className="basis-full text-xs font-bold text-sun">{authMessage}</p> : null}
    </form>
  );
}
