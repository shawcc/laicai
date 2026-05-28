import { create } from 'zustand';
import { initialAgentCostEvents, initialAgentPositions, initialAiPlayers, initialPredictions, initialQuestions, initialScoreEvents, initialUsers } from '@/data/mockData';
import { getQuestionTotalScore, settleQuestion } from '@/lib/gameLogic';
import { fetchGameSnapshot } from '@/lib/supabaseData';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { AgentCostEvent, AgentPosition, AiPlayer, HumanUser, Prediction, Question, QuestionCategory, ScoreEvent } from '@/types';

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
  agentPositions: AgentPosition[];
  agentCostEvents: AgentCostEvent[];
  dataSource: 'mock' | 'supabase';
  isHydrating: boolean;
  hydrationError?: string;
  setCurrentUserId: (userId: string) => void;
  hydrateFromSupabase: () => Promise<void>;
  submitPrediction: (questionId: string, optionId: string) => Promise<void>;
  runAiDraft: () => void;
  lockExpiredQuestions: () => void;
  lockQuestion: (questionId: string) => void;
  revealAndSettle: (questionId: string, correctOptionId: string) => Promise<void>;
  addQuestion: (input: NewQuestionInput) => Promise<void>;
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
  '临场变量偏向防守方，但公开信息仍支持该判断。',
];

export const useGameStore = create<GameState>((set, get) => ({
  currentUserId: 'u-1',
  users: initialUsers,
  aiPlayers: initialAiPlayers,
  questions: initialQuestions,
  predictions: initialPredictions,
  scoreEvents: initialScoreEvents,
  agentPositions: initialAgentPositions,
  agentCostEvents: initialAgentCostEvents,
  dataSource: 'mock',
  isHydrating: false,

  setCurrentUserId: (userId) => {
    set({ currentUserId: userId });
  },

  hydrateFromSupabase: async () => {
    if (!isSupabaseConfigured) {
      set({ dataSource: 'mock', isHydrating: false, hydrationError: undefined });
      return;
    }

    set({ isHydrating: true, hydrationError: undefined });
    try {
      const snapshot = await fetchGameSnapshot();
      const currentUserId = get().currentUserId;
      const nextCurrentUserId = snapshot.users.some((user) => user.id === currentUserId)
        ? currentUserId
        : snapshot.currentUserId;
      set({
        currentUserId: nextCurrentUserId,
        users: snapshot.users,
        aiPlayers: snapshot.aiPlayers,
        questions: snapshot.questions,
        predictions: snapshot.predictions,
        scoreEvents: snapshot.scoreEvents,
        agentPositions: snapshot.agentPositions,
        agentCostEvents: snapshot.agentCostEvents,
        dataSource: snapshot.source,
        isHydrating: false,
        hydrationError: undefined,
      });
    } catch (error) {
      console.warn('Supabase sync failed, falling back to mock data:', error);
      set({
        dataSource: 'mock',
        isHydrating: false,
        hydrationError: undefined,
      });
    }
  },

  submitPrediction: async (questionId, optionId) => {
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
    if (existing) {
      set({ hydrationError: '这道任务已经提交观察投票，不能重复提交' });
      return;
    }

    const submittedAt = new Date().toISOString();
    const nextPrediction: Prediction = {
      id: `p-${Date.now()}`,
      questionId,
      participantType: 'human' as const,
      participantId: state.currentUserId,
      optionId,
      submittedAt,
    };

    const predictions = [...state.predictions, nextPrediction];

    set({ predictions, questions: refreshQuestionScores(state.questions, predictions), hydrationError: undefined });

    // 无用户系统版本：观察投票只作为本地基准，不写入线上库。
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

  revealAndSettle: async (questionId, correctOptionId) => {
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

    if (state.dataSource === 'supabase' && supabase) {
      const { error } = await supabase
        .from('questions')
        .update({ correct_option_id: correctOptionId, status: 'settled', total_score: scoredQuestion.totalScore })
        .eq('id', questionId);
      if (error) {
        set({ hydrationError: `Supabase 结算同步失败：${error.message}` });
      } else {
        await get().hydrateFromSupabase();
      }
    }
  },

  addQuestion: async (input) => {
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

    if (get().dataSource !== 'supabase' || !supabase) {
      return;
    }

    const { data, error } = await supabase
      .from('questions')
      .insert({
        title: input.title,
        match_label: input.matchLabel || '待定赛程',
        category: input.category,
        status: 'open',
        lock_at: input.lockAt,
        total_score: 0,
        human_participant_count: 0,
      })
      .select('id')
      .single();

    if (error || !data) {
      set({ hydrationError: `Supabase 新增题目失败：${error?.message ?? '未知错误'}` });
      return;
    }

    const optionRows = options.map((option) => ({
      question_id: data.id,
      label: option.label,
      description: null,
    }));

    const optionInsert = await supabase.from('question_options').insert(optionRows);
    if (optionInsert.error) {
      set({ hydrationError: `Supabase 新增选项失败：${optionInsert.error.message}` });
      return;
    }

    await get().hydrateFromSupabase();
  },
}));
