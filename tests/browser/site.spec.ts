import { test, expect } from '@playwright/test';
import { chapters } from '../../src/content/chapters';
import en from '../../src/messages/en.json' with { type: 'json' };
import zh from '../../src/messages/zh-CN.json' with { type: 'json' };

test('every chapter renders in both languages with working evidence and one methods link', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const locale of ['en', 'zh-CN'] as const) {
    for (const chapter of chapters.filter((entry) => entry.published)) {
      await page.goto(`/${locale}/${chapter.id}/`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText((locale === 'en' ? en : zh).chapters[chapter.id].title);
      await expect(page.locator('a[href*="/introduction/"]')).toHaveCount(1);
      expect(await page.locator('main h2').count()).toBeGreaterThanOrEqual(4);
      await page.locator('.note-ref').first().click();
      await expect(page.locator('.evidence-dialog')).toBeVisible();
      await expect(page.locator('.evidence-dialog .address-list')).toContainText('0x');
      await page.keyboard.press('Escape');
      await expect(page.locator('.evidence-dialog')).not.toBeVisible();
      if (!chapter.experiment) expect(new URL(page.url()).search).toBe('');
    }
  }
  expect(errors).toEqual([]);
});

test('article languages and formulas are present before JavaScript runs', async ({ request }) => {
  for (const locale of ['en', 'zh-CN']) {
    const response = await request.get(`/${locale}/wave-plan/`);
    expect(response.ok()).toBeTruthy();
    const html = await response.text();
    expect(html.includes(`<html lang="${locale}"`)).toBeTruthy();
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain('hrefLang="zh-CN"');
    expect(html).toContain('katex-mathml');
  }
});

test('the homepage owns the catalog and the introduction starts the reading sequence', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('InsideEndless.');
  await expect(page.locator('.home-chapters ol > li')).toHaveCount(7);
  await page.getByRole('link', { name: 'Start with the introduction' }).click();
  await expect(page).toHaveURL(/\/en\/introduction\//);
  await page.getByRole('link', { name: 'Read Chapter 01' }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Before the first zombie');
  await expect(page.locator('a[href*="/introduction/"]')).toHaveCount(1);
  await expect(page.locator('.home-chapters')).toHaveCount(0);
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(nav.getByRole('link')).toHaveText(['Chapters', 'Reference']);
  await page.locator('.wordmark').click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test('optional views calculate correctly and return focus to the article', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/en/wave-plan/');
  await expect(page.locator('.wave-viewer')).not.toBeVisible();
  const launch = page.getByRole('button', { name: /Interactive view Inspect/ });
  await launch.scrollIntoViewIfNeeded();
  const scroll = await page.evaluate(() => window.scrollY);
  await launch.click();
  const viewer = page.getByRole('dialog', { name: 'The shape of a level' });
  await expect(viewer).toBeVisible();
  await expect(page.getByTestId('selected-budget')).toHaveText('2,350');
  await viewer.getByRole('button', { name: 'Level 149', exact: true }).click();
  await expect(page.getByTestId('wave-count')).toHaveText('15');
  await viewer.getByRole('button', { name: 'Wave 10', exact: true }).click();
  await expect(page.getByTestId('selected-budget')).toHaveText('17,687');
  await viewer.getByRole('button', { name: 'Base budgets', exact: true }).click();
  await expect(page.getByTestId('selected-budget')).toHaveText('7,075');
  await viewer.getByRole('button', { name: 'With boosts', exact: true }).click();
  await viewer.getByRole('button', { name: 'Wave 15', exact: true }).click();
  await expect(page.getByTestId('selected-budget')).toHaveText('27,375');
  await expect(viewer.getByText('Both conditions, one ×2.5 boost.')).toBeVisible();
  await viewer.getByRole('button', { name: 'Diagram', exact: true }).click();
  await viewer.getByRole('button', { name: 'Wave 1: 100 points', exact: true }).focus();
  await page.keyboard.press('Enter');
  await expect(page.getByTestId('selected-budget')).toHaveText('100');
  await page.keyboard.press('Escape');
  await expect(viewer).not.toBeVisible();
  expect(Math.abs(await page.evaluate(() => window.scrollY) - scroll)).toBeLessThan(5);
  await expect(launch).toBeFocused();
  expect(errors).toEqual([]);
});

test('the matrix compares all 120 levels and opens the exact selected wave', async ({ page }) => {
  await page.goto('/en/wave-plan/');
  await page.getByRole('button', { name: /All ordinary levels A complete table/ }).click();
  const viewer = page.getByRole('dialog', { name: 'The shape of a level' });
  await expect(viewer.locator('.wave-matrix > tbody > tr')).toHaveCount(120);
  await expect(viewer.locator('.wave-matrix > thead th')).toHaveCount(16);
  await viewer.getByRole('searchbox', { name: 'Find a level' }).fill('1, 36, 149');
  await expect(viewer.locator('.wave-matrix > tbody > tr')).toHaveCount(3);
  await viewer.getByRole('button', { name: 'Level 149, wave 15, 27,375 points, Final wave', exact: true }).click();
  await expect(page.getByTestId('current-level')).toHaveText('149');
  await expect(page.getByTestId('selected-budget')).toHaveText('27,375');
  await viewer.getByRole('button', { name: 'Wave 15', exact: true }).getAttribute('aria-pressed').then((value) => expect(value).toBe('true'));
  await viewer.getByRole('button', { name: 'Close view', exact: true }).click();
  await expect(viewer).not.toBeVisible();
});

test('language switching preserves the selected numerical example', async ({ page }) => {
  await page.goto('/en/wave-plan/?level=149&wave=10&boost=0');
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await expect(page).toHaveURL(/\/zh-CN\/wave-plan\//);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('第一只僵尸出现之前');
  await page.locator('.view-launcher').first().click();
  await expect(page.getByTestId('current-level')).toHaveText('149');
  await expect(page.getByTestId('selected-budget')).toHaveText('7,075');
  await page.keyboard.press('Escape');
  await page.getByRole('button', { name: '打开证据注释 01', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '共享输入' })).toContainText('0x101ab6840');
  await page.keyboard.press('Escape');
  await page.goto('/');
  await expect(page).toHaveURL(/\/zh-CN\/$/);
});

test('roster controls spend the budget and preserve the example across languages', async ({ page }) => {
  await page.goto('/en/roster/?level=51&seed=7&budget=2350');
  await page.getByRole('button', { name: /Inside a weighted draw/ }).click();
  const viewer = page.getByRole('dialog', { name: 'From a pool to a wave' });
  await expect(viewer.locator('.selection-token')).toHaveCount(9);
  await expect(viewer.locator('.selection-token[data-selected=true]')).toHaveCount(5);
  await expect(viewer.getByRole('spinbutton', { name: 'Example seed' })).toHaveValue('7');
  await expect(page.getByTestId('roster-remaining')).toHaveText('2,350');
  await viewer.getByRole('button', { name: 'Next draw', exact: false }).click();
  await expect(viewer.locator('.roster-sequence > span')).toHaveCount(1);
  await viewer.getByRole('button', { name: 'Finish', exact: true }).click();
  await expect(viewer.locator('.fill-complete')).toBeVisible();
  expect(Number((await page.getByTestId('roster-remaining').textContent())!.replaceAll(',', ''))).toBeLessThan(100);
  await viewer.getByRole('button', { name: 'Reset', exact: true }).click();
  await expect(page.getByTestId('roster-remaining')).toHaveText('2,350');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await expect(page).toHaveURL(/\/zh-CN\/roster\//);
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.locator('.view-launcher').first().click();
  await expect(page.locator('.roster-controls input[type=number]').first()).toHaveValue('7');
  await expect(page.locator('.roster-controls select')).toHaveValue('51');
  expect(new URL(page.url()).searchParams.has('wave')).toBe(false);
});

test('the reference retains duplicate aliases and distinguishes omitted fields', async ({ page }) => {
  await page.goto('/en/zombies/');
  await expect(page.locator('.catalog-summary')).toContainText('1,030 results');
  await page.getByRole('combobox', { name: 'Scope', exact: true }).selectOption('endless');
  await expect(page.locator('.catalog-summary')).toContainText('175 results');
  await page.getByRole('combobox', { name: 'Scope', exact: true }).selectOption('all');
  await page.getByRole('searchbox').fill('pirate_imp');
  await expect(page.getByRole('button', { name: 'Inspect pirate_imp', exact: true })).toHaveCount(2);
  await page.getByRole('searchbox').fill('mummy');
  const record = page.getByRole('button', { name: 'Inspect Mummy', exact: true });
  await record.click();
  const dialog = page.getByRole('dialog', { name: 'Mummy', exact: true });
  await expect(dialog.locator('.record-core strong')).toHaveText(['100', '1,000', '270', '—']);
  await expect(dialog.locator('.geometry-fields')).toContainText('mWidth: 32');
  await page.keyboard.press('Escape');
  await expect(record).toBeFocused();
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await expect(page.getByRole('searchbox')).toHaveValue('mummy');
  await expect(page.getByRole('button', { name: 'Inspect Mummy', exact: true })).toHaveCount(0);
});

test('mobile article and reference controls remain usable without WebGL', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (this: HTMLCanvasElement, kind: string, ...args: unknown[]) {
      if (kind.startsWith('webgl')) return null;
      return Reflect.apply(original, this, [kind, ...args]);
    } as typeof original;
  });
  await page.goto('/en/wave-plan/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThan(2);
  await page.locator('.view-launcher').first().click();
  const viewer = page.getByRole('dialog', { name: 'The shape of a level' });
  await expect(viewer.locator('.fallback-sculpture')).toBeVisible();
  await viewer.getByRole('button', { name: 'Level 149', exact: true }).click();
  await viewer.getByRole('button', { name: 'Wave 15', exact: true }).click();
  await expect(page.getByTestId('selected-budget')).toHaveText('27,375');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThan(2);
  await page.goto('/zh-CN/zombies/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth)).toBeLessThan(2);
  await page.getByRole('searchbox').fill('木乃伊');
  await expect(page.locator('.catalog-table tbody tr').first()).toBeVisible();
});
