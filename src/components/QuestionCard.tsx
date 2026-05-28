import { Link } from 'react-router-dom';
import { Bot, Clock, Flame, Users } from 'lucide-react';
import { formatCountdown } from '@/lib/gameLogic';
import type { Prediction, Question } from '@/types';
import { StatusBadge } from '@/components/StatusBadge';

export function QuestionCard({ question, predictions }: { question: Question; predictions: Prediction[] }) {
  const aiCount = predictions.filter((prediction) => prediction.questionId === question.id && prediction.participantType === 'ai').length;

  return (
    <Link to={`/questions/${question.id}`} className="group score-card relative block overflow-hidden p-5 transition hover:-translate-y-1 hover:border-ocean/30 hover:shadow-glow">
      <div className="absolute -right-6 -top-6 h-28 w-28 rounded-sm bg-sun/35 blur-2xl transition group-hover:bg-coral/25" />
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-coral via-sun to-ocean" />
      <div className="relative flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-ocean">{question.matchLabel}</p>
          <h3 className="mt-3 text-xl font-black leading-tight text-cream">{question.title}</h3>
        </div>
        <StatusBadge status={question.status} />
      </div>
      <div className="relative mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
        <div className="rounded-lg border border-ink/10 bg-white p-3">
          <Users className="mb-2 h-4 w-4 text-sky" />
          <p className="text-ink/65">观察投票</p>
          <p className="font-black text-cream">{question.humanParticipantCount}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-3">
          <Flame className="mb-2 h-4 w-4 text-gold" />
          <p className="text-ink/65">任务热度</p>
          <p className="font-black text-cream">{question.totalScore}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-3">
          <Bot className="mb-2 h-4 w-4 text-green" />
          <p className="text-ink/65">Agent 提交</p>
          <p className="font-black text-cream">{aiCount}</p>
        </div>
        <div className="rounded-lg border border-ink/10 bg-white p-3">
          <Clock className="mb-2 h-4 w-4 text-red" />
          <p className="text-ink/65">截止</p>
          <p className="font-black text-cream">{formatCountdown(question.lockAt)}</p>
        </div>
      </div>
    </Link>
  );
}
