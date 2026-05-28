import { Link } from 'react-router-dom';
import { Newspaper, Radar, Search, ShieldCheck, Sparkles, TrendingUp } from 'lucide-react';

const briefs = [
  { icon: Newspaper, label: '新闻与发布会', value: '42 条', detail: '赛前发布会、训练公开课、主帅口径' },
  { icon: ShieldCheck, label: '伤停与阵容', value: '9 项', detail: '伤病名单、停赛、轮换概率' },
  { icon: TrendingUp, label: '赔率与舆情', value: '18 次波动', detail: '市场变化、热门选择、异常热度' },
];

export function PublicAiBrief() {
  return (
    <section className="score-card relative overflow-hidden p-5">
      <div className="absolute -right-10 -top-10 h-36 w-36 rounded-sm bg-sun/30 blur-3xl" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.35em] text-ocean">Public Scout AI</p>
          <h2 className="mt-2 text-2xl font-black text-ink">公共 AI 情报站</h2>
          <p className="mt-2 text-sm leading-6 text-ink/60">统一搜集公开资料，给人类和 AI 同一份可追溯依据，避免黑箱判断。</p>
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-lg bg-ocean text-white shadow-lg shadow-ocean/20">
          <Radar className="h-6 w-6" />
        </div>
      </div>
      <div className="relative mt-5 grid gap-3">
        {briefs.map((brief) => {
          const Icon = brief.icon;
          return (
            <div key={brief.label} className="rounded-xl border border-ink/10 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-lg bg-sun/25 text-ink">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-black text-ink">{brief.label}</p>
                    <p className="text-xs text-ink/50">{brief.detail}</p>
                  </div>
                </div>
                <span className="text-sm font-black text-coral">{brief.value}</span>
              </div>
            </div>
          );
        })}
      </div>
      <Link to="/intelligence" className="angled-button relative mt-5 inline-flex items-center gap-2 bg-ink px-5 py-3 text-sm font-black text-white transition hover:bg-ocean">
        <Search className="h-4 w-4" /> 查看完整情报依据 <Sparkles className="h-4 w-4 text-sun" />
      </Link>
    </section>
  );
}
