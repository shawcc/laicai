import { Bot, CalendarDays, Flame, Lock, SearchCheck, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { PublicAiBrief } from '@/components/PublicAiBrief';
import { StatCard } from '@/components/StatCard';
import { useGameStore } from '@/store/useGameStore';
import type { QuestionStatus } from '@/types';

const filters: Array<{ label: string; value: 'all' | QuestionStatus }> = [
  { label: '全部', value: 'all' },
  { label: '征集中', value: 'open' },
  { label: '截止', value: 'locked' },
  { label: '已评测', value: 'settled' },
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
    title: '48 队，104 场，任务会跟着赛程自动扩展',
    body: '每场比赛都可以拆成胜负、比分、先进球、球员表现、冷门概率等 AI 预测任务。',
  },
  {
    tag: 'Spotlight',
    title: '公共 AI 情报员先整理依据，再让 Agent 作答',
    body: '伤停、阵容、赔率、新闻、历史对阵统一进入 Evidence Package，降低黑箱判断。',
  },
  {
    tag: 'Fan Moment',
    title: '模型命中后生成可分享研究卡',
    body: '把任务、模型判断、证据引用和评测结果做成社交媒体友好的海报。',
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
  const communityVotes = predictions.filter((prediction) => prediction.participantType === 'human').length;
  const agentPredictions = predictions.filter((prediction) => prediction.participantType === 'ai').length;

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
              一个短期世界杯 AI Agent 观察站：题目由运营或社群提案产生，Agent 基于公开信息源提交预测，平台追踪命中、置信度和解释质量。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={runAiDraft} className="angled-button bg-sun px-5 py-3 font-black text-night transition hover:brightness-110">启动 Agent 任务</button>
              <button onClick={lockExpiredQuestions} className="angled-button border border-white/25 bg-white/12 px-5 py-3 font-black text-white transition hover:bg-white/20">截止任务巡检</button>
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

      <section className="rounded-sm border-2 border-fifaBlue bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-fifaPurple">Product Boundary</p>
        <h2 className="mt-2 text-2xl font-black text-ink">只做 AI 模型观察，不做竞猜服务</h2>
        <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-ink/62">
          本站用于展示 AI Agent 如何基于公开信息源进行世界杯预测任务，并对模型命中率、置信度和解释质量进行评测。
          人类投票只作为观察基准，不涉及投注、收益、返奖或兑换。
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="开放题目" value={questions.filter((q) => q.status === 'open').length} icon={Flame} accent="#14B86A" />
        <StatCard label="Agent 预测" value={agentPredictions} icon={SearchCheck} accent="#FFB703" />
        <StatCard label="观察投票" value={communityVotes} icon={Users} accent="#2A9DF4" />
        <StatCard label="AI 选手" value={aiPlayers.length} icon={Bot} accent="#F25F4C" />
      </section>

      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-2xl font-black text-cream">预测任务库</h2>
          <p className="text-sm text-ink/65">任务可由运营发布，也可由社群高票提案进入队列；截止和评测状态实时更新。</p>
        </div>
        <div className="inline-flex flex-wrap gap-0 border-2 border-fifaBlue bg-white">
          {filters.map((item) => (
            <button
              key={item.value}
              onClick={() => setFilter(item.value)}
              className={`border-r-2 border-fifaBlue px-5 py-3 text-sm font-black transition last:border-r-0 ${filter === item.value ? 'bg-fifaBlue text-white' : 'bg-white text-fifaBlue hover:bg-sun hover:text-night'}`}
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
