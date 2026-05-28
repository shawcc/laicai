import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bot, Gauge, ListPlus, Medal, SearchCheck, Trophy } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

const navItems = [
  { to: '/', label: '竞猜大厅', icon: Gauge },
  { to: '/intelligence', label: 'AI 情报', icon: SearchCheck },
  { to: '/ai-players', label: 'AI 选手', icon: Bot },
  { to: '/leaderboard', label: '排行榜', icon: Trophy },
  { to: '/admin', label: '运营控制台', icon: ListPlus },
];

export function Layout() {
  const users = useGameStore((state) => state.users);
  const currentUserId = useGameStore((state) => state.currentUserId);
  const dataSource = useGameStore((state) => state.dataSource);
  const isHydrating = useGameStore((state) => state.isHydrating);
  const hydrationError = useGameStore((state) => state.hydrationError);
  const hydrateFromSupabase = useGameStore((state) => state.hydrateFromSupabase);
  const currentUser = users.find((user) => user.id === currentUserId);

  useEffect(() => {
    void hydrateFromSupabase();
  }, [hydrateFromSupabase]);

  return (
    <div className="min-h-screen overflow-hidden text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-night/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <NavLink to="/" className="group flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-sun/50 bg-sun/20 shadow-lg shadow-sun/10">
              <Medal className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.45em] text-sun">We Are 26 Oracle</p>
              <h1 className="text-lg font-black tracking-tight text-white">AI 世界杯竞猜所</h1>
            </div>
          </NavLink>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `angled-button flex items-center gap-2 px-4 py-2 text-sm font-bold transition ${
                      isActive
                        ? 'bg-sun text-night shadow-lg shadow-sun/20'
                        : 'bg-white/12 text-white/75 hover:bg-white/14 hover:text-white'
                    }`
                  }
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-ink/15 bg-white/12 px-3 py-2 text-xs font-bold text-white/85">
              {isHydrating ? '同步中...' : dataSource === 'supabase' ? 'Supabase 数据' : 'Mock 回退'}
            </div>
            <div className="rounded-lg border border-ink/15 bg-white/12 px-4 py-2 text-sm text-white/75">
              当前玩家 <span className="font-bold text-sun">{currentUser?.name}</span>
            </div>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {hydrationError ? (
          <div className="mb-4 rounded-lg border border-red/30 bg-red/10 px-4 py-3 text-sm font-bold text-red">
            {hydrationError}
          </div>
        ) : null}
        <Outlet />
      </main>
    </div>
  );
}
