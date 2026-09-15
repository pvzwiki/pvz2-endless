import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { isLocale } from '@/i18n/locales';
import { Link } from '@/i18n/navigation';
import { articleText, findArticle } from '@/content/articles';
import {
  boostType,
  cultivation,
  equipmentRecord,
  equipmentArticles,
  type EquipmentKind,
  type Boost,
} from '@/lib/equipment-catalog';
import { SiteHeader } from './site-header';

export async function EquipmentRecordPage({
  locale,
  kind,
  id,
}: {
  locale: string;
  kind: EquipmentKind;
  id: string;
}) {
  if (!isLocale(locale)) notFound();
  setRequestLocale(locale);
  const row = equipmentRecord(kind, id);
  if (!row) notFound();
  const t = await getTranslations('equipment');
  const v = row.values;
  const shown = (value: unknown) =>
    value === null || value === undefined
      ? t('omitted')
      : typeof value === 'string' || typeof value === 'number'
        ? String(value)
        : JSON.stringify(value);
  const list = (value: unknown) => (Array.isArray(value) ? (value as string[]) : []);
  const boosts = (value: unknown) => (Array.isArray(value) ? (value as Boost[]) : []);
  const tiers = Array.isArray(v.SuperBoostList) ? (v.SuperBoostList as Boost[][]) : null;
  const restrictions = v.TargetablePlantTypes as { ListType: string; List: string[] } | null;
  return (
    <>
      <SiteHeader locale={locale} />
      <main id="main-content" className="equipment-record-page" data-pagefind-body>
        <Link href={`/${kind}/`} className="text-link">
          ← {t(kind)}
        </Link>
        <header className="directory-heading">
          <span className="eyebrow" data-pagefind-filter="collection">
            {t(kind)}
          </span>
          <h1 data-pagefind-meta="title">{row.name[locale]}</h1>
          <code>{row.id}</code>
        </header>
        <div className="equipment-record-body">
          {kind === 'artifacts' ? (
            <section>
              <h2>{t('formulaHeading')}</h2>
              <p>{t('formulaExplanation')}</p>
              <table>
                <thead>
                  <tr>
                    <th>{t('field')}</th>
                    <th>{t('formula')}</th>
                  </tr>
                </thead>
                <tbody>
                  {['MainField', 'PassiveField1', 'PassiveField2', 'PassiveField3'].flatMap(
                    (field) =>
                      v[field] === null
                        ? [
                            <tr key={field}>
                              <th>{field}</th>
                              <td>{t('omitted')}</td>
                            </tr>,
                          ]
                        : list(v[field]).map((formula, index) => (
                            <tr key={`${field}-${index}`}>
                              <th>
                                <code>
                                  {field}[{index}]
                                </code>
                              </th>
                              <td>
                                <code>{formula || t('empty')}</code>
                              </td>
                            </tr>
                          )),
                  )}
                </tbody>
              </table>
            </section>
          ) : (
            <>
              <dl className="equipment-facts">
                {[
                  ['quality', 'Quality'],
                  ['maxLevel', 'MaxLevel'],
                  ['minPlantLevel', 'MinEnabledLevel'],
                  ['pieces', 'RequiredPieces'],
                ].map(([label, key]) => (
                  <div key={key}>
                    <dt>{t(label as 'quality')}</dt>
                    <dd>{shown(v[key])}</dd>
                  </div>
                ))}
              </dl>
              <section>
                <h2>{t('effects')}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>{t('level')}</th>
                      <th>{t('boost')}</th>
                      <th>{t('values')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(tiers ?? [boosts(v.Boosts)]).flatMap((tier, level) =>
                      tier.map((boost, index) => (
                        <tr key={`${level}-${index}`}>
                          <th>{tiers ? level : t('base')}</th>
                          <td>
                            <code>{boostType(boost)}</code>
                          </td>
                          <td>{boost.Values.join(', ')}</td>
                        </tr>
                      )),
                    )}
                  </tbody>
                </table>
              </section>
            </>
          )}
          {Boolean(restrictions || v.DisabledPlants || v.plantBlackList) && (
            <section>
              <h2>{t('restrictions')}</h2>
              {kind === 'artifacts' && <p>{t('restrictionExplanation')}</p>}
              {[
                ['disabled', v.DisabledPlants],
                ['targetable', restrictions?.List],
                ['blacklist', v.plantBlackList],
              ].map(
                ([label, value]) =>
                  value !== null &&
                  value !== undefined && (
                    <details className="record-list" key={String(label)}>
                      <summary>
                        {t(label as 'disabled')} · {list(value).length}
                        {label === 'targetable' && ` · ${restrictions?.ListType}`}
                      </summary>
                      <ul>
                        {list(value).map((name, index) => (
                          <li key={`${name}-${index}`}>
                            <Link href={`/plants/?q=${encodeURIComponent(name)}`}>{name}</Link>
                          </li>
                        ))}
                      </ul>
                    </details>
                  ),
              )}
            </section>
          )}
          {kind === 'artifacts' ? (
            <section>
              <h2>{t('upgrade')}</h2>
              <h3>{t('rankUp')}</h3>
              <table>
                <thead>
                  <tr>
                    <th>{t('rank')}</th>
                    <th>{t('requiredLevel')}</th>
                    <th>{t('materials')}</th>
                    <th>{t('gold')}</th>
                  </tr>
                </thead>
                <tbody>
                  {cultivation.RankUpPrice.map((price) => (
                    <tr key={price.CurrentRank}>
                      <th>
                        {price.CurrentRank} → {price.CurrentRank + 1}
                      </th>
                      <td>{price.NeedLevel}</td>
                      <td>
                        {price.MaterialPrice} <code>{price.MaterialName}</code>
                      </td>
                      <td>{price.GoldNum.toLocaleString(locale)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <details className="record-list">
                <summary>{t('levelUp')}</summary>
                <table>
                  <thead>
                    <tr>
                      <th>{t('level')}</th>
                      <th>{t('rank')}</th>
                      <th>{t('materials')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cultivation.LevelUpPrice.map((price) => (
                      <tr key={price.CurrentLevel}>
                        <th>
                          {price.CurrentLevel} → {price.CurrentLevel + 1}
                        </th>
                        <td>{price.NeedRank}</td>
                        <td>
                          {price.MaterialPrice} <code>{price.MaterialName}</code>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </details>
            </section>
          ) : (
            Array.isArray(v.SteadyList) && (
              <section>
                <h2>{t('upgrade')}</h2>
                <table>
                  <thead>
                    <tr>
                      <th>{t('level')}</th>
                      <th>{t('materials')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      v.SteadyList as {
                        CurrentLevel: number;
                        Require: { Id: number; Num: number }[];
                      }[]
                    ).map((price) => (
                      <tr key={price.CurrentLevel}>
                        <th>
                          {price.CurrentLevel} → {price.CurrentLevel + 1}
                        </th>
                        <td>
                          {price.Require.map((material) => (
                            <span className="material" key={material.Id}>
                              {material.Num} × <code>{material.Id}</code>
                            </span>
                          ))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )
          )}
          <section>
            <h2>{t('related')}</h2>
            <ul>
              {equipmentArticles(id).map((slug) => {
                const article = findArticle(slug)!;
                return (
                  <li key={slug}>
                    <Link href={`/${slug}/`}>{articleText(article.id, locale).title} ↗</Link>
                  </li>
                );
              })}
            </ul>
          </section>
        </div>
      </main>
    </>
  );
}
