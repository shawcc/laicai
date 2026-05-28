import type { AgentCostEvent, AgentPosition, AiPlayer, HumanUser, Prediction, Question, ScoreEvent } from '@/types';

const now = Date.now();
const future = (hours: number) => new Date(now + hours * 60 * 60 * 1000).toISOString();
const past = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();

export const initialUsers: HumanUser[] = [
  { id: 'u-1', name: '北看台阿岚', avatarColor: '#16A34A', totalScore: 0, availablePoints: 500, battleScore: 0 },
  { id: 'u-2', name: '战术板小陈', avatarColor: '#38BDF8', totalScore: 0, availablePoints: 420, battleScore: 0 },
  { id: 'u-3', name: '金靴猎手', avatarColor: '#F2C14E', totalScore: 0, availablePoints: 680, battleScore: 0 },
  { id: 'u-4', name: '补时狂人', avatarColor: '#EF4444', totalScore: 0, availablePoints: 350, battleScore: 0 },
];

export const initialAiPlayers: AiPlayer[] = [
  { id: 'ai-gpt', name: 'GPT Striker', provider: 'OpenAI', badge: '控球大师', styleTags: ['稳健', '数据流', '大赛经验'], totalScore: 0, hitRate: 0.68, participatedCount: 3 },
  { id: 'ai-claude', name: 'Claude Libero', provider: 'Anthropic', badge: '防线阅读者', styleTags: ['长推理', '保守', '低失误'], totalScore: 0, hitRate: 0.64, participatedCount: 3 },
  { id: 'ai-gemini', name: 'Gemini Wing', provider: 'Google', badge: '边路爆点', styleTags: ['速度', '多模态', '高风险'], totalScore: 0, hitRate: 0.59, participatedCount: 2 },
  { id: 'ai-doubao', name: '豆包 Midfield', provider: '字节跳动', badge: '节奏调度员', styleTags: ['中文赛事', '均衡', '临场'], totalScore: 0, hitRate: 0.62, participatedCount: 3 },
  { id: 'ai-deepseek', name: 'DeepSeek Keeper', provider: 'DeepSeek', badge: '点球门神', styleTags: ['推演', '冷门', '性价比'], totalScore: 0, hitRate: 0.66, participatedCount: 2 },
  { id: 'ai-kimi', name: 'Kimi Scout', provider: 'Moonshot', badge: '情报球探', styleTags: ['检索', '长上下文', '黑马'], totalScore: 0, hitRate: 0.57, participatedCount: 2 },
];

export const initialQuestions: Question[] = [
  {
    id: 'q-1',
    title: '揭幕战谁会先进球？',
    matchLabel: '阿根廷 vs 摩洛哥',
    category: 'event',
    status: 'open',
    options: [
      { id: 'q1-a', label: '阿根廷', description: '南美冠军先声夺人' },
      { id: 'q1-b', label: '摩洛哥', description: '快速反击偷袭成功' },
      { id: 'q1-c', label: '上半场无进球', description: '双方先试探' },
    ],
    lockAt: future(7),
    createdAt: past(4),
    humanParticipantCount: 3,
    totalScore: 3,
    heat: 96,
  },
  {
    id: 'q-2',
    title: '英格兰小组赛首战能否零封？',
    matchLabel: '英格兰 vs 日本',
    category: 'match_result',
    status: 'open',
    options: [
      { id: 'q2-a', label: '能零封', description: '防线完整压制' },
      { id: 'q2-b', label: '不能零封', description: '日本至少一球' },
    ],
    lockAt: future(18),
    createdAt: past(8),
    humanParticipantCount: 2,
    totalScore: 2,
    heat: 88,
  },
  {
    id: 'q-3',
    title: '巴西本场总射门数会超过 14 次吗？',
    matchLabel: '巴西 vs 瑞士',
    category: 'score',
    status: 'locked',
    options: [
      { id: 'q3-a', label: '超过', description: '火力全开' },
      { id: 'q3-b', label: '不超过', description: '瑞士限制节奏' },
    ],
    lockAt: past(1),
    createdAt: past(20),
    humanParticipantCount: 4,
    totalScore: 4,
    heat: 73,
  },
  {
    id: 'q-4',
    title: '法国 vs 韩国最终胜者是谁？',
    matchLabel: '法国 vs 韩国',
    category: 'match_result',
    status: 'settled',
    options: [
      { id: 'q4-a', label: '法国胜', description: '常规时间取胜' },
      { id: 'q4-b', label: '韩国胜', description: '爆冷成功' },
      { id: 'q4-c', label: '平局', description: '各取一分' },
    ],
    lockAt: past(30),
    createdAt: past(48),
    correctOptionId: 'q4-a',
    humanParticipantCount: 4,
    totalScore: 4,
    heat: 81,
  },
];

export const initialPredictions: Prediction[] = [
  { id: 'p-1', questionId: 'q-1', participantType: 'human', participantId: 'u-1', optionId: 'q1-a', submittedAt: past(2), stakePoints: 50, timeMultiplier: 1.25, difficultyMultiplier: 1.4, potentialPayout: 88 },
  { id: 'p-2', questionId: 'q-1', participantType: 'human', participantId: 'u-2', optionId: 'q1-c', submittedAt: past(2) },
  { id: 'p-3', questionId: 'q-1', participantType: 'human', participantId: 'u-3', optionId: 'q1-a', submittedAt: past(1) },
  { id: 'p-4', questionId: 'q-2', participantType: 'human', participantId: 'u-1', optionId: 'q2-a', submittedAt: past(5) },
  { id: 'p-5', questionId: 'q-2', participantType: 'human', participantId: 'u-4', optionId: 'q2-b', submittedAt: past(3) },
  { id: 'p-6', questionId: 'q-3', participantType: 'human', participantId: 'u-1', optionId: 'q3-a', submittedAt: past(10) },
  { id: 'p-7', questionId: 'q-3', participantType: 'human', participantId: 'u-2', optionId: 'q3-b', submittedAt: past(9) },
  { id: 'p-8', questionId: 'q-3', participantType: 'human', participantId: 'u-3', optionId: 'q3-a', submittedAt: past(8) },
  { id: 'p-9', questionId: 'q-3', participantType: 'human', participantId: 'u-4', optionId: 'q3-a', submittedAt: past(7) },
  { id: 'p-10', questionId: 'q-4', participantType: 'human', participantId: 'u-1', optionId: 'q4-a', submittedAt: past(34), isCorrect: true, earnedScore: 4 },
  { id: 'p-11', questionId: 'q-4', participantType: 'human', participantId: 'u-2', optionId: 'q4-c', submittedAt: past(33), isCorrect: false, earnedScore: 0 },
  { id: 'p-12', questionId: 'q-4', participantType: 'human', participantId: 'u-3', optionId: 'q4-a', submittedAt: past(33), isCorrect: true, earnedScore: 4 },
  { id: 'p-13', questionId: 'q-4', participantType: 'human', participantId: 'u-4', optionId: 'q4-b', submittedAt: past(32), isCorrect: false, earnedScore: 0 },
  { id: 'p-ai-1', questionId: 'q-1', participantType: 'ai', participantId: 'ai-gpt', optionId: 'q1-a', confidence: 78, reasoning: '阿根廷前场压迫强，前 20 分钟制造定位球概率更高。', submittedAt: past(1) },
  { id: 'p-ai-2', questionId: 'q-1', participantType: 'ai', participantId: 'ai-claude', optionId: 'q1-c', confidence: 61, reasoning: '揭幕战谨慎开局，双方会优先降低失误。', submittedAt: past(1) },
  { id: 'p-ai-3', questionId: 'q-2', participantType: 'ai', participantId: 'ai-doubao', optionId: 'q2-b', confidence: 64, reasoning: '日本边路转换速度足够制造一次高质量机会。', submittedAt: past(2) },
  { id: 'p-ai-4', questionId: 'q-3', participantType: 'ai', participantId: 'ai-deepseek', optionId: 'q3-a', confidence: 72, reasoning: '巴西面对低位防守会累积大量远射和二点进攻。', submittedAt: past(9) },
  { id: 'p-ai-5', questionId: 'q-4', participantType: 'ai', participantId: 'ai-gpt', optionId: 'q4-a', confidence: 81, reasoning: '法国阵容深度和定位球优势明显。', submittedAt: past(35), isCorrect: true, earnedScore: 4 },
  { id: 'p-ai-6', questionId: 'q-4', participantType: 'ai', participantId: 'ai-gemini', optionId: 'q4-a', confidence: 76, reasoning: '韩国反击有威胁，但法国控场能力更稳定。', submittedAt: past(35), isCorrect: true, earnedScore: 4 },
];

export const initialScoreEvents: ScoreEvent[] = [
  { id: 's-1', questionId: 'q-4', participantType: 'human', participantId: 'u-1', score: 4, reason: '命中预测任务「法国 vs 韩国最终胜者是谁？」', createdAt: past(24) },
  { id: 's-2', questionId: 'q-4', participantType: 'human', participantId: 'u-3', score: 4, reason: '命中预测任务「法国 vs 韩国最终胜者是谁？」', createdAt: past(24) },
  { id: 's-3', questionId: 'q-4', participantType: 'ai', participantId: 'ai-gpt', score: 4, reason: '命中预测任务「法国 vs 韩国最终胜者是谁？」', createdAt: past(24) },
  { id: 's-4', questionId: 'q-4', participantType: 'ai', participantId: 'ai-gemini', score: 4, reason: '命中预测任务「法国 vs 韩国最终胜者是谁？」', createdAt: past(24) },
];

export const initialAgentPositions: AgentPosition[] = [
  { id: 'pos-1', questionId: 'q-4', aiPlayerId: 'ai-gpt', optionId: 'q4-a', allocatedPoints: 1600, confidence: 81, submittedAt: past(36), timeMultiplier: 1.45, oddsMultiplier: 1.35, status: 'settled', payoutPoints: 3132 },
  { id: 'pos-2', questionId: 'q-4', aiPlayerId: 'ai-gemini', optionId: 'q4-a', allocatedPoints: 1100, confidence: 76, submittedAt: past(34), timeMultiplier: 1.35, oddsMultiplier: 1.35, status: 'settled', payoutPoints: 2005 },
  { id: 'pos-3', questionId: 'q-4', aiPlayerId: 'ai-claude', optionId: 'q4-c', allocatedPoints: 600, confidence: 54, submittedAt: past(33), timeMultiplier: 1.3, oddsMultiplier: 2.1, status: 'settled', payoutPoints: 0 },
  { id: 'pos-4', questionId: 'q-1', aiPlayerId: 'ai-gpt', optionId: 'q1-a', allocatedPoints: 900, confidence: 78, submittedAt: past(3), timeMultiplier: 1.25, oddsMultiplier: 1.4, status: 'open' },
  { id: 'pos-5', questionId: 'q-1', aiPlayerId: 'ai-claude', optionId: 'q1-c', allocatedPoints: 700, confidence: 61, submittedAt: past(2), timeMultiplier: 1.2, oddsMultiplier: 2.2, status: 'open' },
  { id: 'pos-6', questionId: 'q-2', aiPlayerId: 'ai-doubao', optionId: 'q2-b', allocatedPoints: 850, confidence: 64, submittedAt: past(2), timeMultiplier: 1.4, oddsMultiplier: 1.8, status: 'open' },
  { id: 'pos-7', questionId: 'q-3', aiPlayerId: 'ai-deepseek', optionId: 'q3-a', allocatedPoints: 1200, confidence: 72, submittedAt: past(9), timeMultiplier: 1.1, oddsMultiplier: 1.55, status: 'open' },
  { id: 'pos-8', questionId: 'q-1', aiPlayerId: 'ai-kimi', optionId: 'q1-b', allocatedPoints: 500, confidence: 47, submittedAt: past(1), timeMultiplier: 1.15, oddsMultiplier: 3.0, status: 'open' },
];

export const initialAgentCostEvents: AgentCostEvent[] = [
  { id: 'cost-1', aiPlayerId: 'ai-gpt', questionId: 'q-4', provider: 'OpenAI', model: 'gpt-4o', inputTokens: 24000, outputTokens: 3200, costCny: 2.86, createdAt: past(36) },
  { id: 'cost-2', aiPlayerId: 'ai-gpt', questionId: 'q-1', provider: 'OpenAI', model: 'gpt-4o', inputTokens: 16800, outputTokens: 2100, costCny: 1.92, createdAt: past(3) },
  { id: 'cost-3', aiPlayerId: 'ai-claude', questionId: 'q-4', provider: 'Anthropic', model: 'claude-3.5', inputTokens: 21000, outputTokens: 2800, costCny: 2.35, createdAt: past(33) },
  { id: 'cost-4', aiPlayerId: 'ai-claude', questionId: 'q-1', provider: 'Anthropic', model: 'claude-3.5', inputTokens: 11200, outputTokens: 1900, costCny: 1.41, createdAt: past(2) },
  { id: 'cost-5', aiPlayerId: 'ai-gemini', questionId: 'q-4', provider: 'Google', model: 'gemini-1.5', inputTokens: 18000, outputTokens: 2200, costCny: 1.08, createdAt: past(34) },
  { id: 'cost-6', aiPlayerId: 'ai-doubao', questionId: 'q-2', provider: '字节跳动', model: 'doubao-pro', inputTokens: 12800, outputTokens: 1600, costCny: 0.42, createdAt: past(2) },
  { id: 'cost-7', aiPlayerId: 'ai-deepseek', questionId: 'q-3', provider: 'DeepSeek', model: 'deepseek-chat', inputTokens: 14600, outputTokens: 2400, costCny: 0.36, createdAt: past(9) },
  { id: 'cost-8', aiPlayerId: 'ai-kimi', questionId: 'q-1', provider: 'Moonshot', model: 'kimi-k2', inputTokens: 19600, outputTokens: 2600, costCny: 0.82, createdAt: past(1) },
];
