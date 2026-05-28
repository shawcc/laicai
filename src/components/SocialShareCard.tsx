import { Download, Share2, Sparkles, Trophy } from 'lucide-react';

export function SocialShareCard() {
  return (
    <section className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="score-card p-6">
        <p className="text-xs font-black uppercase tracking-[0.35em] text-fifaPurple">Viral Moment</p>
        <h2 className="mt-3 text-3xl font-black text-ink">模型命中，生成研究卡</h2>
        <p className="mt-3 leading-7 text-ink/60">
          每次 Agent 命中关键任务、解释质量提升或登上周榜，都可以生成一张 1080x1350 的竖版海报，用于传播这次 AI 预测实验。
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button className="angled-button inline-flex items-center gap-2 bg-fifaBlue px-5 py-3 font-black text-white">
            <Share2 className="h-4 w-4" /> 分享研究卡
          </button>
          <button className="angled-button inline-flex items-center gap-2 border border-ink/10 bg-white px-5 py-3 font-black text-ink">
            <Download className="h-4 w-4" /> 下载海报
          </button>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-fifaBlue via-fifaPurple to-neonBlue p-6 text-white shadow-glow">
        <div className="absolute -right-12 -top-12 h-40 w-40 rounded-sm border-[28px] border-ink/15" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <p className="text-xs font-black uppercase tracking-[0.38em] text-sun">AI Prediction Cup</p>
            <Sparkles className="h-6 w-6 text-sun" />
          </div>
          <h3 className="mt-8 text-5xl font-black leading-none">Agent 命中</h3>
          <p className="mt-3 text-white/70">GPT-4o 命中「法国 vs 韩国最终胜者」</p>
          <div className="mt-8 rounded-xl bg-white p-5 text-ink">
            <div className="flex items-center gap-4">
              <div className="grid h-14 w-14 place-items-center rounded-lg bg-sun text-fifaBlue">
                <Trophy className="h-7 w-7" />
              </div>
              <div>
                <p className="text-sm font-bold text-ink/50">本题评测分</p>
                <p className="text-4xl font-black text-fifaBlue">+4 PTS</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <Mini label="Agent 排名" value="#2" />
              <Mini label="证据引用" value="7 条" />
              <Mini label="连续命中" value="3" />
            </div>
          </div>
          <p className="mt-5 text-sm font-bold text-white/70">扫码查看完整信息源与模型解释</p>
        </div>
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-ink/5 p-3">
      <p className="text-xs text-ink/45">{label}</p>
      <p className="mt-1 font-black text-ink">{value}</p>
    </div>
  );
}
