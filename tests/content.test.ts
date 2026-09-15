import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { articles, referencePaths, findArticle } from '../src/content/articles';
import { equipmentRecord } from '../src/lib/equipment-catalog';
import { evidence } from '../src/content/evidence';
import en from '../src/messages/en.json';
import zh from '../src/messages/zh-CN.json';

const read = (locale: string, file: string) =>
  readFileSync(new URL(`../src/content/${locale}/${file}.mdx`, import.meta.url), 'utf8');
const matches = (source: string, pattern: RegExp) =>
  [...source.matchAll(pattern)].map((match) => match[1]);

test('published translations preserve equations, identifiers, numbers, and evidence', () => {
  for (const chapter of articles) {
    const a = read('en', chapter.file),
      b = read('zh-CN', chapter.file);
    for (const [label, pattern] of [
      ['display formulas', /\$\$([\s\S]*?)\$\$/g],
      ['evidence', /<Note id="([^"]+)"/g],
      ['sections', /<section id="([^"]+)"/g],
    ] as const) {
      const extract = (source: string) => [...source.matchAll(pattern)].map((m) => m[1] ?? m[2]);
      assert.deepEqual(extract(a), extract(b), `${chapter.id}: ${label}`);
    }
    const inlineMath = (source: string) =>
      source
        .replace(/\$\$[\s\S]*?\$\$/g, '')
        .split(/\n\n+/)
        .map((block) => matches(block, /\$([^$\n]+)\$/g).sort())
        .filter((tokens) => tokens.length);
    assert.deepEqual(inlineMath(a), inlineMath(b), `${chapter.id}: inline formulas per block`);
    const identifiers = (source: string) =>
      source
        .split(/\n\n+/)
        .map((block) => matches(block, /`([^`]+)`/g).sort())
        .filter((tokens) => tokens.length);
    assert.deepEqual(identifiers(a), identifiers(b), `${chapter.id}: identifiers per block`);
    const numbers = (source: string) =>
      source
        .split(/\n\n+/)
        .map((block) => (block.match(/\d+(?:\.\d+)*/g) ?? []).sort())
        .filter((tokens) => tokens.length);
    assert.deepEqual(numbers(a), numbers(b), `${chapter.id}: numeric tokens per block`);
    for (const id of matches(a, /<Note id="([^"]+)"/g))
      assert.ok(id in evidence, `${chapter.id}: ${id}`);
  }
});

test('article cross-links resolve to published routes and existing sections', () => {
  const published = articles;
  for (const locale of ['en', 'zh-CN']) {
    const routes = Object.fromEntries(
      published.map((chapter) => [chapter.id, read(locale, chapter.file)]),
    );
    for (const [chapter, source] of Object.entries(routes)) {
      for (const href of matches(source, /href="([^"]+)"/g)) {
        const url = new URL(href, 'https://example.invalid');
        const route = url.pathname.split('/').filter(Boolean)[0],
          anchor = url.hash.slice(1);
        assert.ok(
          referencePaths.includes(route as (typeof referencePaths)[number]) ||
            route in routes ||
            route === 'introduction',
          `${chapter}: missing route ${href}`,
        );
        const item = url.pathname.split('/').filter(Boolean)[1];
        if (item && (route === 'artifacts' || route === 'accessories'))
          assert.ok(equipmentRecord(route, item), `${chapter}: missing equipment ${href}`);
        if (anchor)
          assert.ok(
            (route === 'introduction'
              ? read(locale, 'introduction')
              : (routes[route] ?? '')
            ).includes(`id="${anchor}"`),
            `${chapter}: missing section ${href}`,
          );
      }
    }
  }
});

test('evidence translations retain numeric details', () => {
  for (const [id, note] of Object.entries(evidence)) {
    const numbers = (text: string) => (text.match(/\d+(?:\.\d+)*/g) ?? []).sort();
    assert.deepEqual(numbers(note.en.text), numbers(note['zh-CN'].text), id);
  }
});

test('interface translations have matching message paths and named arguments', () => {
  const flatten = (value: unknown, prefix = ''): Record<string, string> => {
    if (typeof value === 'string') return { [prefix]: value };
    return Object.assign(
      {},
      ...Object.entries(value as Record<string, unknown>).map(([key, child]) =>
        flatten(child, prefix ? `${prefix}.${key}` : key),
      ),
    );
  };
  const a = flatten(en),
    b = flatten(zh);
  assert.deepEqual(Object.keys(a).sort(), Object.keys(b).sort());
  const argumentsIn = (text: string) =>
    [
      ...new Set([...text.matchAll(/\{([a-zA-Z][a-zA-Z0-9_]*)(?:[,}])/g)].map((match) => match[1])),
    ].sort();
  for (const [key, text] of Object.entries(a))
    assert.deepEqual(argumentsIn(text), argumentsIn(b[key]), key);
});

test('article series and related links resolve without duplicate routes', () => {
  assert.equal(new Set(articles.map((entry) => entry.id)).size, articles.length);
  for (const article of articles)
    for (const id of article.related) assert.ok(findArticle(id), `${article.id}: ${id}`);
});
