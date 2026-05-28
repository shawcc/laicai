import type { QuestionStatus } from '@/types';

const statusMap: Record<QuestionStatus, string> = {
  draft: '草稿',
  open: '开放竞猜',
  locked: '已锁票',
  revealed: '已开奖',
  settled: '已结算',
  voided: '已作废',
};

const toneMap: Record<QuestionStatus, string> = {
  draft: 'border-white/15 bg-white/10 text-ink/75',
  open: 'border-green/40 bg-green/15 text-green',
  locked: 'border-red/40 bg-red/15 text-red',
  revealed: 'border-sky/40 bg-sky/15 text-sky',
  settled: 'border-gold/40 bg-gold/15 text-gold',
  voided: 'border-zinc-400/30 bg-zinc-500/15 text-zinc-300',
};

export function StatusBadge({ status }: { status: QuestionStatus }) {
  return <span className={`rounded-sm border px-3 py-1 text-xs font-black ${toneMap[status]}`}>{statusMap[status]}</span>;
}
