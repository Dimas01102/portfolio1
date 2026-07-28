import { supabase } from '../supabaseClient';
import { getVisitorId } from './visitor';
import {
  BUG_HUNTER_CATEGORIES,
  CODE_OUTPUT_CATEGORIES,
  FIX_THE_CODE_CATEGORIES,
  pickRandom,
  pickWeightedDifficulty,
} from './constants';
import type {
  AiGameKey,
  BugHunterPack,
  CodeOutputPack,
  FixTheCodePack,
  GameLanguage,
} from '../../types/games';
import type { GameResult } from '../../types/games';

const CATEGORY_POOLS: Record<AiGameKey, GameLanguage[]> = {
  'bug-hunter': BUG_HUNTER_CATEGORIES,
  'code-output': CODE_OUTPUT_CATEGORIES,
  'fix-the-code': FIX_THE_CODE_CATEGORIES,
};

export async function fetchQuestionPack<T extends AiGameKey>(
  game: T
): Promise<T extends 'fix-the-code' ? FixTheCodePack : BugHunterPack | CodeOutputPack> {
  const language = pickRandom(CATEGORY_POOLS[game]);
  const difficulty = pickWeightedDifficulty();

  const { data, error } = await supabase.functions.invoke('generate-game-questions', {
    body: { game, language, difficulty, visitorId: getVisitorId() },
  });

  if (error) throw new Error(error.message || 'Gagal memuat soal. Coba lagi.');
  if (!data || data.error) throw new Error(data?.error || 'Paket soal tidak valid.');

  return data as never;
}
  
export async function recordGameSession(result: GameResult): Promise<void> {
  const visitorId = getVisitorId();

  const { error } = await supabase.from('game_sessions').insert({
    visitor_id: visitorId,
    game: result.game,
    language: result.language,
    difficulty: result.difficulty,
    score: result.score,
    accuracy: result.accuracy,
    duration_seconds: result.durationSeconds,
    xp: result.xp,
    total_questions: result.totalQuestions,
    correct_answers: result.correctAnswers,
    completed: true,
  });

  if (error) {
    console.warn('[games] failed to record session', error.message);
    return;
  }

  if (result.achievementKey) {
    const { error: achError } = await supabase.from('game_achievements').upsert(
      {
        visitor_id: visitorId,
        game: result.game,
        achievement_key: result.achievementKey,
      },
      { onConflict: 'visitor_id,achievement_key', ignoreDuplicates: true }
    );
    if (achError) console.warn('[games] failed to record achievement', achError.message);
  }
}