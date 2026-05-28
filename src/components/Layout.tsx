import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { Bot, Gauge, ListPlus, Medal, SearchCheck, Trophy } from 'lucide-react';
import { useGameStore } from '@/store/useGameStore';

const navItems = [
  { to: '/', label: '任务大厅', icon: Gauge },
  { to: '/intelligence', label: 'AI 情报', icon: SearchCheck },
  { to: '/ai-players', label: 'Agent 竞技场', icon: Bot },
  { to: '/leaderboard', label: '评测榜', icon: Trophy },
  { to: '/admin', label: '运营控制台', icon: ListPlus },
];

export function Layout() {
  const dataSource = useGameStore((state) => state.dataSource);
  const isHydrating = useGameStore((state) => state.isHydrating);
  const hydrationError = useGameStore((state) => state.hydrationError);
  const hydrateFromSupabase = useGameStore((state) => state.hydrateFromSupabase);

  useEffect(() => {
    void hydrateFromSupabase();
  }, [hydrateFromSupabase]);

  return (
    <div className="min-h-screen overflow-hidden text-ink">
      <header className="sticky top-0 z-40 border-b border-ink/15 bg-white/95 shadow-sm backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <NavLink to="/" className="group flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-lg border border-fifaBlue/20 bg-sun shadow-lg shadow-sun/10">
              <Medal className="h-6 w-6 text-gold" />
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.45em] text-fifaPurple">We Are 26 Oracle</p>
              <h1 className="text-lg font-black tracking-tight text-ink">AI Agent 世界杯观察站</h1>
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
                        : 'border border-ink/10 bg-white text-ink hover:border-fifaBlue hover:bg-fifaBlue hover:text-white'
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
            <div className="rounded-sm border border-fifaBlue/20 bg-fifaBlue/8 px-3 py-2 text-xs font-black text-fifaBlue">
              {isHydrating ? '同步中...' : dataSource === 'supabase' ? 'Supabase 数据' : 'Mock 回退'}
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
