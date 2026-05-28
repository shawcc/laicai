import { FormEvent, useState } from 'react';
import { LogOut, Mail, UserRound } from 'lucide-react';
import { useSupabaseAuth } from '@/hooks/useSupabaseAuth';

export function AuthPanel() {
  const { user, isAuthLoading, authMessage, signInWithEmail, signOut } = useSupabaseAuth();
  const [email, setEmail] = useState('');
  const [isOpen, setIsOpen] = useState(false);

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

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="angled-button inline-flex h-10 items-center gap-2 bg-sun px-5 text-sm font-black text-night shadow-lg shadow-sun/25 transition hover:brightness-105"
      >
        <UserRound className="h-4 w-4" />
        注册 / 登录
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex max-w-full flex-wrap items-center gap-2 rounded-lg border border-sun/40 bg-night/95 p-2 shadow-xl shadow-black/20">
      <label className="relative">
        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-sun" />
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="输入邮箱获取登录链接"
          className="h-10 w-60 rounded-sm border border-white/20 bg-white pl-9 pr-3 text-sm font-bold text-ink outline-none placeholder:text-ink/45 focus:border-sun"
          autoFocus
        />
      </label>
      <button
        disabled={isAuthLoading}
        className="angled-button h-10 bg-sun px-4 text-sm font-black text-night transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isAuthLoading ? '发送中' : '发送 Magic Link'}
      </button>
      <button
        type="button"
        onClick={() => setIsOpen(false)}
        className="h-10 border border-white/20 px-3 text-sm font-black text-white transition hover:bg-white/10"
      >
        取消
      </button>
      {authMessage ? <p className="basis-full px-1 text-xs font-bold text-sun">{authMessage}</p> : null}
    </form>
  );
}
