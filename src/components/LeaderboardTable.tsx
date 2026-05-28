import { Bot, UserRound } from 'lucide-react';
import type { BoardEntry } from '@/types';

export function LeaderboardTable({ entries, title }: { entries: BoardEntry[]; title: string }) {
  return (
    <section className="score-card overflow-hidden">
      <div className="border-b border-ink/10 px-5 py-4">
        <h2 className="text-lg font-black text-cream">{title}</h2>
      </div>
      <div className="divide-y divide-ink/10">
        {entries.map((entry, index) => {
          const Icon = entry.kind === 'ai' ? Bot : UserRound;
          return (
            <div key={`${entry.kind}-${entry.id}`} className="flex items-center gap-4 px-5 py-4 transition hover:bg-white">
              <div className={`grid h-10 w-10 place-items-center rounded-lg font-black ${index < 3 ? 'bg-sun text-fifaBlue' : 'bg-ink/5 text-cream'}`}>
                {index + 1}
              </div>
              <Icon className={entry.kind === 'ai' ? 'h-5 w-5 text-green' : 'h-5 w-5 text-sky'} />
              <div className="min-w-0 flex-1">
                <p className="truncate font-black text-cream">{entry.name}</p>
                <p className="truncate text-sm text-ink/65">{entry.badge} · {entry.meta}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-gold">{entry.score}</p>
                <p className="text-xs text-ink/65">PTS</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
