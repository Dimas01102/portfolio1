import type { Achievement, GameLanguage, MemoryCardPair, Difficulty } from '../../types/games';

export const GAME_META: Record<
  string,
  { title: string; icon: string; tagline: string; accent: string }
> = {
  'bug-hunter': {
    title: 'Bug Hunter',
    icon: 'bi-bug',
    tagline: 'Temukan bug dari potongan kode dalam waktu terbatas.',
    accent: '#d64545',
  },
  'memory-card': {
    title: 'Memory Card Programming',
    icon: 'bi-grid-3x3-gap',
    tagline: 'Cocokkan pasangan istilah teknologi secepat mungkin.',
    accent: '#3949ec',
  },
  'code-output': {
    title: 'Code Output Challenge',
    icon: 'bi-terminal',
    tagline: 'Tebak output dari potongan kode sebelum waktu habis.',
    accent: '#b9862f',
  },
  'fix-the-code': {
    title: 'Fix The Code',
    icon: 'bi-tools',
    tagline: 'Perbaiki kode yang salah, bukan sekedar pilih jawaban.',
    accent: '#1f9d55',
  },
};

export const BUG_HUNTER_CATEGORIES: GameLanguage[] = [
  'javascript',
  'typescript',
  'react',
  'php',
  'laravel',
  'sql',
  'html',
  'css',
];

export const CODE_OUTPUT_CATEGORIES: GameLanguage[] = ['javascript', 'php', 'python', 'sql', 'cpp', 'golang'];

export const FIX_THE_CODE_CATEGORIES: GameLanguage[] = ['javascript', 'php', 'react', 'laravel', 'sql'];

export const LANGUAGE_LABELS: Record<GameLanguage, string> = {
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  react: 'React',
  php: 'PHP',
  laravel: 'Laravel',
  sql: 'SQL',
  html: 'HTML',
  css: 'CSS',
  python: 'Python',
  cpp: 'C++',
  golang: 'Go',
};

export const DIFFICULTY_LABELS: Record<Difficulty, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Hard',
};

export const DIFFICULTY_WEIGHTS: { difficulty: Difficulty; weight: number }[] = [
  { difficulty: 'easy', weight: 0.4 },
  { difficulty: 'medium', weight: 0.4 },
  { difficulty: 'hard', weight: 0.2 },
];

export function pickWeightedDifficulty(): Difficulty {
  const r = Math.random();
  let acc = 0;
  for (const { difficulty, weight } of DIFFICULTY_WEIGHTS) {
    acc += weight;
    if (r <= acc) return difficulty;
  }
  return 'easy';
}

export function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export const BUG_HUNTER_QUESTION_COUNT = 15;
export const CODE_OUTPUT_QUESTION_COUNT = 15;
export const FIX_THE_CODE_QUESTION_COUNT = 10;

export const MEMORY_CARD_PAIRS: MemoryCardPair[] = [
  { id: 'html', left: 'HTML', right: 'Markup' },
  { id: 'css', left: 'CSS', right: 'Styling' },
  { id: 'laravel', left: 'Laravel', right: 'PHP' },
  { id: 'react', left: 'React', right: 'Frontend' },
  { id: 'express', left: 'Express', right: 'Node.js' },
  { id: 'tailwind', left: 'Tailwind', right: 'CSS Framework' },
  { id: 'typescript', left: 'TypeScript', right: 'Typed JS' },
  { id: 'postgres', left: 'PostgreSQL', right: 'Database' },
  { id: 'git', left: 'Git', right: 'Version Control' },
  { id: 'docker', left: 'Docker', right: 'Containers' },
];

export function calculateXp(opts: {
  correctAnswers: number;
  totalQuestions: number;
  difficulty: Difficulty | null;
  durationSeconds: number;
}): number {
  const { correctAnswers, totalQuestions, difficulty, durationSeconds } = opts;
  const difficultyMultiplier = difficulty === 'hard' ? 1.5 : difficulty === 'medium' ? 1.2 : 1;
  const base = correctAnswers * 10 * difficultyMultiplier;
  const accuracy = totalQuestions > 0 ? correctAnswers / totalQuestions : 0;
  const accuracyBonus = accuracy === 1 && totalQuestions > 0 ? 25 : 0;
  const avgSecondsPerQuestion = totalQuestions > 0 ? durationSeconds / totalQuestions : 0;
  const speedBonus = avgSecondsPerQuestion > 0 && avgSecondsPerQuestion < 8 ? 15 : 0;
  return Math.round(base + accuracyBonus + speedBonus);
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    key: 'junior-bug-hunter',
    game: 'bug-hunter',
    title: 'Junior Bug Hunter',
    description: 'Selesaikan sesi Bug Hunter dengan akurasi di atas 50%.',
    icon: 'bi-bug',
    condition: (r) => r.accuracy >= 50 && r.accuracy < 80,
  },
  {
    key: 'debug-master',
    game: 'bug-hunter',
    title: 'Debug Master',
    description: 'Capai akurasi 80% atau lebih di Bug Hunter.',
    icon: 'bi-award',
    condition: (r) => r.accuracy >= 80 && r.accuracy < 100,
  },
  {
    key: 'bug-slayer',
    game: 'bug-hunter',
    title: 'Bug Slayer',
    description: 'Selesaikan Bug Hunter dengan akurasi sempurna 100%.',
    icon: 'bi-trophy',
    condition: (r) => r.accuracy === 100,
  },
  {
    key: 'output-master',
    game: 'code-output',
    title: 'Output Master',
    description: 'Capai akurasi 80% atau lebih di Code Output Challenge.',
    icon: 'bi-cpu',
    condition: (r) => r.accuracy >= 80,
  },
  {
    key: 'code-surgeon',
    game: 'fix-the-code',
    title: 'Code Surgeon',
    description: 'Perbaiki mayoritas kode dengan benar di Fix The Code.',
    icon: 'bi-wrench-adjustable',
    condition: (r) => r.accuracy >= 70,
  },
  {
    key: 'memory-master',
    game: 'memory-card',
    title: 'Memory Master',
    description: 'Selesaikan Memory Card dengan langkah minimal.',
    icon: 'bi-lightning-charge',
    condition: (r) => r.accuracy >= 90,
  },
];

export function resolveAchievement(result: import('../../types/games').GameResult): Achievement | null {
  const candidates = ACHIEVEMENTS.filter((a) => a.game === result.game && a.condition(result));
  return candidates.length ? candidates[candidates.length - 1] : null;
}