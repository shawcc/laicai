import { initialAgentCostEvents, initialAgentPositions, initialAiPlayers, initialPredictions, initialQuestions, initialScoreEvents, initialUsers } from '@/data/mockData';
import { getQuestionTotalScore } from '@/lib/gameLogic';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { AgentCostEvent, AgentPosition, AiPlayer, HumanUser, Prediction, Question, QuestionOption, ScoreEvent } from '@/types';

type QuestionRow = {
  id: string;
  title: string;
  match_label: string;
  category: Question['category'];
  status: Question['status'];
  lock_at: string;
  created_at: string;
  correct_option_id: string | null;
  human_participant_count: number;
  total_score: number;
};

type QuestionOptionRow = {
  id: string;
  question_id: string;
  label: string;
  description: string | null;
};

type PredictionRow = {
  id: string;
  question_id: string;
  participant_type: Prediction['participantType'];
  participant_id: string;
  option_id: string;
  confidence: number | null;
  reasoning: string | null;
  submitted_at: string;
  is_correct: boolean | null;
  earned_score: number | null;
  stake_points: number | null;
  time_multiplier: number | null;
  difficulty_multiplier: number | null;
  potential_payout: number | null;
  final_payout: number | null;
};

type AiPlayerRow = {
  id: string;
  name: string;
  provider: string;
  model: string | null;
  enabled: boolean;
};

type ScoreEventRow = {
  id: string;
  question_id: string;
  participant_type: ScoreEvent['participantType'];
  participant_id: string;
  score: number;
  reason: string;
  created_at: string;
};

export type GameSnapshot = {
  currentUserId: string;
  users: HumanUser[];
  aiPlayers: AiPlayer[];
  questions: Question[];
  predictions: Prediction[];
  scoreEvents: ScoreEvent[];
  agentPositions: AgentPosition[];
  agentCostEvents: AgentCostEvent[];
  source: 'mock' | 'supabase';
};

function mapPredictions(rows: PredictionRow[]): Prediction[] {
  return rows.map((row) => ({
    id: row.id,
    questionId: row.question_id,
    participantType: row.participant_type,
    participantId: row.participant_id,
    optionId: row.option_id,
    confidence: row.confidence ?? undefined,
    reasoning: row.reasoning ?? undefined,
    submittedAt: row.submitted_at,
    isCorrect: row.is_correct ?? undefined,
    earnedScore: row.earned_score ?? undefined,
    stakePoints: row.stake_points ?? undefined,
    timeMultiplier: row.time_multiplier ?? undefined,
    difficultyMultiplier: row.difficulty_multiplier ?? undefined,
    potentialPayout: row.potential_payout ?? undefined,
    finalPayout: row.final_payout ?? undefined,
  }));
}

function mapScoreEvents(rows: ScoreEventRow[]): ScoreEvent[] {
  return rows.map((row) => ({
    id: row.id,
    questionId: row.question_id,
    participantType: row.participant_type,
    participantId: row.participant_id,
    score: row.score,
    reason: row.reason,
    createdAt: row.created_at,
  }));
}

function mapQuestions(rows: QuestionRow[], options: QuestionOptionRow[], predictions: Prediction[]): Question[] {
  const groupedOptions = new Map<string, QuestionOption[]>();
  options.forEach((option) => {
    const scoped = groupedOptions.get(option.question_id) ?? [];
    scoped.push({
      id: option.id,
      label: option.label,
      description: option.description ?? undefined,
    });
    groupedOptions.set(option.question_id, scoped);
  });

  return rows.map((row) => {
    const humanParticipantCount = Math.max(
      row.human_participant_count ?? 0,
      getQuestionTotalScore(predictions, row.id),
    );
    return {
      id: row.id,
      title: row.title,
      matchLabel: row.match_label,
      category: row.category,
      status: row.status,
      options: groupedOptions.get(row.id) ?? [],
      lockAt: row.lock_at,
      createdAt: row.created_at,
      correctOptionId: row.correct_option_id ?? undefined,
      humanParticipantCount,
      totalScore: Math.max(row.total_score ?? 0, humanParticipantCount),
      heat: 75,
    };
  });
}

function mapAiPlayers(rows: AiPlayerRow[], scoreEvents: ScoreEvent[], predictions: Prediction[]): AiPlayer[] {
  return rows
    .filter((row) => row.enabled)
    .map((row, index) => {
      const scopedPredictions = predictions.filter((prediction) => prediction.participantId === row.id);
      const correctCount = scopedPredictions.filter((prediction) => prediction.isCorrect).length;
      const participatedCount = scopedPredictions.length;
      const totalScore = scoreEvents
        .filter((event) => event.participantType === 'ai' && event.participantId === row.id)
        .reduce((sum, event) => sum + event.score, 0);

      return {
        id: row.id,
        name: row.name,
        provider: row.provider,
        badge: row.model || `AI 选手 ${index + 1}`,
        styleTags: [row.provider, '真实模型', participatedCount > 0 ? '已参赛' : '待出战'],
        totalScore,
        hitRate: participatedCount > 0 ? correctCount / participatedCount : 0,
        participatedCount,
      };
    });
}

export function getMockSnapshot(): GameSnapshot {
  return {
    currentUserId: initialUsers[0]?.id ?? '',
    users: initialUsers,
    aiPlayers: initialAiPlayers,
    questions: initialQuestions,
    predictions: initialPredictions,
    scoreEvents: initialScoreEvents,
    agentPositions: initialAgentPositions,
    agentCostEvents: initialAgentCostEvents,
    source: 'mock',
  };
}

export async function fetchGameSnapshot(): Promise<GameSnapshot> {
  if (!isSupabaseConfigured || !supabase) {
    return getMockSnapshot();
  }

  const [questionsResult, optionsResult, predictionsResult, aiPlayersResult, scoreEventsResult] =
    await Promise.all([
      supabase
        .from('questions')
        .select('id, title, match_label, category, status, lock_at, created_at, correct_option_id, human_participant_count, total_score')
        .order('created_at', { ascending: false }),
      supabase.from('question_options').select('id, question_id, label, description'),
      supabase
        .from('predictions')
        .select('id, question_id, participant_type, participant_id, option_id, confidence, reasoning, submitted_at, is_correct, earned_score, stake_points, time_multiplier, difficulty_multiplier, potential_payout, final_payout'),
      supabase.from('ai_players').select('id, name, provider, model, enabled'),
      supabase
        .from('score_events')
        .select('id, question_id, participant_type, participant_id, score, reason, created_at')
        .order('created_at', { ascending: false }),
    ]);

  const error = [
    questionsResult.error,
    optionsResult.error,
    predictionsResult.error,
    aiPlayersResult.error,
    scoreEventsResult.error,
  ].find(Boolean);

  if (error) {
    throw error;
  }

  const predictions = mapPredictions((predictionsResult.data ?? []) as PredictionRow[]);
  const scoreEvents = mapScoreEvents((scoreEventsResult.data ?? []) as ScoreEventRow[]);
  const questions = mapQuestions(
    (questionsResult.data ?? []) as QuestionRow[],
    (optionsResult.data ?? []) as QuestionOptionRow[],
    predictions,
  );
  const aiPlayers = mapAiPlayers((aiPlayersResult.data ?? []) as AiPlayerRow[], scoreEvents, predictions);

  if (questions.length === 0) {
    return getMockSnapshot();
  }

  return {
    currentUserId: initialUsers[0]?.id ?? '',
    users: initialUsers,
    aiPlayers: aiPlayers.length > 0 ? aiPlayers : initialAiPlayers,
    questions,
    predictions,
    scoreEvents,
    agentPositions: initialAgentPositions,
    agentCostEvents: initialAgentCostEvents,
    source: 'supabase',
  };
}
