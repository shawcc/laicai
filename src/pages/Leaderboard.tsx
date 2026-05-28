import { useMemo, useState } from 'react';
import { LeaderboardTable } from '@/components/LeaderboardTable';
import { SocialShareCard } from '@/components/SocialShareCard';
import { buildLeaderboard } from '@/lib/gameLogic';
import { useGameStore } from '@/store/useGameStore';

export function Leaderboard() {
  const users = useGameStore((state) => state.users);
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  const scoreEvents = useGameStore((state) => state.scoreEvents);
  const [tab, setTab] = useState<'all' | 'human' | 'ai'>('all');
  const entries = useMemo(() => buildLeaderboard(users, aiPlayers, scoreEvents), [users, aiPlayers, scoreEvents]);
  const filtered = entries.filter((entry) => tab === 'all' || entry.kind === tab);

  return (
    <div className="space-y-6">
      <section className="score-card p-6 lg:p-8">
        <p className="text-xs font-black uppercase tracking-[0.45em] text-gold">Live Ranking</p>
        <h1 className="mt-3 text-4xl font-black text-cream lg:text-6xl">人类与 AI 综合积分榜</h1>
        <p className="mt-4 text-ink/70">每次开奖结算都会生成积分事件，榜单由积分事件累计得到，便于追溯。</p>
        <div className="mt-6 inline-flex flex-wrap gap-0 border-2 border-fifaBlue bg-white">
          {[
            ['all', '综合榜'],
            ['human', '人类榜'],
            ['ai', 'AI 榜'],
          ].map(([value, label]) => (
            <button
              key={value}
              onClick={() => setTab(value as 'all' | 'human' | 'ai')}
              className={`border-r-2 border-fifaBlue px-5 py-3 text-sm font-black transition last:border-r-0 ${tab === value ? 'bg-fifaBlue text-white' : 'bg-white text-fifaBlue hover:bg-sun hover:text-night'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <LeaderboardTable entries={filtered} title="实时榜单" />

      <SocialShareCard />

      <section className="score-card p-5">
        <h2 className="mb-4 text-xl font-black text-cream">积分明细</h2>
        <div className="grid gap-3">
          {scoreEvents.map((event) => {
            const person = event.participantType === 'ai' ? aiPlayers.find((ai) => ai.id === event.participantId) : users.find((user) => user.id === event.participantId);
            return (
              <div key={event.id} className="flex items-center justify-between gap-4 rounded-lg bg-ink/5 p-4">
                <div>
                  <p className="font-bold text-cream">{person?.name}</p>
                  <p className="text-sm text-ink/65">{event.reason}</p>
                </div>
                <p className="text-xl font-black text-gold">+{event.score}</p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
