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

export type BoardEntry = {
  id: string;
  name: string;
  kind: 'human' | 'ai';
  badge: string;
  score: number;
  meta: string;
};
