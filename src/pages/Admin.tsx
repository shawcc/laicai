import { FormEvent, useMemo, useState } from 'react';
import { Bot, CheckCircle2, Lock, Plus, Radar } from 'lucide-react';
import { StatusBadge } from '@/components/StatusBadge';
import { useGameStore } from '@/store/useGameStore';
import type { QuestionCategory } from '@/types';

const categories: Array<{ value: QuestionCategory; label: string }> = [
  { value: 'match_result', label: '赛果' },
  { value: 'score', label: '比分/数据' },
  { value: 'player', label: '球员' },
  { value: 'event', label: '事件' },
  { value: 'custom', label: '自定义' },
];

export function Admin() {
  const questions = useGameStore((state) => state.questions);
  const addQuestion = useGameStore((state) => state.addQuestion);
  const lockQuestion = useGameStore((state) => state.lockQuestion);
  const revealAndSettle = useGameStore((state) => state.revealAndSettle);
  const runAiDraft = useGameStore((state) => state.runAiDraft);
  const lockExpiredQuestions = useGameStore((state) => state.lockExpiredQuestions);
  const [title, setTitle] = useState('');
  const [matchLabel, setMatchLabel] = useState('');
  const [category, setCategory] = useState<QuestionCategory>('match_result');
  const [options, setOptions] = useState('主队胜\n客队胜\n平局');
  const defaultLockAt = useMemo(() => new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString().slice(0, 16), []);
  const [lockAt, setLockAt] = useState(defaultLockAt);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    addQuestion({
      title,
      matchLabel,
      category,
      options: options.split('\n').map((item) => item.trim()),
      lockAt: new Date(lockAt).toISOString(),
    });
    setTitle('');
    setMatchLabel('');
  }

  return (
    <div className="space-y-6">
      <section className="score-card p-6 lg:p-8">
        <p className="text-xs font-black uppercase tracking-[0.45em] text-gold">Control Room</p>
        <h1 className="mt-3 text-4xl font-black text-cream lg:text-6xl">运营控制台</h1>
        <p className="mt-4 text-ink/70">发布预测任务、触发 Agent 自动提交、截止巡检、手动截止和结果评测。</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button onClick={runAiDraft} className="angled-button inline-flex items-center gap-2 bg-gold px-5 py-3 font-black text-night"><Bot className="h-4 w-4" /> 启动 Agent 任务</button>
          <button onClick={lockExpiredQuestions} className="angled-button inline-flex items-center gap-2 border border-red/40 bg-red/15 px-5 py-3 font-black text-red"><Radar className="h-4 w-4" /> 截止巡检</button>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <form onSubmit={handleSubmit} className="score-card space-y-4 p-5">
          <h2 className="text-xl font-black text-cream">新增预测任务</h2>
          <Field label="题目">
            <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="例如：谁会成为本场最佳球员？" className="w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-ink/35 focus:border-sun" />
          </Field>
          <Field label="比赛标签">
            <input value={matchLabel} onChange={(event) => setMatchLabel(event.target.value)} placeholder="例如：西班牙 vs 德国" className="w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-ink outline-none transition placeholder:text-ink/35 focus:border-sun" />
          </Field>
          <Field label="题型">
            <select value={category} onChange={(event) => setCategory(event.target.value as QuestionCategory)} className="w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-ink outline-none focus:border-sun">
              {categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}
            </select>
          </Field>
          <Field label="选项，每行一个">
            <textarea value={options} onChange={(event) => setOptions(event.target.value)} rows={4} className="w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-ink outline-none focus:border-sun" />
          </Field>
          <Field label="提交截止时间">
            <input type="datetime-local" value={lockAt} onChange={(event) => setLockAt(event.target.value)} className="w-full rounded-lg border border-ink/10 bg-white px-4 py-3 text-ink outline-none focus:border-sun" />
          </Field>
          <button className="angled-button inline-flex items-center gap-2 bg-green px-5 py-3 font-black text-night transition hover:brightness-110"><Plus className="h-4 w-4" /> 创建题目</button>
        </form>

        <section className="score-card overflow-hidden">
          <div className="border-b border-ink/10 px-5 py-4">
            <h2 className="text-xl font-black text-cream">题目管理</h2>
          </div>
          <div className="max-h-[680px] divide-y divide-ink/10 overflow-auto">
            {questions.map((question) => (
              <article key={question.id} className="p-5">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-green">{question.matchLabel}</p>
                    <h3 className="mt-2 font-black text-cream">{question.title}</h3>
                    <p className="mt-1 text-sm text-ink/65">任务热度 {question.totalScore} · 观察 {question.humanParticipantCount} · 选项 {question.options.length}</p>
                  </div>
                  <StatusBadge status={question.status} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <button disabled={question.status !== 'open'} onClick={() => lockQuestion(question.id)} className="rounded-sm border border-red/30 bg-red/10 px-3 py-2 text-xs font-black text-red disabled:cursor-not-allowed disabled:opacity-40"><Lock className="mr-1 inline h-3 w-3" /> 截止</button>
                  {question.options.map((option) => (
                    <button key={option.id} disabled={question.status === 'settled'} onClick={() => revealAndSettle(question.id, option.id)} className="rounded-sm border border-gold/30 bg-gold/10 px-3 py-2 text-xs font-black text-gold disabled:cursor-not-allowed disabled:opacity-40">
                      <CheckCircle2 className="mr-1 inline h-3 w-3" /> 以「{option.label}」作为结果
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-bold text-cream/65">{label}</span>
      {children}
    </label>
  );
}
