import type { LucideIcon } from 'lucide-react';

export function StatCard({ label, value, icon: Icon, accent }: { label: string; value: string | number; icon: LucideIcon; accent: string }) {
  return (
    <div className="score-card p-5 flip-in">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-ink/65">{label}</p>
          <p className="mt-2 text-3xl font-black text-cream">{value}</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg border border-ink/10 shadow-lg" style={{ backgroundColor: `${accent}26`, color: accent }}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
