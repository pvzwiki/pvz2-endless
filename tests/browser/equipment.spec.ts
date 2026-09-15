import { test, expect } from '@playwright/test';

test('Evolution carries a selected type into its effect and distinguishes a blocked commit from an empty pool', async ({
  page,
}) => {
  await page.goto(
    '/en/evolution/?lab=evolution&evolution.preset=1&evolution.stage=0&evolution.cost=450',
  );
  const dialog = page.getByRole('dialog', { name: 'Follow an Evolution activation' });
  await dialog.getByRole('button', { name: /Choose replacements/ }).click();
  await expect(dialog.getByLabel('Remaining candidates', { exact: true }).first()).toHaveText('3');
  await dialog.getByRole('button', { name: 'Next step →', exact: true }).click();
  const selected = await dialog.locator('.chosen-result > strong').textContent();
  await dialog.getByRole('button', { name: /Result$/ }).click();
  const center = dialog.getByRole('button', { name: 'Column 2, row 2', exact: true });
  await expect(center).toContainText(selected!);
  await expect(center).toContainText('Level 3');
  await dialog.locator('.evolution-setup > summary').click();
  await dialog.getByRole('combobox', { name: 'Center planting checks' }).selectOption('1');
  await dialog.getByRole('button', { name: /Result$/ }).click();
  await expect(center).toContainText('Empty');
  await expect(dialog.locator('.chosen-result > strong')).toHaveText(selected!);
  await dialog.getByRole('spinbutton', { name: 'Effective source cost' }).fill('500');
  await dialog.getByRole('button', { name: /Result$/ }).click();
  await expect(center).toContainText('Peashooter');
  await expect(dialog.getByLabel('Remaining candidates', { exact: true }).first()).toHaveText('0');
  await page.keyboard.press('Escape');
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await page.getByRole('button', { name: /跟随一次进化激活/ }).click();
  await page.locator('.evolution-setup > summary').click();
  await expect(page.getByRole('spinbutton', { name: '源植物有效成本' })).toHaveValue('500');
  await expect(page.locator('.activation-board')).toContainText('豌豆射手');
});

test('rank-4 fills previously empty cells but does not refill a target lost during its callback', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(
    '/en/evolution/?lab=evolution&evolution.preset=2&evolution.rank=4&evolution.check=1',
  );
  const dialog = page.getByRole('dialog', { name: 'Follow an Evolution activation' });
  const slider = dialog.getByRole('slider', { name: 'Step' });
  const guidedTotal = Number(await slider.getAttribute('max'));
  expect(guidedTotal).toBeLessThan(12);
  await dialog.getByRole('button', { name: /Apply effects/ }).click();
  await expect(dialog.locator('[data-event="remove"]')).toBeVisible();
  await expect(dialog.getByRole('button', { name: 'Column 2, row 2', exact: true })).toContainText(
    'Empty',
  );
  await dialog.getByRole('button', { name: 'Next step →', exact: true }).click();
  await expect(dialog.locator('[data-event="check"]')).toBeVisible();
  await dialog.getByRole('button', { name: 'Next step →', exact: true }).click();
  await expect(dialog.locator('[data-event="failed"]')).toBeVisible();
  await dialog.getByRole('button', { name: /Result$/ }).click();
  await expect(dialog.locator('.activation-plant.replacement')).toHaveCount(8);
  await expect(dialog.getByRole('button', { name: 'Column 2, row 2', exact: true })).toContainText(
    'Empty',
  );
  expect(await dialog.locator('.activation-plant.replacement small').allTextContents()).toEqual(
    Array(8).fill('Level 1'),
  );
  const result = await dialog.locator('.activation-board').textContent();
  const position = await dialog
    .getByLabel('Library stream position', { exact: true })
    .textContent();
  await dialog.getByRole('checkbox', { name: 'Show every event' }).check();
  expect(Number(await slider.getAttribute('max'))).toBeGreaterThan(50);
  await expect(dialog.locator('.activation-board')).toHaveText(result!);
  await expect(dialog.getByLabel('Library stream position', { exact: true })).toHaveText(position!);
  await dialog.getByRole('checkbox', { name: 'Show every event' }).uncheck();
  await expect(slider).toHaveAttribute('max', String(guidedTotal));
  await expect(dialog.locator('.activation-board')).toHaveText(result!);
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
  ).toBeLessThan(2);
});

test('different documented callers reset the same game stream without moving the library stream', async ({
  page,
}) => {
  await page.goto('/en/randomness/?lab=streams');
  const dialog = page.locator('dialog[data-lab="streams"]');
  await dialog.getByRole('combobox', { name: 'Caller of the clock reseed' }).selectOption('0');
  await dialog.getByRole('button', { name: 'Reseed the game stream', exact: true }).click();
  const first = await dialog
    .locator('.stream-lane.game .stream-values strong')
    .first()
    .textContent();
  await dialog.getByRole('button', { name: /Consume one game-engine value/ }).click();
  await dialog.getByRole('button', { name: /Consume one game-engine value/ }).click();
  await dialog.getByRole('button', { name: /Consume one library-engine value/ }).click();
  await dialog.getByRole('combobox', { name: 'Caller of the clock reseed' }).selectOption('2');
  await dialog.getByRole('button', { name: 'Reseed the game stream', exact: true }).click();
  await expect(page.getByTestId('game-position')).toHaveText('0');
  await expect(page.getByTestId('library-position')).toHaveText('1');
  await expect(dialog.locator('.stream-lane.game .stream-values strong').first()).toHaveText(
    first!,
  );
  await expect(dialog.locator('.reseed-history')).toContainText('Gashapon spin');
  await expect(dialog.locator('.reseed-history')).toContainText('2 → 0');
});

test('evidence stays collapsed until the popup opens its permanent reference', async ({ page }) => {
  await page.goto('/en/evolution/');
  await expect(page.locator('#evidence')).not.toHaveAttribute('open', '');
  await page.locator('.note-ref').first().click();
  await page
    .locator('.evidence-dialog')
    .getByRole('link', { name: /Evidence for this explanation/ })
    .click();
  await expect(page.locator('.evidence-dialog')).not.toBeVisible();
  await expect(page.locator('#evidence')).toHaveAttribute('open', '');
  await expect(page.locator('#evidence-evolutionFlow > details')).toHaveAttribute('open', '');
  await expect(page).toHaveURL(/#evidence-evolutionFlow$/);
});

test('the evidence disclosure remains usable without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
  const page = await context.newPage();
  await page.goto('/en/evolution/');
  await page.locator('#evidence > summary').click();
  await page.locator('#evidence-evolutionFlow summary').click();
  await expect(page.locator('#evidence-evolutionFlow p')).toContainText('The base trigger');
  await context.close();
});

test('equipment records have stable bilingual URLs and expose every accessory tier', async ({
  page,
}) => {
  await page.goto('/en/accessories/');
  await page.getByRole('searchbox').fill('Purple Glove');
  await page
    .locator('.equipment-grid')
    .getByRole('link', { name: /Purple Glove/ })
    .click();
  await expect(page).toHaveURL(/\/accessories\/super_clock\//);
  await expect(page.locator('main')).toContainText('create_plantfood_on_kill');
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('紫色手套');
  await expect(page.locator('main')).toContainText('0.18');
});

test('full-text search switches indexes with the page language', async ({ page }) => {
  await page.goto('/en/search/?q=artifact_evolution');
  await expect(page.getByRole('searchbox')).toHaveValue('artifact_evolution');
  await expect(page).toHaveURL(/q=artifact_evolution/);
  await expect(page.locator('.search-results li').first()).toBeVisible();
  expect(
    await page
      .locator('.search-results a')
      .evaluateAll((links) =>
        links.every((link) =>
          new URL((link as HTMLAnchorElement).href).pathname.startsWith('/en/'),
        ),
      ),
  ).toBe(true);
  await page.getByRole('link', { name: '中文', exact: true }).click();
  await expect(page).toHaveURL(/\/zh-CN\/search\//);
  await page.getByRole('searchbox').fill('进化');
  await expect(page.locator('.search-results li').first()).toBeVisible();
  expect(
    await page
      .locator('.search-results a')
      .evaluateAll((links) =>
        links.every((link) =>
          new URL((link as HTMLAnchorElement).href).pathname.startsWith('/zh-CN/'),
        ),
      ),
  ).toBe(true);
});

test('new mechanism controls render on mobile and the library stream advances by measured consumption', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  for (const [article, kind] of [
    ['purple-glove', 'glove'],
    ['speed-up-clock', 'clock'],
    ['artifact-framework', 'formulas'],
    ['randomness', 'streams'],
    ['implementation-defects', 'weights'],
  ]) {
    await page.goto(`/en/${article}/?lab=${kind}`);
    const dialog = page.locator(`dialog[data-lab="${kind}"]`);
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.new-lab')).toBeVisible();
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth),
    ).toBeLessThan(2);
    if (kind === 'glove') {
      await expect(dialog.locator('.drop-outcome').first()).toContainText(
        'Deadline has not passed',
      );
      await dialog.getByRole('spinbutton', { name: 'Clock time', exact: true }).fill('9');
      await expect(dialog.locator('.drop-outcome').first()).toContainText('Pickup created');
    }
    if (kind === 'clock') {
      const interval = dialog.getByLabel('Resulting interval', { exact: true });
      await expect(interval).toHaveText('7.30');
      await dialog.getByRole('spinbutton', { name: 'Accessory level', exact: true }).fill('0');
      await expect(interval).toHaveText('9.09');
    }
    if (kind === 'formulas') {
      await dialog.getByRole('combobox', { name: 'Formula entry', exact: true }).selectOption('1');
      await dialog.getByRole('combobox', { name: 'Artifact rank', exact: true }).selectOption('1');
      await expect(dialog.getByLabel('Arithmetic result', { exact: true })).toHaveText('0');
      await expect(dialog.getByLabel('Description result', { exact: true })).toHaveText('1');
    }
    if (kind === 'weights') {
      const last = dialog.locator('.lab-stat-grid output').last();
      await expect(last).toHaveText('3.84%');
      await dialog.getByRole('spinbutton', { name: 'Weight 1', exact: true }).fill('2');
      await expect(last).not.toHaveText('3.84%');
    }
    if (kind === 'streams') {
      await expect(page.getByTestId('library-position')).toHaveText('0');
      await dialog.getByRole('button', { name: /Consume this shuffle/ }).click();
      await expect(page.getByTestId('library-position')).toHaveText('8');
      await dialog.getByRole('button', { name: 'Reseed the game stream', exact: true }).click();
      await expect(page.getByTestId('library-position')).toHaveText('8');
    }
    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  }
  expect(errors).toEqual([]);
});
