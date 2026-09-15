import { readFileSync } from 'node:fs';
import path from 'node:path';
import { findArticle, type ArticleId } from './articles';
import { evidence, type EvidenceId } from './evidence';
import type { ArticleEvidence } from './evidence-types';
import type { Locale } from '@/i18n/locales';

export function articleDetails(id: ArticleId, locale: Locale) {
  const entry = findArticle(id)!;
  const source = readFileSync(
    path.join(process.cwd(), 'src/content', locale, `${entry.file}.mdx`),
    'utf8',
  );
  const sections = [
    ...source.matchAll(/<section id="([^"]+)"[^>]*>\s*(?:<span[^>]*>.*?<\/span>\s*)?## ([^\n]+)/g),
  ].map((match) => ({ id: match[1], title: match[2].replace(/[`*]/g, '') }));
  const ids = [...new Set([...source.matchAll(/<Note id="([^"]+)"/g)].map((match) => match[1]))];
  const notes: ArticleEvidence = Object.fromEntries(
    ids.map((key, index) => {
      const note = evidence[key as EvidenceId];
      if (!note) throw new Error(`Missing evidence ${key} in ${id}`);
      return [
        key,
        { ...note[locale], number: String(index + 1).padStart(2, '0'), addresses: note.addresses },
      ];
    }),
  );
  const labs = [
    ...new Set([...source.matchAll(/<MechanismLab kind="([^"]+)"/g)].map((match) => match[1])),
  ];
  const plain = source.replace(/import[^\n]+/g, '').replace(/<[^>]*>/g, '');
  const words = [...new Intl.Segmenter(locale, { granularity: 'word' }).segment(plain)].filter(
    (part) => part.isWordLike,
  ).length;
  return {
    sections,
    notes,
    labs,
    minutes: Math.max(1, Math.ceil(words / (locale === 'en' ? 220 : 260))),
  };
}
