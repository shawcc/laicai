import { Bot, CalendarDays, Flame, Lock, Trophy, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { PublicAiBrief } from '@/components/PublicAiBrief';
import { StatCard } from '@/components/StatCard';
import { useGameStore } from '@/store/useGameStore';
import type { QuestionStatus } from '@/types';

const filters: Array<{ label: string; value: 'all' | QuestionStatus }> = [
  { label: '全部', value: 'all' },
  { label: '开放', value: 'open' },
  { label: '锁票', value: 'locked' },
  { label: '结算', value: 'settled' },
];

const countdownTiles = [
  { label: 'Days', value: '17' },
  { label: 'Hours', value: '06' },
  { label: 'Mins', value: '15' },
  { label: 'Secs', value: '33' },
];

const officialHighlights = [
  {
    tag: 'Need to know',
    title: '48 队，104 场，题库会跟着赛程自动扩展',
    body: '每场比赛都可以拆成胜负、比分、先进球、球员表现、冷门概率等竞猜题。',
  },
  {
    tag: 'Spotlight',
    title: '公共 AI 情报员先整理依据，再让选手作答',
    body: '伤停、阵容、赔率、新闻、历史对阵统一进入 Evidence Package，降低黑箱判断。',
  },
  {
    tag: 'Fan Moment',
    title: '猜中后生成可分享战报卡',
    body: '把命中题目、积分、排名变化做成社交媒体友好的海报，帮助传播。',
  },
];

export function Home() {
  const questions = useGameStore((state) => state.questions);
  const predictions = useGameStore((state) => state.predictions);
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  const runAiDraft = useGameStore((state) => state.runAiDraft);
  const lockExpiredQuestions = useGameStore((state) => state.lockExpiredQuestions);
  const [filter, setFilter] = useState<'all' | QuestionStatus>('all');

  const visibleQuestions = useMemo(
    () => questions.filter((question) => filter === 'all' || question.status === filter),
    [filter, questions],
  );
  const humanParticipants = predictions.filter((prediction) => prediction.participantType === 'human').length;
  const prizePool = questions.reduce((sum, question) => sum + question.totalScore, 0);

  return (
    <div className="space-y-8">
      <section className="poster-panel relative overflow-hidden p-6 lg:p-10">
        <div className="absolute -right-16 bottom-0 hidden h-80 w-80 rounded-sm border-[42px] border-ink/15 lg:block" />
        <div className="absolute right-12 top-12 hidden h-28 w-28 rotate-12 rounded-xl bg-sun shadow-2xl shadow-sun/20 lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.5em] text-sun">FIFA World Cup 2026 Inspired</p>
            <h2 className="mt-4 text-4xl font-black leading-none text-white lg:text-7xl">AI Prediction Cup 2026</h2>
            <div className="mt-5 flex items-center gap-3 text-white/78">
              <CalendarDays className="h-5 w-5 text-sun" />
              <span className="font-bold">11 June - 19 July 2026</span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              参考官方赛事站的信息节奏：大标题、倒计时、资讯卡片和赛程感。这里不复制官方素材，只把竞猜、AI 情报和积分榜做成赛事主站体验。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={runAiDraft} className="angled-button bg-sun px-5 py-3 font-black text-night transition hover:brightness-110">AI 自动选题</button>
              <button onClick={lockExpiredQuestions} className="angled-button border border-white/25 bg-white/12 px-5 py-3 font-black text-white transition hover:bg-white/20">自动锁票巡检</button>
            </div>
          </div>
          <div className="rounded-xl bg-white/12 p-4 backdrop-blur-md">
            <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-white/70">Countdown</p>
            <div className="grid grid-cols-4 gap-3">
              {countdownTiles.map((tile) => (
                <div key={tile.label} className="rounded-xl bg-white p-4 text-center shadow-xl shadow-black/10">
                  <p className="text-3xl font-black text-fifaBlue">{tile.value}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-ink/45">{tile.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {officialHighlights.map((item) => (
          <article key={item.title} className="official-card overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-fifaBlue via-neonBlue to-sun" />
            <div className="p-5">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-fifaPurple">{item.tag}</p>
              <h3 className="mt-3 text-xl font-black leading-tight text-ink">{item.title}</h3>
              <p className="mt-3 text-sm leading-6 text-ink/58">{item.body}</p>
            </div>
          </article>
        ))}
      </section>

      <PublicAiBrief />

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="开放题目" value={questions.filter((q) => q.status === 'open').length} icon={Flame} accent="#14B86A" />
        <StatCard label="总分池" value={prizePool} icon={Trophy} accent="#FFB703" />
        <StatCard label="人类票数" value={humanParticipants} icon={Users} accent="#2A9DF4" />
        <StatCard label="AI 选手" value={aiPlayers.length} icon={Bot} accent="#F25F4C" />
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-cream">竞猜题库</h2>
          <p className="text-sm text-ink/65">题目可随时增加，锁票和结算状态实时更新。</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`rounded-sm border px-4 py-2 text-sm font-bold transition ${filter === item.value ? 'border-fifaBlue bg-fifaBlue text-white' : 'border-ink/10 bg-white text-ink/75 hover:bg-white'}`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </section>

      {visibleQuestions.length > 0 ? (
        <section className="grid gap-5 lg:grid-cols-2">
          {visibleQuestions.map((question) => <QuestionCard key={question.id} question={question} predictions={predictions} />)}
        </section>
      ) : (
        <div className="score-card grid place-items-center p-12 text-center text-ink/65">
          <Lock className="mb-4 h-10 w-10 text-gold" />
          暂无该状态题目
        </div>
      )}
    </div>
  );
}
