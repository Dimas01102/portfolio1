export type GameKey = 'bug-hunter' | 'memory-card' | 'code-output' | 'fix-the-code';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type AiGameKey = Exclude<GameKey, 'memory-card'>;

export type GameLanguage =
  | 'javascript'
  | 'typescript'
  | 'react'
  | 'php'
  | 'laravel'
  | 'sql'
  | 'html'
  | 'css'
  | 'python'
  | 'cpp'
  | 'golang';

export interface McqQuestion {
  id: string;
  prompt: string;
  code?: string;
  language: GameLanguage;
  difficulty: Difficulty;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation?: string;
}

export interface FixCodeQuestion {
  id: string;
  language: GameLanguage;
  difficulty: Difficulty;
  brokenCode: string;
  expectedAnswer: string;
  acceptableAnswers: string[];
  hint?: string;
}

export interface QuestionPack<T> {
  game: AiGameKey;
  language: GameLanguage;
  difficulty: Difficulty;
  questions: T[];
  cached: boolean;
  generatedAt: string;
}

export type BugHunterPack = QuestionPack<McqQuestion>;
export type CodeOutputPack = QuestionPack<McqQuestion>;
export type FixTheCodePack = QuestionPack<FixCodeQuestion>;

export interface MemoryCardPair {
  id: string;
  left: string;
  right: string;
}

export interface GameResult {
  game: GameKey;
  language: GameLanguage | null;
  difficulty: Difficulty | null;
  score: number;
  accuracy: number; // 0-100
  durationSeconds: number;
  xp: number;
  totalQuestions: number;
  correctAnswers: number;
  achievementKey: string | null;
}

export interface Achievement {
  key: string;
  game: GameKey;
  title: string;
  description: string;
  icon: string;
  condition: (result: GameResult) => boolean;
}

export interface GameSessionRow {
  id: string;
  visitor_id: string;
  game: GameKey;
  language: string | null;
  difficulty: Difficulty | null;
  score: number;
  accuracy: number;
  duration_seconds: number;
  xp: number;
  total_questions: number;
  correct_answers: number;
  completed: boolean;
  created_at: string;
}

export interface GameAnalytics {
  total_players: number;
  total_sessions: number;
  average_score: number;
  average_accuracy: number;
  average_time: number;
  completion_rate: number;
  most_played_game: string | null;
  most_common_language: string | null;
  difficulty_distribution: Record<Difficulty, number>;
  daily_active_players: number;
  weekly_active_players: number;
  monthly_active_players: number;
  total_xp: number;
  top_achievement: string | null;
  sessions_by_game: Record<string, number>;
}