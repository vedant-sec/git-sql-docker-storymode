export type ToolType = 'sql' | 'git' | 'docker';

export interface DialogueMessage {
  speaker: string;
  role: string;
  avatar?: string;
  text: string;
  timestamp?: string;
}

export interface Clue {
  id: string;
  title: string;
  description: string;
  category: string;
  discoveredAt?: string;
  details?: string;
}

export interface Hint {
  tier: 1 | 2 | 3;
  label: string; // e.g. "Narrative Nudge", "Technical Hint", "Direct Solution"
  content: string;
}

export interface PuzzleValidationResult {
  isCorrect: boolean;
  message?: string;
  feedback?: string;
  unlockedClue?: Clue;
}

export interface ConceptDefinition {
  title: string;
  description: string;
  example?: string;
  keyPoints?: string[];
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  description: string;
  objective: string;
  tool: ToolType;
  starterCode?: string;
  concept?: ConceptDefinition;
  hints: Hint[];
  clueReward?: Clue;
  // Custom validation logic passed to engine
  expectedCommandPattern?: RegExp;
  validate?: (context: any) => PuzzleValidationResult;
}

export interface ChapterDefinition {
  id: string;
  number: number;
  title: string;
  subtitle: string;
  tool: ToolType;
  storyIntro: DialogueMessage[];
  storyOutro: DialogueMessage[];
  puzzles: PuzzleDefinition[];
  initialFiles?: Record<string, string>; // Virtual filesystem for Git/Docker
}

export interface GameProgress {
  currentChapterId: string;
  currentPuzzleIndex: number;
  completedPuzzleIds: string[];
  collectedClues: Clue[];
  unlockedHintTiers: Record<string, number>; // puzzleId -> highest tier unlocked (1, 2, or 3)
}
