import { format, resolveConfig } from 'prettier';
import { writeFileSync, readFileSync } from 'node:fs';
import { articles } from '../src/content/articles';
import { locales } from '../src/i18n/locales';
const loaders = locales
  .map(
    (locale) =>
      `  '${locale}': {\n${articles
        .map((article) => {
          readFileSync(`src/content/${locale}/${article.file}.mdx`);
          return `    '${article.id}': () => import('./${locale}/${article.file}.mdx'),`;
        })
        .join('\n')}\n  },`,
  )
  .join('\n');
const generated = `// Generated from articles.ts by scripts/prepare-content.ts.\nimport type {ComponentType} from 'react';\nimport type {Locale} from '@/i18n/locales';\nimport type {ArticleId} from './articles';\nconst loaders: Record<Locale,Record<ArticleId,()=>Promise<{default:ComponentType}>>> = {\n${loaders}\n};\nexport async function loadArticle(locale:Locale,article:ArticleId){return (await loaders[locale][article]()).default;}\n`;
writeFileSync(
  'src/content/load-article.ts',
  await format(generated, {
    parser: 'typescript',
    ...(await resolveConfig('src/content/load-article.ts')),
  }),
);
console.log(`Prepared ${articles.length} articles in ${locales.length} languages.`);
