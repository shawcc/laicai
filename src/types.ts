export type QuestionStatus = 'draft' | 'open' | 'locked' | 'revealed' | 'settled' | 'voided';

export type QuestionCategory = 'match_result' | 'score' | 'player' | 'event' | 'custom';

export interface QuestionOption {
  id: string;
  label: string;
  description?: string;
}

export interface Question {
  id: string;
  title: string;
  matchLabel: string;
  category: QuestionCategory;
  status: QuestionStatus;
  options: QuestionOption[];
  lockAt: string;
  createdAt: string;
  correctOptionId?: string;
  humanParticipantCount: number;
  totalScore: number;
  heat: number;
}

export interface HumanUser {
  id: string;
  name: string;
  avatarColor: string;
  totalScore: number;
  availablePoints: number;
  battleScore: number;
}

export interface AiPlayer {
  id: string;
  name: string;
  provider: string;
  badge: string;
  styleTags: string[];
  totalScore: number;
  hitRate: number;
  participatedCount: number;
}

export interface Prediction {
  id: string;
  questionId: string;
  participantType: 'human' | 'ai';
  participantId: string;
  optionId: string;
  confidence?: number;
  reasoning?: string;
  submittedAt: string;
  isCorrect?: boolean;
  earnedScore?: number;
  stakePoints?: number;
  timeMultiplier?: number;
  difficultyMultiplier?: number;
  potentialPayout?: number;
  finalPayout?: number;
}

export interface ScoreEvent {
  id: string;
  questionId: string;
  participantType: 'human' | 'ai';
  participantId: string;
  score: number;
  reason: string;
  createdAt: string;
}

export type AgentPositionStatus = 'open' | 'settled' | 'voided';

export interface AgentPosition {
  id: string;
  questionId: string;
  aiPlayerId: string;
  optionId: string;
  allocatedPoints: number;
  confidence: number;
  submittedAt: string;
  timeMultiplier: number;
  oddsMultiplier: number;
  status: AgentPositionStatus;
  payoutPoints?: number;
}

export interface AgentCostEvent {
  id: string;
  aiPlayerId: string;
  questionId?: string;
  provider: string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  costCny: number;
  createdAt: string;
}

export interface AgentPortfolio {
  aiPlayerId: string;
  initialBudget: number;
  allocatedBudget: number;
  remainingBudget: number;
  settledPayout: number;
  grossValue: number;
  grossProfit: number;
  roi: number;
  tokenCostCny: number;
  tokenCostPoints: number;
  netValue: number;
  netProfit: number;
  netRoi: number;
}

export type BoardEntry = {
  id: string;
  name: string;
  kind: 'human' | 'ai';
  badge: string;
  score: number;
  meta: string;
};
