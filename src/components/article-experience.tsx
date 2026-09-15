import type { ReactNode } from 'react';
import { getLocale, getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/navigation';
import {
  articlePath,
  articleText,
  findArticle,
  seriesArticles,
  seriesText,
  type ArticleId,
} from '@/content/articles';
import { articleDetails } from '@/content/article-details';
import { EvidenceProvider } from './evidence-notes';
import { ReadingProgress } from './reading-progress';
import { SiteHeader } from './site-header';
import { ClientMessages } from './client-messages';
import ExperimentHost from './experiment-host';

export async function ArticleExperience({
  children,
  article,
}: {
  children: ReactNode;
  article: ArticleId;
}) {
  const locale = await getLocale();
  const t = await getTranslations('reading');
  const entry = findArticle(article)!;
  const text = articleText(article, locale);
  const collection = seriesArticles(entry.series);
  const index = collection.findIndex((item) => item.id === article);
  const previous = collection[index - 1],
    next = collection[index + 1];
  const { sections, notes, minutes, labs } = articleDetails(article, locale);
  const frame = (
    <div className="article-experience">
      <ReadingProgress />
      <SiteHeader locale={locale} />
      <header className="article-heading">
        <div className="article-meta">
          <Link href={`/articles/#${entry.series}`}>{seriesText(entry.series, locale).title}</Link>
          <span>{t('minutes', { count: minutes })}</span>
        </div>
        <h1 id="article-title">{text.title}</h1>
        <p>{text.subtitle}</p>
      </header>
      <div className="reading-layout">
        <aside className="article-contents" aria-label={t('contents')}>
          <details open>
            <summary>{t('contents')}</summary>
            <ol>
              {sections.map((section) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>{section.title}</a>
                </li>
              ))}
            </ol>
          </details>
        </aside>
        <main id="main-content" className="article-prose" lang={locale} data-pagefind-body>
          <span className="sr-only" data-pagefind-meta="title">
            {text.title}
          </span>
          <span className="sr-only" data-pagefind-filter="series">
            {seriesText(entry.series, locale).title}
          </span>
          {children}
          <details className="article-evidence" id="evidence" data-pagefind-ignore>
            <summary>{t('evidence')}</summary>
            <ol>
              {Object.entries(notes).map(([id, note]) => (
                <li key={id} id={`evidence-${id}`}>
                  <details>
                    <summary>
                      <span>{note.number}</span>
                      {note.title}
                    </summary>
                    <p>{note.text}</p>
                    <div className="address-list">
                      {note.addresses.map((address) => (
                        <code key={address}>{address}</code>
                      ))}
                    </div>
                  </details>
                </li>
              ))}
            </ol>
          </details>
        </main>
      </div>
      <nav className="chapter-pagination" aria-label={t('navigation')}>
        {previous && (
          <Link href={articlePath(previous.id)}>
            <span>{t('previous')}</span>
            <strong>← {articleText(previous.id, locale).title}</strong>
          </Link>
        )}
        {next && (
          <Link href={articlePath(next.id)} className="next-chapter-link">
            <span>{t('next')}</span>
            <strong>{articleText(next.id, locale).title} →</strong>
          </Link>
        )}
      </nav>
      <section className="related-articles">
        <h2>{t('related')}</h2>
        <div>
          {entry.related.map((id) => {
            const related = findArticle(id)!;
            return (
              <Link key={id} href={articlePath(id)}>
                <span>{seriesText(related.series, locale).title}</span>
                <strong>{articleText(related.id, locale).title} ↗</strong>
              </Link>
            );
          })}
        </div>
      </section>
      <footer className="site-footer">
        <p>{t('footer')}</p>
        <Link href="/introduction/#method">{t('method')} ↗</Link>
      </footer>
    </div>
  );
  return (
    <ClientMessages labs={labs} namespaces={entry.experiment === 'roster' ? ['roster'] : []}>
      <EvidenceProvider entries={notes}>
        {entry.experiment ? (
          <ExperimentHost kind={entry.experiment}>{frame}</ExperimentHost>
        ) : (
          frame
        )}
      </EvidenceProvider>
    </ClientMessages>
  );
}
