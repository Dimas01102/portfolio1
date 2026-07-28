import { useCallback, useEffect, useRef, useState } from 'react';
import { fetchQuestionPack } from '../lib/games/api';
import type { AiGameKey, BugHunterPack, CodeOutputPack, FixTheCodePack } from '../types/games';

type Pack = BugHunterPack | CodeOutputPack | FixTheCodePack;

export function useQuestionPack<T extends Pack>(game: AiGameKey) {
  const [pack, setPack] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = (await fetchQuestionPack(game)) as T;
      if (mountedRef.current) setPack(data);
    } catch (err) {
      if (mountedRef.current) setError(err instanceof Error ? err.message : 'Gagal memuat soal.');
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [game]);

  useEffect(() => {
    mountedRef.current = true;
    load();
    return () => {
      mountedRef.current = false;
    };
    
  }, []);

  return { pack, loading, error, retry: load };
}