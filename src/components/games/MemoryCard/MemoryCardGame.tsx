import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MEMORY_CARD_PAIRS, calculateXp, resolveAchievement } from '../../../lib/games/constants';
import { recordGameSession } from '../../../lib/games/api';
import { useGameStopwatch } from '../../../hooks/useGameTimer';
import { GameCard, GameHeader, GameResultScreen } from '../shared/GameShell';
import { XPBar, AchievementPopup } from '../shared/XPBar';
import type { GameResult } from '../../../types/games';
import './MemoryCard.css';

const PAIR_COUNT = 8;

interface CardModel {
  cardId: string;
  pairId: string;
  label: string;
}

function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function buildBoard(): CardModel[] {
  const pairs = shuffle(MEMORY_CARD_PAIRS).slice(0, PAIR_COUNT);
  const cards: CardModel[] = [];
  pairs.forEach((p) => {
    cards.push({ cardId: `${p.id}-l`, pairId: p.id, label: p.left });
    cards.push({ cardId: `${p.id}-r`, pairId: p.id, label: p.right });
  });
  return shuffle(cards);
}

export default function MemoryCardGame() {
  const navigate = useNavigate();
  const [board, setBoard] = useState<CardModel[]>(() => buildBoard());
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [steps, setSteps] = useState(0);
  const [finished, setFinished] = useState(false);
  const [result, setResult] = useState<GameResult | null>(null);
  const [showAchievement, setShowAchievement] = useState(false);
  const { seconds: elapsed, reset } = useGameStopwatch(!finished);

  const totalPairs = board.length / 2;

  useEffect(() => {
    if (flipped.length !== 2) return;
    const [a, b] = flipped;
    const cardA = board.find((c) => c.cardId === a)!;
    const cardB = board.find((c) => c.cardId === b)!;
    setSteps((s) => s + 1);

    if (cardA.pairId === cardB.pairId) {
      const nextMatched = new Set(matched).add(cardA.pairId);
      setTimeout(() => {
        setMatched(nextMatched);
        setFlipped([]);
        if (nextMatched.size === totalPairs) finishGame(nextMatched.size, steps + 1);
      }, 400);
    } else {
      setTimeout(() => setFlipped([]), 750);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flipped]);

  function finishGame(matchedPairs: number, finalSteps: number) {
    const accuracy = Math.round((matchedPairs / finalSteps) * 100);
    const xp = calculateXp({ correctAnswers: matchedPairs, totalQuestions: totalPairs, difficulty: 'medium', durationSeconds: elapsed });
    const gameResult: GameResult = {
      game: 'memory-card',
      language: null,
      difficulty: null,
      score: matchedPairs * 100 - finalSteps * 5,
      accuracy: Math.min(100, accuracy),
      durationSeconds: elapsed,
      xp,
      totalQuestions: totalPairs,
      correctAnswers: matchedPairs,
      achievementKey: null,
    };
    const achievement = resolveAchievement(gameResult);
    gameResult.achievementKey = achievement?.key ?? null;
    setResult(gameResult);
    setFinished(true);
    if (achievement) setShowAchievement(true);
    recordGameSession(gameResult);
  }

  function handleFlip(cardId: string) {
    if (flipped.length === 2) return;
    const card = board.find((c) => c.cardId === cardId)!;
    if (flipped.includes(cardId) || matched.has(card.pairId)) return;
    setFlipped((f) => [...f, cardId]);
  }

  function playAgain() {
    setBoard(buildBoard());
    setFlipped([]);
    setMatched(new Set());
    setSteps(0);
    setFinished(false);
    setResult(null);
    reset();
  }

  const progressLabel = useMemo(() => `${matched.size}/${totalPairs} pasang · ${steps} langkah`, [matched.size, totalPairs, steps]);

  return (
    <GameCard>
      <GameHeader title="Memory Card Programming" icon="bi-grid-3x3-gap" progressLabel={finished ? undefined : progressLabel} onExit={() => navigate('/games')} />

      {!finished && (
        <div className="memory-board">
          {board.map((card) => {
            const isFlipped = flipped.includes(card.cardId) || matched.has(card.pairId);
            const isMatched = matched.has(card.pairId);
            return (
              <button
                key={card.cardId}
                className={`memory-card ${isFlipped ? 'is-flipped' : ''} ${isMatched ? 'is-matched' : ''}`}
                onClick={() => handleFlip(card.cardId)}
                aria-label={isFlipped ? card.label : 'Kartu tertutup'}
              >
                <span className="memory-card__face memory-card__face--back">
                  <i className="bi bi-question-lg" />
                </span>
                <span className="memory-card__face memory-card__face--front">{card.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {finished && result && (
        <>
          <GameResultScreen
            score={Math.max(0, result.score)}
            accuracy={result.accuracy}
            durationSeconds={result.durationSeconds}
            xp={result.xp}
            extraStat={{ label: 'Langkah', value: steps }}
            onPlayAgain={playAgain}
          />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <XPBar xp={result.xp} />
          </div>
        </>
      )}

      {result?.achievementKey === 'memory-master' && (
        <AchievementPopup visible={showAchievement} onClose={() => setShowAchievement(false)} title="Memory Master" icon="bi-lightning-charge" />
      )}
    </GameCard>
  );
}