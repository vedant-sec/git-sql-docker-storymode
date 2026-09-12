import { useState, useEffect, useCallback } from 'react';
import { Clue, GameProgress } from '../types/game';
import { ALL_CHAPTERS } from '../data/chapters';

const STORAGE_KEY = 'root_access_progress_v1';

const DEFAULT_PROGRESS: GameProgress = {
  currentChapterId: 'ch1',
  currentPuzzleIndex: 0,
  completedPuzzleIds: [],
  collectedClues: [],
  unlockedHintTiers: {}
};

export function useGameStore() {
  const [progress, setProgress] = useState<GameProgress>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved progress:', e);
    }
    return DEFAULT_PROGRESS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to save progress:', e);
    }
  }, [progress]);

  const currentChapter = ALL_CHAPTERS.find(ch => ch.id === progress.currentChapterId) || ALL_CHAPTERS[0];
  const currentPuzzle = currentChapter.puzzles[progress.currentPuzzleIndex] || currentChapter.puzzles[0];

  const setChapter = useCallback((chapterId: string) => {
    setProgress(prev => ({
      ...prev,
      currentChapterId: chapterId,
      currentPuzzleIndex: 0
    }));
  }, []);

  const setPuzzleIndex = useCallback((index: number) => {
    setProgress(prev => ({
      ...prev,
      currentPuzzleIndex: index
    }));
  }, []);

  const markPuzzleCompleted = useCallback((puzzleId: string, clue?: Clue) => {
    setProgress(prev => {
      const completed = prev.completedPuzzleIds.includes(puzzleId)
        ? prev.completedPuzzleIds
        : [...prev.completedPuzzleIds, puzzleId];

      const clues = clue && !prev.collectedClues.some(c => c.id === clue.id)
        ? [...prev.collectedClues, { ...clue, discoveredAt: new Date().toLocaleTimeString() }]
        : prev.collectedClues;

      return {
        ...prev,
        completedPuzzleIds: completed,
        collectedClues: clues
      };
    });
  }, []);

  const unlockNextHint = useCallback((puzzleId: string) => {
    setProgress(prev => {
      const currentTier = prev.unlockedHintTiers[puzzleId] || 0;
      if (currentTier >= 3) return prev;
      return {
        ...prev,
        unlockedHintTiers: {
          ...prev.unlockedHintTiers,
          [puzzleId]: currentTier + 1
        }
      };
    });
  }, []);

  const resetProgress = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setProgress(DEFAULT_PROGRESS);
  }, []);

  return {
    progress,
    currentChapter,
    currentPuzzle,
    setChapter,
    setPuzzleIndex,
    markPuzzleCompleted,
    unlockNextHint,
    resetProgress
  };
}
