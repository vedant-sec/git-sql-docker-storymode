import { Hint, PuzzleDefinition } from '../types/game';

/**
 * Interface for optional future AI-powered hints.
 * When integrating with an LLM or Antigravity backend, implement this interface.
 */
export interface AIHintProvider {
  isAvailable(): boolean;
  generateDynamicHint(params: {
    puzzle: PuzzleDefinition;
    playerInput: string;
    lastError?: string;
    unlockedTier: number;
  }): Promise<string>;
}

/**
 * Default offline/scripted hint provider.
 */
export class ScriptedHintService {
  private aiProvider: AIHintProvider | null = null;

  registerAIProvider(provider: AIHintProvider): void {
    this.aiProvider = provider;
  }

  getHintForTier(puzzle: PuzzleDefinition, tier: 1 | 2 | 3): Hint | undefined {
    return puzzle.hints.find(h => h.tier === tier);
  }

  getAllUnlockedHints(puzzle: PuzzleDefinition, maxTier: number): Hint[] {
    return puzzle.hints.filter(h => h.tier <= maxTier);
  }

  async getDynamicHintIfAvailable(
    puzzle: PuzzleDefinition,
    playerInput: string,
    lastError?: string,
    unlockedTier = 1
  ): Promise<string | null> {
    if (this.aiProvider && this.aiProvider.isAvailable()) {
      try {
        return await this.aiProvider.generateDynamicHint({
          puzzle,
          playerInput,
          lastError,
          unlockedTier
        });
      } catch (err) {
        console.warn('AI Hint provider failed, falling back to scripted hints:', err);
      }
    }
    return null;
  }
}

export const hintService = new ScriptedHintService();
