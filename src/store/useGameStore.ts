import { create } from 'zustand';
import { initialAiPlayers, initialPredictions, initialQuestions, initialScoreEvents, initialUsers } from '@/data/mockData';
import { getQuestionTotalScore, settleQuestion } from '@/lib/gameLogic';
import type { AiPlayer, HumanUser, Prediction, Question, QuestionCategory, ScoreEvent } from '@/types';

type NewQuestionInput = {
  title: string;
  matchLabel: string;
  category: QuestionCategory;
  options: string[];
  lockAt: string;
};

type GameState = {
  currentUserId: string;
  users: HumanUser[];
  aiPlayers: AiPlayer[];
  questions: Question[];
  predictions: Prediction[];
  scoreEvents: ScoreEvent[];
  submitPrediction: (questionId: string, optionId: string) => void;
  runAiDraft: () => void;
  lockExpiredQuestions: () => void;
  lockQuestion: (questionId: string) => void;
  revealAndSettle: (questionId: string, correctOptionId: string) => void;
  addQuestion: (input: NewQuestionInput) => void;
};

function refreshQuestionScores(questions: Question[], predictions: Prediction[]) {
  return questions.map((question) => {
    const humanParticipantCount = getQuestionTotalScore(predictions, question.id);
    return { ...question, humanParticipantCount, totalScore: humanParticipantCount };
  });
}

const aiReasoning = [
  '赛程密度和阵容轮换显示，这道题存在明确概率边。',
  '模型把近期状态、赔率波动和历史对阵合并后选择该答案。',
  '该选项在模拟一万次比赛路径中胜率最高。',
  '临场变量偏向防守方，但热门方仍有稳定收益。',
];

export const useGameStore = create<GameState>((set, get) => ({
  currentUserId: 'u-1',
  users: initialUsers,
  aiPlayers: initialAiPlayers,
  questions: initialQuestions,
  predictions: initialPredictions,
  scoreEvents: initialScoreEvents,

  submitPrediction: (questionId, optionId) => {
    const state = get();
    const question = state.questions.find((item) => item.id === questionId);
    if (!question || question.status !== 'open' || Date.now() >= new Date(question.lockAt).getTime()) {
      return;
    }

    const existing = state.predictions.find(
      (prediction) =>
        prediction.questionId === questionId &&
        prediction.participantType === 'human' &&
        prediction.participantId === state.currentUserId,
    );

    const predictions = existing
      ? state.predictions.map((prediction) =>
          prediction.id === existing.id ? { ...prediction, optionId, submittedAt: new Date().toISOString() } : prediction,
        )
      : [
          ...state.predictions,
          {
            id: `p-${Date.now()}`,
            questionId,
            participantType: 'human' as const,
            participantId: state.currentUserId,
            optionId,
            submittedAt: new Date().toISOString(),
          },
        ];

    set({ predictions, questions: refreshQuestionScores(state.questions, predictions) });
  },

  runAiDraft: () => {
    const state = get();
    const openQuestions = state.questions
      .filter((question) => question.status === 'open' && Date.now() < new Date(question.lockAt).getTime())
      .sort((a, b) => b.heat - a.heat);

    if (openQuestions.length === 0) {
      return;
    }

    const additions: Prediction[] = [];
    state.aiPlayers.forEach((ai, index) => {
      const question = openQuestions[index % openQuestions.length];
      const alreadyJoined = state.predictions.some(
        (prediction) => prediction.questionId === question.id && prediction.participantId === ai.id,
      );
      if (alreadyJoined) {
        return;
      }
      const option = question.options[(index + question.options.length) % question.options.length];
      additions.push({
        id: `p-ai-${Date.now()}-${ai.id}`,
        questionId: question.id,
        participantType: 'ai',
        participantId: ai.id,
        optionId: option.id,
        confidence: 55 + ((question.heat + index * 7) % 37),
        reasoning: aiReasoning[index % aiReasoning.length],
        submittedAt: new Date().toISOString(),
      });
    });

    if (additions.length > 0) {
      set({ predictions: [...state.predictions, ...additions] });
    }
  },

  lockExpiredQuestions: () => {
    const now = Date.now();
    set((state) => ({
      questions: state.questions.map((question) =>
        question.status === 'open' && now >= new Date(question.lockAt).getTime()
          ? { ...question, status: 'locked' }
          : question,
      ),
    }));
  },

  lockQuestion: (questionId) => {
    set((state) => ({
      questions: state.questions.map((question) =>
        question.id === questionId && question.status === 'open' ? { ...question, status: 'locked' } : question,
      ),
    }));
  },

  revealAndSettle: (questionId, correctOptionId) => {
    const state = get();
    const question = state.questions.find((item) => item.id === questionId);
    if (!question || question.status === 'settled') {
      return;
    }
    const scoredQuestion = { ...question, correctOptionId, status: 'settled' as const };
    const { updatedPredictions, scoreEvents } = settleQuestion(scoredQuestion, state.predictions);
    const nextEvents = [
      ...state.scoreEvents.filter((event) => event.questionId !== questionId),
      ...scoreEvents,
    ];

    set({
      predictions: updatedPredictions,
      scoreEvents: nextEvents,
      questions: state.questions.map((item) => (item.id === questionId ? scoredQuestion : item)),
    });
  },

  addQuestion: (input) => {
    const options = input.options
      .filter(Boolean)
      .slice(0, 4)
      .map((label, index) => ({ id: `q-${Date.now()}-${index}`, label }));
    if (!input.title || options.length < 2) {
      return;
    }

    const question: Question = {
      id: `q-${Date.now()}`,
      title: input.title,
      matchLabel: input.matchLabel || '待定赛程',
      category: input.category,
      status: 'open',
      options,
      lockAt: input.lockAt,
      createdAt: new Date().toISOString(),
      humanParticipantCount: 0,
      totalScore: 0,
      heat: 60 + Math.round(Math.random() * 35),
    };

    set((state) => ({ questions: [question, ...state.questions] }));
  },
}));
