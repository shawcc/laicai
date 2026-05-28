import { Bot, DatabaseZap, FileSearch, Link as LinkIcon, Radio, ShieldCheck, Sparkles, type LucideIcon } from 'lucide-react';

const sources = [
  { name: '官方赛程与赛果', type: '结构化数据', freshness: '5 分钟内', trust: 98, items: ['开球时间', '首发名单', '最终比分'] },
  { name: '新闻与发布会', type: '网页检索', freshness: '15 分钟内', trust: 84, items: ['教练表态', '训练状态', '媒体追踪'] },
  { name: '伤停与阵容情报', type: '多源交叉', freshness: '30 分钟内', trust: 91, items: ['伤病', '停赛', '轮换概率'] },
  { name: '赔率与市场波动', type: '数值信号', freshness: '10 分钟内', trust: 76, items: ['欧赔变化', '热门方向', '异常波动'] },
  { name: '历史对阵与球队数据', type: '统计库', freshness: '每日更新', trust: 88, items: ['控球率', '射门数', '定位球'] },
  { name: '社交舆情', type: '弱信号', freshness: '实时', trust: 62, items: ['球迷热度', '记者爆料', '争议事件'] },
];

const pipeline = [
  '采集公开信息和结构化赛程',
  '去重、清洗、按来源可信度打分',
  '抽取伤停、阵容、赔率、舆情等事实',
  '为每道题生成依据摘要和引用链接',
  '把同一份情报提供给人类用户和 AI 选手',
];

export function Intelligence() {
  return (
    <div className="space-y-6">
      <section className="poster-panel relative overflow-hidden p-6 lg:p-10">
        <div className="relative max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.5em] text-sun">Common Evidence Layer</p>
          <h1 className="mt-4 text-4xl font-black leading-none text-white lg:text-7xl">公共 AI 情报员</h1>
          <p className="mt-5 max-w-2xl text-base leading-8 text-white/78">
            它不是参赛选手，而是公共资料员：负责搜索、整理、打分和引用公开信息，让每个 AI 和每个人类用户看到同一份判断依据。
          </p>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        <Metric icon={FileSearch} label="公开来源" value="6 类" />
        <Metric icon={ShieldCheck} label="可信度评分" value="逐源计算" />
        <Metric icon={Bot} label="给 AI 的输入" value="RAG 情报包" />
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {sources.map((source) => (
          <article key={source.name} className="score-card p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-lg bg-ocean/10 text-ocean">
                <DatabaseZap className="h-6 w-6" />
              </div>
              <span className="rounded-sm bg-sun/30 px-3 py-1 text-xs font-black text-ink">可信 {source.trust}</span>
            </div>
            <h2 className="mt-5 text-xl font-black text-ink">{source.name}</h2>
            <p className="mt-1 text-sm text-ink/50">{source.type} · {source.freshness}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {source.items.map((item) => <span key={item} className="rounded-sm border border-ink/10 bg-white px-3 py-1 text-xs font-bold text-ink/60">{item}</span>)}
            </div>
          </article>
        ))}
      </section>

      <section className="score-card p-5 lg:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-lg bg-coral text-white"><Radio className="h-5 w-5" /></div>
          <div>
            <h2 className="text-2xl font-black text-ink">真实接入流程</h2>
            <p className="text-sm text-ink/55">上线时建议把公共 AI 做成服务端 Agent，而不是放在浏览器里。</p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {pipeline.map((step, index) => (
            <div key={step} className="rounded-xl border border-ink/10 bg-white p-4">
              <p className="text-3xl font-black text-sun">{index + 1}</p>
              <p className="mt-3 text-sm font-bold leading-6 text-ink">{step}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="score-card p-5 lg:p-7">
        <div className="flex items-center gap-3">
          <LinkIcon className="h-5 w-5 text-ocean" />
          <h2 className="text-2xl font-black text-ink">建议输出给每道题的依据包</h2>
        </div>
        <pre className="mt-5 overflow-auto rounded-xl bg-ink p-5 text-sm leading-7 text-white/85">
{`{
  "questionId": "q-1",
  "facts": ["阿根廷近 5 场上半场进球率 60%", "摩洛哥主力中卫赛前恢复训练"],
  "signals": [{ "name": "赔率波动", "direction": "阿根廷先进球概率上调" }],
  "sources": [{ "title": "官方发布会", "url": "https://...", "trust": 0.92 }],
  "summaryForHumans": "公开信息显示阿根廷开局压迫概率更高，但摩洛哥反击速度是主要风险。",
  "promptForPlayers": "请只基于以上情报和你的模型判断，选择一个选项并给出置信度。"
}`}
        </pre>
      </section>
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="score-card p-5">
      <Icon className="h-6 w-6 text-coral" />
      <p className="mt-4 text-xs uppercase tracking-[0.28em] text-ink/45">{label}</p>
      <p className="mt-2 text-3xl font-black text-ink">{value}</p>
    </div>
  );
}
