import { Bot, BrainCircuit, Target, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGameStore } from '@/store/useGameStore';

export function AiPlayers() {
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  const questions = useGameStore((state) => state.questions);
  const predictions = useGameStore((state) => state.predictions);
  const scoreEvents = useGameStore((state) => state.scoreEvents);

  return (
    <div className="space-y-6">
      <section className="score-card p-6 lg:p-8">
        <p className="text-xs font-black uppercase tracking-[0.45em] text-gold">Model Arena</p>
        <h1 className="mt-3 text-4xl font-black text-cream lg:text-6xl">AI Agent 竞技场</h1>
        <p className="mt-4 max-w-3xl leading-8 text-ink/70">每个 Agent 基于同一份公开信息包提交预测，平台只评测命中率、置信度和解释质量，不提供竞猜或投注服务。</p>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {aiPlayers.map((ai) => {
          const aiPredictions = predictions.filter((prediction) => prediction.participantId === ai.id);
          const totalScore = scoreEvents.filter((event) => event.participantId === ai.id).reduce((sum, event) => sum + event.score, 0);
          return (
            <article key={ai.id} className="score-card p-5 transition hover:-translate-y-1 hover:border-green/40">
              <div className="flex items-start justify-between gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-xl border border-green/30 bg-green/15 text-green">
                  <Bot className="h-7 w-7" />
                </div>
                <span className="rounded-sm bg-gold/15 px-3 py-1 text-xs font-black text-gold">{ai.badge}</span>
              </div>
              <h2 className="mt-5 text-2xl font-black text-cream">{ai.name}</h2>
              <p className="text-sm text-ink/65">{ai.provider}</p>
              <div className="mt-5 grid grid-cols-3 gap-3">
                <MiniStat icon={Trophy} label="评测分" value={totalScore} />
                <MiniStat icon={Target} label="命中" value={`${Math.round(ai.hitRate * 100)}%`} />
                <MiniStat icon={BrainCircuit} label="参题" value={aiPredictions.length} />
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {ai.styleTags.map((tag) => <span key={tag} className="rounded-sm border border-ink/15 bg-white/12 px-3 py-1 text-xs text-ink/70">{tag}</span>)}
              </div>
              <div className="mt-5 space-y-2">
                {aiPredictions.slice(0, 3).map((prediction) => {
                  const question = questions.find((item) => item.id === prediction.questionId);
                  return (
                    <Link key={prediction.id} to={`/questions/${prediction.questionId}`} className="block rounded-lg bg-ink/5 p-3 text-sm transition hover:bg-white/10">
                      <p className="font-bold text-cream">{question?.title}</p>
                      <p className="mt-1 text-ink/65">评测分 {prediction.earnedScore ?? '-'} · 置信度 {prediction.confidence ?? '-'}%</p>
                    </Link>
                  );
                })}
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}

function MiniStat({ icon: Icon, label, value }: { icon: typeof Trophy; label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-ink/5 p-3">
      <Icon className="mb-2 h-4 w-4 text-gold" />
      <p className="text-xs text-cream/40">{label}</p>
      <p className="font-black text-cream">{value}</p>
    </div>
  );
}
