import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionPack } from '../../../hooks/useQuestionPack';
import { useGameStopwatch, useQuestionCountdown } from '../../../hooks/useGameTimer';
import { recordGameSession } from '../../../lib/games/api';
import { calculateXp, resolveAchievement, LANGUAGE_LABELS, DIFFICULTY_LABELS } from '../../../lib/games/constants';
import { GameCard, GameHeader, GameResultScreen } from './GameShell';
import { GameLoadingState, GameErrorState, CountdownBadge } from './GameStates';
import { XPBar, AchievementPopup } from './XPBar';
import type { AiGameKey, BugHunterPack, CodeOutputPack, GameResult } from '../../../types/games';

const SECONDS_PER_QUESTION = 30;

export function McqGameRunner({
  game,
  title,
  icon,
  loadingLabel,
  achievementIcons,
}: {
  game: Extract<AiGameKey, 'bug-hunter' | 'code-output'>;
  title: string;
  icon: string;
  loadingLabel: string;
  achievementIcons: Record<string, { title: string; icon: string }>;
}) {
  const navigate = useNavigate();
  const { pack, loading, error, retry } = useQuestionPack<BugHunterPack | CodeOutputPack>(game);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const { seconds: elapsed, reset } = useGameStopwatch(!loading && !finished);

  const question = pack?.questions[index];

  const finish = useCallback(
    (finalCorrect: number) => {
      if (!pack) return;
      const total = pack.questions.length;
      const accuracy = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
      const xp = calculateXp({
        correctAnswers: finalCorrect,
        totalQuestions: total,
        difficulty: pack.difficulty,
        durationSeconds: elapsed,
      });
      const gameResult: GameResult = {
        game,
        language: pack.language,
        difficulty: pack.difficulty,
        score: finalCorrect * 100,
        accuracy,
        durationSeconds: elapsed,
        xp,
        totalQuestions: total,
        correctAnswers: finalCorrect,
        achievementKey: null,
      };
      const achievement = resolveAchievement(gameResult);
      gameResult.achievementKey = achievement?.key ?? null;
      setResult(gameResult);
      setFinished(true);
      if (achievement) setShowAchievement(true);
      recordGameSession(gameResult);
    },
    [pack, elapsed, game]
  );

  const goNext = useCallback(
    (wasCorrect: boolean) => {
      if (!pack) return;
      const nextCorrect = correctCount + (wasCorrect ? 1 : 0);
      setCorrectCount(nextCorrect);
      setSelected(null);
      if (index + 1 >= pack.questions.length) {
        finish(nextCorrect);
      } else {
        setIndex((i) => i + 1);
      }
    },
    [pack, index, correctCount, finish]
  );

  const remaining = useQuestionCountdown(
    SECONDS_PER_QUESTION,
    question?.id ?? index,
    () => {
      if (selected === null) goNext(false);
    },
    !loading && !finished && selected === null
  );

  function handleAnswer(optIndex: number) {
    if (selected !== null || !question) return;
    setSelected(optIndex);
    const wasCorrect = optIndex === question.correctIndex;
    setTimeout(() => goNext(wasCorrect), 550);
  }

  function playAgain() {
    setIndex(0);
    setSelected(null);
    setCorrectCount(0);
    setFinished(false);
    setResult(null);
    reset();
    retry();
  }

  const progressLabel = useMemo(
    () => (pack ? `Soal ${index + 1}/${pack.questions.length}` : undefined),
    [pack, index]
  );

  const badge = result?.achievementKey ? achievementIcons[result.achievementKey] : undefined;

  return (
    <GameCard>
      <GameHeader title={title} icon={icon} progressLabel={finished ? undefined : progressLabel} onExit={() => navigate('/games')} />

      {loading && <GameLoadingState label={loadingLabel} />}
      {!loading && error && <GameErrorState message={error} onRetry={retry} />}

      {!loading && !error && pack && !finished && question && (
        <div className="game-mcq">
          <div className="game-state__row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <span className="eyebrow" style={{ marginBottom: 0 }}>
              {LANGUAGE_LABELS[question.language]} · {DIFFICULTY_LABELS[question.difficulty]}
            </span>
            <CountdownBadge seconds={remaining} danger={remaining <= 8} />
          </div>
          <p className="game-mcq__prompt">{question.prompt}</p>
          {question.code && <pre className="game-mcq__code">{question.code}</pre>}
          <div className="game-mcq__options">
            {question.options.map((opt, i) => {
              const isCorrectOpt = selected !== null && i === question.correctIndex;
              const isWrongSelected = selected === i && i !== question.correctIndex;
              return (
                <button
                  key={i}
                  className={`game-mcq__option ${isCorrectOpt ? 'is-correct' : ''} ${isWrongSelected ? 'is-wrong' : ''}`}
                  disabled={selected !== null}
                  onClick={() => handleAnswer(i)}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {finished && result && (
        <>
          <GameResultScreen
            score={result.score}
            accuracy={result.accuracy}
            durationSeconds={result.durationSeconds}
            xp={result.xp}
            onPlayAgain={playAgain}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <XPBar xp={result.xp} />
          </div>
        </>
      )}

      {badge && (
        <AchievementPopup visible={showAchievement} onClose={() => setShowAchievement(false)} title={badge.title} icon={badge.icon} />
      )}
    </GameCard>
  );
}