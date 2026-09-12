import { ChapterDefinition } from '../../types/game';
import { chapter1Sql } from './chapter1_sql';
import { chapter2Git } from './chapter2_git';
import { chapter3Docker } from './chapter3_docker';

export const ALL_CHAPTERS: ChapterDefinition[] = [
  chapter1Sql,
  chapter2Git,
  chapter3Docker
];

export function getChapterById(id: string): ChapterDefinition | undefined {
  return ALL_CHAPTERS.find(ch => ch.id === id);
}
