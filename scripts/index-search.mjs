import { readFile, cp, rm } from 'node:fs/promises';
import { createIndex, close } from 'pagefind';

const check = (result) => {
  if (result.errors.length) throw new Error(result.errors.join('\n'));
  return result;
};
const { index } = check(await createIndex());
if (!index) throw new Error('Search index could not be created.');
try {
  const pages = check(await index.addDirectory({ path: 'out' }));
  let records = 0;
  for (const [kind, file, parameter] of [
    ['plants', 'plant-catalog', 'plant'],
    ['zombies', 'reference-catalog', 'zombie'],
  ]) {
    const catalog = JSON.parse(await readFile(`src/data/${file}.json`, 'utf8'));
    for (const locale of ['en', 'zh-CN']) {
      for (const record of catalog.types) {
        const fields = Object.entries(record.values)
          .filter(([, value]) => value !== null)
          .map(
            ([key, value]) =>
              `${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}`,
          );
        check(
          await index.addCustomRecord({
            url: `/${locale}/${kind}/?q=${encodeURIComponent(record.id)}&${parameter}=${encodeURIComponent(record.key)}`,
            content: [record.name.en, record.name['zh-CN'], record.id, ...fields].join(' '),
            language: locale.toLowerCase(),
            meta: { title: `${record.name[locale]} · ${record.id}` },
            filters: { collection: [kind] },
          }),
        );
        records++;
      }
    }
  }
  await rm('out/pagefind', { recursive: true, force: true });
  check(await index.writeFiles({ outputPath: 'out/pagefind' }));
  await rm('public/pagefind', { recursive: true, force: true });
  await cp('out/pagefind', 'public/pagefind', { recursive: true });
  console.log(
    `Search: ${pages.page_count} HTML files and ${records} plant/zombie records, in two languages.`,
  );
} finally {
  await close();
}
