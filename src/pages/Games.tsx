import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import GamesHub from '../components/games/GamesHub';
import { GameLoadingState } from '../components/games/shared/GameStates';

// Every game is its own chunk: none of this ships in the initial bundle,
// and none of them load until the visitor actually opens that specific
// game (not even when they land on /games).
const BugHunter = lazy(() => import('../components/games/BugHunter/BugHunter'));
const MemoryCardGame = lazy(() => import('../components/games/MemoryCard/MemoryCardGame'));
const CodeOutputChallenge = lazy(() => import('../components/games/CodeOutputChallenge/CodeOutputChallenge'));
const FixTheCode = lazy(() => import('../components/games/FixTheCode/FixTheCode'));

function GameSuspense({ children }: { children: React.ReactNode }) {
  return (
    <div className="container" style={{ paddingTop: 140, paddingBottom: 90 }}>
      <Suspense fallback={<div className="game-card card" style={{ maxWidth: 720, margin: '0 auto', padding: 28 }}><GameLoadingState /></div>}>
        {children}
      </Suspense>
    </div>
  );
}

export default function Games() {
  return (
    <Routes>
      <Route index element={<GamesHub />} />
      <Route
        path="bug-hunter"
        element={
          <GameSuspense>
            <BugHunter />
          </GameSuspense>
        }
      />
      <Route
        path="memory-card"
        element={
          <GameSuspense>
            <MemoryCardGame />
          </GameSuspense>
        }
      />
      <Route
        path="code-output"
        element={
          <GameSuspense>
            <CodeOutputChallenge />
          </GameSuspense>
        }
      />
      <Route
        path="fix-the-code"
        element={
          <GameSuspense>
            <FixTheCode />
          </GameSuspense>
        }
      />
    </Routes>
  );
}