import { getOptionVotes } from '@/lib/gameLogic';
import type { Prediction, Question } from '@/types';

export function VoteBar({ question, predictions }: { question: Question; predictions: Prediction[] }) {
  const total = Math.max(question.humanParticipantCount, 1);
  return (
    <div className="space-y-3">
      {question.options.map((option) => {
        const votes = getOptionVotes(predictions, question.id, option.id);
        const percent = Math.round((votes / total) * 100);
        const isCorrect = question.correctOptionId === option.id;
        return (
          <div key={option.id}>
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-bold text-cream">{option.label}</span>
              <span className={isCorrect ? 'font-black text-gold' : 'text-ink/70'}>{votes} 票 · {percent}%</span>
            </div>
            <div className="h-3 overflow-hidden rounded-sm bg-white/10">
              <div className={`h-full rounded-sm ${isCorrect ? 'bg-gold' : 'bg-green'}`} style={{ width: `${percent}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
