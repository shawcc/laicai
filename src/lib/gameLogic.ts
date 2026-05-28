import type { AiPlayer, BoardEntry, HumanUser, Prediction, Question, ScoreEvent } from '@/types';

export function getQuestionTotalScore(predictions: Prediction[], questionId: string) {
  return new Set(
    predictions
      .filter((prediction) => prediction.questionId === questionId && prediction.participantType === 'human')
      .map((prediction) => prediction.participantId),
  ).size;
}

export function isQuestionLocked(question: Question) {
  return question.status !== 'open' || Date.now() >= new Date(question.lockAt).getTime();
}

export function getOptionVotes(predictions: Prediction[], questionId: string, optionId: string) {
  return predictions.filter(
    (prediction) =>
      prediction.questionId === questionId &&
      prediction.optionId === optionId &&
      prediction.participantType === 'human',
  ).length;
}

export function getTimeMultiplier(lockAt: string, submittedAt = new Date().toISOString()) {
  const hours = (new Date(lockAt).getTime() - new Date(submittedAt).getTime()) / 36e5;
  if (hours >= 72) {
    return 2.5;
  }
  if (hours >= 48) {
    return 2;
  }
  if (hours >= 24) {
    return 1.6;
  }
  if (hours >= 6) {
    return 1.25;
  }
  return 1;
}

export function getDifficultyMultiplier(predictions: Prediction[], question: Question, optionId: string) {
  const humanPredictions = predictions.filter(
    (prediction) => prediction.questionId === question.id && prediction.participantType === 'human',
  );
  const total = Math.max(humanPredictions.length, 1);
  const optionCount = Math.max(
    humanPredictions.filter((prediction) => prediction.optionId === optionId).length,
    1,
  );
  return Math.min(Math.max(Number((total / optionCount).toFixed(2)), 1), 5);
}

export function getPotentialPayout(stakePoints: number, timeMultiplier: number, difficultyMultiplier: number) {
  return Math.round(stakePoints * timeMultiplier * difficultyMultiplier);
}

export function settleQuestion(question: Question, predictions: Prediction[]) {
  const scoped = predictions.filter((prediction) => prediction.questionId === question.id);
  const updatedPredictions = predictions.map((prediction) => {
    if (prediction.questionId !== question.id) {
      return prediction;
    }
    const isCorrect = prediction.optionId === question.correctOptionId;
    const earnedScore = isCorrect ? prediction.finalPayout ?? prediction.potentialPayout ?? question.totalScore : 0;
    return {
      ...prediction,
      isCorrect,
      earnedScore,
      finalPayout: earnedScore,
    };
  });
  const scoreEvents: ScoreEvent[] = scoped
    .filter((prediction) => prediction.optionId === question.correctOptionId)
    .map((prediction) => ({
      id: `score-${question.id}-${prediction.participantId}`,
      questionId: question.id,
      participantType: prediction.participantType,
      participantId: prediction.participantId,
      score: prediction.finalPayout ?? prediction.potentialPayout ?? question.totalScore,
      reason: `答对「${question.title}」`,
      createdAt: new Date().toISOString(),
    }));

  return { updatedPredictions, scoreEvents };
}

export function buildLeaderboard(users: HumanUser[], aiPlayers: AiPlayer[], scoreEvents: ScoreEvent[]): BoardEntry[] {
  const humanRows = users.map((user) => ({
    id: user.id,
    name: user.name,
    kind: 'human' as const,
    badge: '人类玩家',
    score: scoreEvents
      .filter((event) => event.participantType === 'human' && event.participantId === user.id)
      .reduce((sum, event) => sum + event.score, 0),
    meta: '现场竞猜团',
  }));
  const aiRows = aiPlayers.map((ai) => ({
    id: ai.id,
    name: ai.name,
    kind: 'ai' as const,
    badge: ai.badge,
    score: scoreEvents
      .filter((event) => event.participantType === 'ai' && event.participantId === ai.id)
      .reduce((sum, event) => sum + event.score, 0),
    meta: `${ai.provider} · 命中率 ${Math.round(ai.hitRate * 100)}%`,
  }));

  return [...humanRows, ...aiRows].sort((a, b) => b.score - a.score);
}

export function formatCountdown(lockAt: string) {
  const diff = new Date(lockAt).getTime() - Date.now();
  if (diff <= 0) {
    return '已锁票';
  }
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (days > 0) {
    return `${days}天 ${hours % 24}小时`;
  }
  if (hours > 0) {
    return `${hours}小时 ${minutes % 60}分`;
  }
  return `${Math.max(minutes, 1)}分钟`;
}
