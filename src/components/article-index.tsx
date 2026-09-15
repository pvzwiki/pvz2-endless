import type { Locale } from '@/i18n/locales';
import { Link } from '@/i18n/navigation';
import { articlePath, articleText, series, seriesArticles, seriesText } from '@/content/articles';

export function ArticleIndex({ locale }: { locale: Locale }) {
  return (
    <div className="series-index">
      {series.map((id) => {
        const collection = seriesText(id, locale);
        return (
          <section key={id} id={id} className="series-section">
            <header>
              <span className="eyebrow">{String(seriesArticles(id).length).padStart(2, '0')}</span>
              <h2>{collection.title}</h2>
              <p>{collection.description}</p>
            </header>
            <ol>
              {seriesArticles(id).map((article) => {
                const text = articleText(article.id, locale);
                return (
                  <li key={article.id}>
                    <Link href={articlePath(article.id)}>
                      <span className="article-order">
                        {String(article.order).padStart(2, '0')}
                      </span>
                      <div>
                        <h3>{text.title}</h3>
                        <p>{text.subtitle}</p>
                      </div>
                      <span aria-hidden="true">↗</span>
                    </Link>
                  </li>
                );
              })}
            </ol>
          </section>
        );
      })}
    </div>
  );
}
