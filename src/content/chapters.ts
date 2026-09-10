export const chapters = [
  { id: 'wave-plan', number: 1, file: '01-before-the-first-zombie', published: true, experiment: 'waves' },
  { id: 'roster', number: 2, file: '02-choosing-the-roster', published: true, experiment: 'roster' },
  { id: 'worlds', number: 3, file: '03-world-modifiers', published: true, experiment: null },
  { id: 'strength', number: 4, file: '04-zombie-strength', published: true, experiment: null },
  { id: 'placement', number: 5, file: '05-zombie-placement', published: true, experiment: null },
  { id: 'timing', number: 6, file: '06-timing-and-completion', published: true, experiment: null },
  { id: 'drops', number: 7, file: '07-plant-food-and-loot', published: true, experiment: null },
] as const;

export type ChapterId = typeof chapters[number]['id'];
export function findChapter(id: string) { return chapters.find((chapter) => chapter.id === id); }
export function chapterPath(id: ChapterId) { return `/${id}/`; }
