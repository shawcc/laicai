import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Bot, CheckCircle2, Clock3, Lock, Send, Sparkles } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { VoteBar } from '@/components/VoteBar';
import { formatCountdown, isQuestionLocked } from '@/lib/gameLogic';
import { useGameStore } from '@/store/useGameStore';

export function QuestionDetail() {
  const { questionId } = useParams();
  const questions = useGameStore((state) => state.questions);
  const predictions = useGameStore((state) => state.predictions);
  const aiPlayers = useGameStore((state) => state.aiPlayers);
  const currentUserId = useGameStore((state) => state.currentUserId);
  const submitPrediction = useGameStore((state) => state.submitPrediction);
  const question = questions.find((item) => item.id === questionId);

  if (!question) {
    return <div className="score-card p-8">题目不存在</div>;
  }

  const userPrediction = predictions.find(
    (prediction) => prediction.questionId === question.id && prediction.participantType === 'human' && prediction.participantId === currentUserId,
  );
  const aiPredictions = predictions.filter((prediction) => prediction.questionId === question.id && prediction.participantType === 'ai');
  const locked = isQuestionLocked(question);
  const communityPredictions = predictions.filter((prediction) => prediction.questionId === question.id && prediction.participantType === 'human');

  return (
    <div className="space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm font-bold text-ink/70 transition hover:text-gold">
        <ArrowLeft className="h-4 w-4" /> 返回任务大厅
      </Link>

      <section className="score-card overflow-hidden p-6 lg:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.35em] text-green">{question.matchLabel}</p>
            <h1 className="mt-3 text-3xl font-black leading-tight text-cream lg:text-5xl">{question.title}</h1>
          </div>
          <StatusBadge status={question.status} />
        </div>
        <div className="stadium-line my-6 h-px" />
        <div className="grid gap-4 md:grid-cols-4">
          <Info label="评测任务" value={question.category} />
          <Info label="观察投票" value={`${communityPredictions.length} 票`} />
          <Info label="提交截止" value={formatCountdown(question.lockAt)} />
          <Info label="Agent 预测" value={`${aiPredictions.length} 位`} />
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="score-card p-5">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-black text-cream">人类观察投票</h2>
            {locked || userPrediction ? <span className="flex items-center gap-2 text-sm font-bold text-red"><Lock className="h-4 w-4" /> 已提交</span> : <span className="text-sm font-bold text-green">仅作观察基准，不涉及竞猜或积分</span>}
          </div>
          <div className="mb-4 grid gap-3 rounded-xl border border-fifaBlue/15 bg-fifaBlue/5 p-4 md:grid-cols-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-ink/45">任务来源</p>
              <p className="mt-1 text-2xl font-black text-fifaBlue">运营 / 社群</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-ink/45">提交窗口</p>
              <p className="mt-1 flex items-center gap-2 text-2xl font-black text-fifaBlue"><Clock3 className="h-5 w-5 text-gold" /> {formatCountdown(question.lockAt)}</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-ink/45">公开声明</p>
              <p className="mt-2 text-sm font-bold leading-6 text-ink/65">本任务只用于 AI 模型评测和公开信息分析。</p>
            </div>
          </div>
          <div className="grid gap-3">
            {question.options.map((option) => {
              const selected = userPrediction?.optionId === option.id;
              const correct = question.correctOptionId === option.id;
              return (
                <button
                  key={option.id}
                  onClick={() => submitPrediction(question.id, option.id)}
                  disabled={locked || Boolean(userPrediction)}
                  className={`rounded-xl border p-5 text-left transition ${selected ? 'border-gold bg-gold/15 shadow-lg shadow-gold/10' : 'border-ink/15 bg-ink/5 hover:border-green/40 hover:bg-green/10'} ${locked ? 'cursor-not-allowed opacity-75' : ''}`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-lg font-black text-cream">{option.label}</p>
                      <p className="mt-1 text-sm text-ink/65">{option.description}</p>
                      <p className="mt-3 text-xs font-black text-fifaPurple">提交后仅进入人类观察基准线</p>
                    </div>
                    {correct && <CheckCircle2 className="h-6 w-6 text-gold" />}
                    {selected && !correct && <Send className="h-5 w-5 text-gold" />}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        <section className="score-card p-5">
          <h2 className="mb-5 text-xl font-black text-cream">观察分布</h2>
          <VoteBar question={question} predictions={predictions} />
        </section>
      </div>

      <section className="score-card p-5">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold" />
          <h2 className="text-xl font-black text-cream">AI Agent 预测</h2>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {aiPredictions.map((prediction) => {
            const ai = aiPlayers.find((item) => item.id === prediction.participantId);
            const option = question.options.find((item) => item.id === prediction.optionId);
            return (
              <article key={prediction.id} className="rounded-xl border border-ink/15 bg-ink/5 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-green/15 text-green"><Bot className="h-5 w-5" /></div>
                    <div>
                      <p className="font-black text-cream">{ai?.name}</p>
                      <p className="text-xs text-ink/65">{ai?.badge}</p>
                    </div>
                  </div>
                  <span className="rounded-sm bg-gold/15 px-3 py-1 text-xs font-black text-gold">{prediction.confidence}%</span>
                </div>
                <p className="mt-4 text-lg font-black text-cream">选择：{option?.label}</p>
                <p className="mt-2 text-sm leading-6 text-cream/55">{prediction.reasoning}</p>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-ink/5 p-4">
      <p className="text-xs uppercase tracking-[0.25em] text-cream/40">{label}</p>
      <p className="mt-2 text-2xl font-black text-gold">{value}</p>
    </div>
  );
}
