import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuestionPack } from '../../../hooks/useQuestionPack';
import { useGameStopwatch } from '../../../hooks/useGameTimer';
import { recordGameSession } from '../../../lib/games/api';
import { calculateXp, resolveAchievement, LANGUAGE_LABELS, DIFFICULTY_LABELS } from '../../../lib/games/constants';
import { GameCard, GameHeader, GameResultScreen } from '../shared/GameShell';
import { GameLoadingState, GameErrorState } from '../shared/GameStates';
import { XPBar, AchievementPopup } from '../shared/XPBar';
import type { FixTheCodePack, GameResult } from '../../../types/games';
import './FixTheCode.css';

/** Whitespace/quote-style-insensitive normalization so a technically
 *  correct fix isn't rejected for trivial formatting differences. This is
 *  a pure string comparison — the user's code is NEVER executed. */
function normalize(code: string): string {
  return code
    .replace(/\s+/g, ' ')
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .trim()
    .toLowerCase();
}

export default function FixTheCode() {
  const navigate = useNavigate();
  const { pack, loading, error, retry } = useQuestionPack<FixTheCodePack>('fix-the-code');
  const [index, setIndex] = useState(0);
  const [draft, setDraft] = useState('');
  const [verdict, setVerdict] = useState<'correct' | 'wrong' | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const { seconds: elapsed, reset } = useGameStopwatch(!loading && !finished);

  const question = pack?.questions[index];

  useMemo(() => {
    if (question) setDraft(question.brokenCode);
  }, [question]);

  const finish = useCallback(
    (finalCorrect: number) => {
      if (!pack) return;
      const total = pack.questions.length;
      const accuracy = total > 0 ? Math.round((finalCorrect / total) * 100) : 0;
      const xp = calculateXp({ correctAnswers: finalCorrect, totalQuestions: total, difficulty: pack.difficulty, durationSeconds: elapsed });
      const gameResult: GameResult = {
        game: 'fix-the-code',
        language: pack.language,
        difficulty: pack.difficulty,
        score: finalCorrect * 120,
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
    [pack, elapsed]
  );

  function handleSubmit() {
    if (!question || verdict !== null) return;
    const normalizedDraft = normalize(draft);
    const isCorrect = [question.expectedAnswer, ...question.acceptableAnswers].some((a) => normalize(a) === normalizedDraft);
    setVerdict(isCorrect ? 'correct' : 'wrong');
    const nextCorrect = correctCount + (isCorrect ? 1 : 0);
    setTimeout(() => {
      setCorrectCount(nextCorrect);
      setVerdict(null);
      if (!pack) return;
      if (index + 1 >= pack.questions.length) finish(nextCorrect);
      else setIndex((i) => i + 1);
    }, 900);
  }

  function playAgain() {
    setIndex(0);
    setDraft('');
    setVerdict(null);
    setCorrectCount(0);
    setFinished(false);
    setResult(null);
    reset();
    retry();
  }

  const progressLabel = pack ? `Soal ${index + 1}/${pack.questions.length}` : undefined;

  return (
    <GameCard>
      <GameHeader title="Fix The Code" icon="bi-tools" progressLabel={finished ? undefined : progressLabel} onExit={() => navigate('/games')} />

      {loading && <GameLoadingState label="Menyiapkan kode yang perlu diperbaiki..." />}
      {!loading && error && <GameErrorState message={error} onRetry={retry} />}

      {!loading && !error && pack && !finished && question && (
        <div className="game-mcq fix-code">
          <span className="eyebrow" style={{ marginBottom: 0 }}>
            {LANGUAGE_LABELS[question.language]} · {DIFFICULTY_LABELS[question.difficulty]}
          </span>
          {question.hint && <p className="fix-code__hint"><i className="bi bi-lightbulb" /> {question.hint}</p>}
          <textarea
            className={`fix-code__editor ${verdict === 'correct' ? 'is-correct' : ''} ${verdict === 'wrong' ? 'is-wrong' : ''}`}
            spellCheck={false}
            value={draft}
            disabled={verdict !== null}
            onChange={(e) => setDraft(e.target.value)}
          />
          <div className="fix-code__actions">
            {verdict && (
              <span className={`fix-code__verdict ${verdict}`}>
                <i className={`bi ${verdict === 'correct' ? 'bi-check-circle-fill' : 'bi-x-circle-fill'}`} />
                {verdict === 'correct' ? 'Benar!' : 'Belum tepat'}
              </span>
            )}
            <button className="btn btn--primary" onClick={handleSubmit} disabled={verdict !== null}>
              <i className="bi bi-send-check" /> Submit
            </button>
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

      {result?.achievementKey === 'code-surgeon' && (
        <AchievementPopup visible={showAchievement} onClose={() => setShowAchievement(false)} title="Code Surgeon" icon="bi-wrench-adjustable" />
      )}
    </GameCard>
  );
}