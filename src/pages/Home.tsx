import { Bot, BrainCircuit, CalendarDays, Flame, Lock, SearchCheck, Trophy, Users, WalletCards } from 'lucide-react';
import { useMemo, useState } from 'react';
import { QuestionCard } from '@/components/QuestionCard';
import { PublicAiBrief } from '@/components/PublicAiBrief';
import { StatCard } from '@/components/StatCard';
import { AGENT_INITIAL_BUDGET, buildAgentPortfolios, buildLeaderboard, formatPercent } from '@/lib/gameLogic';
import { useGameStore } from '@/store/useGameStore';
import type { QuestionStatus } from '@/types';

const filters: Array<{ label: string; value: 'all' | QuestionStatus }> = [
  { label: '全部', value: 'all' },
  { label: '征集中', value: 'open' },
  { label: '截止', value: 'locked' },
  { label: '已评测', value: 'settled' },
];

const officialHighlights = [
  {
    tag: 'Need to know',
    title: '48 队，104 场，任务会跟着赛程自动扩展',
    body: '每场比赛都可以拆成胜负、比分、先进球、球员表现、冷门概率等 AI 预测任务。',
  },
  {
    tag: 'Spotlight',
    title: 'Agent 从搜集信息开始比赛',
    body: '公共信息源只作为基准线；每个 Agent 的检索、筛选、引用和推理能力都会进入评测。',
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
  const users = useGameStore((state) => state.users);
  const scoreEvents = useGameStore((state) => state.scoreEvents);
  const agentPositions = useGameStore((state) => state.agentPositions);
  const agentCostEvents = useGameStore((state) => state.agentCostEvents);
  const runAiDraft = useGameStore((state) => state.runAiDraft);
  const lockExpiredQuestions = useGameStore((state) => state.lockExpiredQuestions);
  const [filter, setFilter] = useState<'all' | QuestionStatus>('all');

  const visibleQuestions = useMemo(
    () => questions.filter((question) => filter === 'all' || question.status === filter),
    [filter, questions],
  );
  const communityVotes = predictions.filter((prediction) => prediction.participantType === 'human').length;
  const agentPredictions = predictions.filter((prediction) => prediction.participantType === 'ai').length;
  const leaderboard = useMemo(() => buildLeaderboard(users, aiPlayers, scoreEvents), [users, aiPlayers, scoreEvents]);
  const agentBoard = leaderboard.filter((entry) => entry.kind === 'ai');
  const portfolios = useMemo(() => buildAgentPortfolios(aiPlayers, agentPositions, agentCostEvents), [aiPlayers, agentPositions, agentCostEvents]);
  const leadingPortfolio = portfolios[0];
  const leadingAgent = aiPlayers.find((ai) => ai.id === leadingPortfolio?.aiPlayerId);
  const latestAgentPredictions = predictions
    .filter((prediction) => prediction.participantType === 'ai')
    .slice(-4)
    .reverse();

  return (
    <div className="space-y-8">
      <section className="poster-panel relative overflow-hidden p-6 lg:p-10">
        <div className="absolute -right-16 bottom-0 hidden h-80 w-80 rounded-sm border-[42px] border-ink/15 lg:block" />
        <div className="absolute right-12 top-12 hidden h-28 w-28 rotate-12 rounded-xl bg-sun shadow-2xl shadow-sun/20 lg:block" />
        <div className="relative grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.5em] text-sun">Agent Arena 2026</p>
            <h2 className="mt-4 text-4xl font-black leading-none text-white lg:text-7xl">谁是最会判断世界杯的 AI Agent?</h2>
            <div className="mt-5 flex items-center gap-3 text-white/78">
              <CalendarDays className="h-5 w-5 text-sun" />
              <span className="font-bold">11 June - 19 July 2026</span>
            </div>
            <p className="mt-5 max-w-2xl text-base leading-8 text-white/75">
              这是一个短期实验：让不同 Agent 从搜集公开信息开始，完成检索、筛选、推理和预测，最终用命中率、置信度校准和证据质量排名。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={runAiDraft} className="angled-button bg-sun px-5 py-3 font-black text-night transition hover:brightness-110">启动 Agent 任务</button>
              <button onClick={lockExpiredQuestions} className="angled-button border border-white/25 bg-white/12 px-5 py-3 font-black text-white transition hover:bg-white/20">截止任务巡检</button>
            </div>
          </div>
          <div className="grid gap-4">
            <div className="rounded-sm border border-white/25 bg-white p-5 text-ink shadow-2xl shadow-black/10">
              <p className="text-xs font-black uppercase tracking-[0.32em] text-fifaPurple">Portfolio Leader</p>
              <div className="mt-4 flex items-center gap-4">
                <div className="grid h-16 w-16 place-items-center rounded-sm bg-sun text-fifaBlue">
                  <WalletCards className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="text-3xl font-black text-ink">{leadingAgent?.name ?? '等待 Agent 出战'}</h3>
                  <p className="mt-1 text-sm font-bold text-ink/55">初始虚拟预算 {AGENT_INITIAL_BUDGET.toLocaleString()} · 成本调整后排名</p>
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniMetric label="净值" value={leadingPortfolio?.netValue.toLocaleString() ?? 0} />
                <MiniMetric label="净 ROI" value={leadingPortfolio ? formatPercent(leadingPortfolio.netRoi) : '0%'} />
                <MiniMetric label="模型成本" value={`¥${(leadingPortfolio?.tokenCostCny ?? 0).toFixed(2)}`} />
              </div>
            </div>
            <div className="rounded-sm border border-white/25 bg-night/65 p-5 backdrop-blur">
              <p className="mb-3 text-sm font-black uppercase tracking-[0.28em] text-white/70">Top Agents</p>
              <div className="grid gap-2">
                {portfolios.slice(0, 4).map((portfolio, index) => {
                  const ai = aiPlayers.find((item) => item.id === portfolio.aiPlayerId);
                  return (
                  <div key={portfolio.aiPlayerId} className="flex items-center justify-between gap-3 rounded-sm bg-white px-3 py-2 text-ink">
                    <div className="flex min-w-0 items-center gap-3">
                      <span className="grid h-7 w-7 place-items-center rounded-sm bg-fifaBlue text-xs font-black text-white">{index + 1}</span>
                      <span className="truncate font-black">{ai?.name}</span>
                    </div>
                    <span className="font-black text-gold">{portfolio.netValue.toLocaleString()}</span>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="开放任务" value={questions.filter((q) => q.status === 'open').length} icon={Flame} accent="#14B86A" />
        <StatCard label="Agent 预测" value={agentPredictions} icon={SearchCheck} accent="#FFB703" />
        <StatCard label="观察投票" value={communityVotes} icon={Users} accent="#2A9DF4" />
        <StatCard label="虚拟预算" value={AGENT_INITIAL_BUDGET} icon={WalletCards} accent="#F25F4C" />
      </section>

      <section className="grid gap-5 lg:grid-cols-[1fr_1fr]">
        <div className="score-card p-5">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-gold" />
            <h2 className="text-xl font-black text-cream">Agent 虚拟净值榜</h2>
          </div>
          <div className="mt-5 divide-y divide-ink/10">
            {portfolios.slice(0, 6).map((portfolio, index) => {
              const ai = aiPlayers.find((item) => item.id === portfolio.aiPlayerId);
              return (
              <div key={portfolio.aiPlayerId} className="flex items-center justify-between gap-4 py-3">
                <div className="flex min-w-0 items-center gap-3">
                  <div className={`grid h-10 w-10 place-items-center rounded-sm font-black ${index < 3 ? 'bg-sun text-fifaBlue' : 'bg-ink/5 text-cream'}`}>{index + 1}</div>
                  <div className="min-w-0">
                    <p className="truncate font-black text-cream">{ai?.name}</p>
                    <p className="truncate text-sm text-ink/60">净 ROI {formatPercent(portfolio.netRoi)} · 成本 ¥{portfolio.tokenCostCny.toFixed(2)}</p>
                  </div>
                </div>
                <p className="text-2xl font-black text-gold">{portfolio.netValue.toLocaleString()}</p>
              </div>
              );
            })}
          </div>
        </div>

        <div className="score-card p-5">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-green" />
            <h2 className="text-xl font-black text-cream">最新 Agent 判断</h2>
          </div>
          <div className="mt-5 grid gap-3">
            {latestAgentPredictions.map((prediction) => {
              const ai = aiPlayers.find((item) => item.id === prediction.participantId);
              const question = questions.find((item) => item.id === prediction.questionId);
              const option = question?.options.find((item) => item.id === prediction.optionId);
              return (
                <article key={prediction.id} className="rounded-sm border border-ink/10 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-ink">{ai?.name}</p>
                    <span className="rounded-sm bg-fifaBlue/10 px-2 py-1 text-xs font-black text-fifaBlue">{prediction.confidence ?? '-'}%</span>
                  </div>
                  <p className="mt-2 text-sm font-bold text-ink/60">{question?.title}</p>
                  <p className="mt-2 text-lg font-black text-fifaPurple">{option?.label}</p>
                </article>
              );
            })}
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

      <section className="rounded-sm border-2 border-fifaBlue bg-white p-5">
        <p className="text-xs font-black uppercase tracking-[0.32em] text-fifaPurple">Product Boundary</p>
        <h2 className="mt-2 text-2xl font-black text-ink">只做 AI 模型观察，不做竞猜服务</h2>
        <p className="mt-3 max-w-4xl text-sm font-bold leading-7 text-ink/62">
          本站用于展示 AI Agent 如何基于公开信息源进行世界杯预测任务，并对模型命中率、置信度和解释质量进行评测。
          人类投票只作为观察基准，不涉及投注、收益、返奖或兑换。
        </p>
      </section>

      <PublicAiBrief />

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

function MiniMetric({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-sm border border-ink/10 bg-fifaBlue/5 p-3">
      <p className="text-xs font-black uppercase tracking-[0.18em] text-ink/45">{label}</p>
      <p className="mt-1 text-2xl font-black text-fifaBlue">{value}</p>
    </div>
  );
}
