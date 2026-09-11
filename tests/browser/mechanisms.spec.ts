import { test, expect, type Page, type Locator } from "@playwright/test";
import en from "../../src/messages/en.json" with { type: "json" };
import zh from "../../src/messages/zh-CN.json" with { type: "json" };

const views = [
  ["wave-plan", "pipeline"],
  ["roster", "reservation"],
  ["worlds", "jam"],
  ["worlds", "portals"],
  ["worlds", "steam"],
  ["strength", "strength"],
  ["placement", "placement"],
  ["timing", "timing"],
  ["drops", "loot"],
] as const;
async function open(page: Page, chapter: string, kind: string, query = "", locale = "en") {
  await page.goto(`/${locale}/${chapter}/?lab=${kind}${query}`);
  const dialog = page.locator(`dialog[data-lab="${kind}"]`);
  await expect(dialog).toBeVisible();
  await expect(dialog.locator(".lab-intro,.lab-tabs").first()).toBeVisible();
  return dialog;
}
async function seek(dialog: Locator, step: number | "end") {
  const slider = dialog.getByRole("slider", { name: "Step", exact: true });
  await slider.focus();
  await slider.press("Home");
  if (step === "end") await slider.press("End");
  else for (let i = 0; i < step; i++) await slider.press("ArrowRight");
}
const output = (dialog: Locator, label: string) =>
  dialog.getByRole("status", { name: label, exact: true });

test('construction reuses the level-wide leader attempt when inspecting another wave', async ({ page }) => {
  const dialog = await open(page, 'wave-plan', 'pipeline', '&pipeline.level=36&pipeline.seed=7');
  const attempt = await dialog.getByTestId('leader-attempt').textContent();
  await dialog.getByRole('combobox', { name: 'Wave', exact: true }).selectOption('8');
  await expect(dialog.getByTestId('leader-attempt')).toHaveText(attempt!);
  await seek(dialog, 'end');
  await expect(dialog.getByTestId('independent-flag')).toBeVisible();
  const roster = await dialog.locator('.pipeline-instructions').textContent();
  await dialog.getByRole('button', { name: 'Next seed', exact: true }).click();
  await seek(dialog, 'end');
  await expect(dialog.locator('.pipeline-instructions')).not.toHaveText(roster!);
});

test('music replay preserves sampled levels and resets when the example seed changes', async ({ page }) => {
  const dialog = await open(page, 'worlds', 'jam');
  const tiles = dialog.locator('.jam-board .lab-token');
  const levels = await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-level')).sort());
  await seek(dialog, 'end');
  expect(await tiles.evaluateAll((nodes) => nodes.map((node) => node.getAttribute('data-level')).sort())).toEqual(levels);
  await expect(dialog.locator('.jam-board [data-replaced=true][data-leader=true]')).toHaveCount(0);
  await dialog.getByRole('button', { name: 'Next seed', exact: true }).click();
  await expect(dialog.getByRole('spinbutton', { name: 'Example seed', exact: true })).toHaveValue('8');
  await expect(dialog.getByRole('slider', { name: 'Step', exact: true })).toHaveValue('0');
});

test('a late portal opening retains the emission schedule and consumes one slot per update', async ({ page }) => {
  const dialog = await open(page, 'worlds', 'portals');
  await dialog.getByRole('spinbutton', { name: 'Opening-completion time (seconds)', exact: true }).fill('20');
  await seek(dialog, 4);
  await expect(output(dialog, 'Children emitted')).toHaveText('1');
  await expect(output(dialog, 'Scheduled deadline')).toHaveText('14s');
  await expect(output(dialog, 'Time at this update')).toHaveText('20s');
  await seek(dialog, 5);
  await expect(output(dialog, 'Children emitted')).toHaveText('2');
  await expect(output(dialog, 'Scheduled deadline')).toHaveText('25s');
});

test('changing the next Steam delta preserves damage history', async ({ page }) => {
  const dialog = await open(page, 'worlds', 'steam');
  await seek(dialog, 3);
  const delta = dialog.getByRole('spinbutton', { name: 'Game-time delta per update', exact: true });
  const update = dialog.getByRole('button', { name: 'Run one update', exact: true });
  await delta.fill('1');
  await update.click();
  await delta.fill('0.5');
  await expect(output(dialog, 'Accumulator left')).toHaveText('1.00');
  await update.click();
  await expect(output(dialog, 'Damage passes')).toHaveText('1');
  await expect(output(dialog, 'Accumulator left')).toHaveText('0.50');
  await delta.fill('3');
  await expect(output(dialog, 'Damage passes')).toHaveText('1');
  await update.click();
  await expect(output(dialog, 'Damage passes')).toHaveText('2');
  await expect(output(dialog, 'Accumulator left')).toHaveText('2.50');
});

test('a rejected newcomer cannot delay the zero-health automatic path', async ({ page }) => {
  const dialog = await open(page, 'timing', 'timing');
  await dialog.getByRole('spinbutton', { name: en.labs.timing.eligibleHp, exact: true }).fill('0');
  await dialog.getByRole('checkbox', { name: 'Automatic next-wave option', exact: true }).check();
  await expect(output(dialog, 'First wave advance')).toHaveText('0s');
  await dialog.getByRole('checkbox', { name: 'Reject the optional newcomer before H₀', exact: true }).uncheck();
  await expect(output(dialog, 'First wave advance')).toHaveText('1s');
});

for (const locale of ["en", "zh-CN"] as const) {
  const messages = locale === "en" ? en : zh;
  test(`${locale}: HP saturation delays the health trigger while the timer remains active`, async ({ page }) => {
    const dialog = await open(page, "timing", "timing", "&timing.mode=0", locale);
    const t = messages.labs.timing;
    await dialog.getByRole("button", { name: t.largeHpExample, exact: true }).click();
    await expect(output(dialog, "H₀")).toHaveText((2_147_483_647).toLocaleString(locale));
    await expect(output(dialog, "T")).toHaveText((1_717_986_944).toLocaleString(locale));
    await expect(dialog.getByTestId("health-saturation")).toBeVisible();
    await expect(output(dialog, t.firstAdvance)).toHaveText("24s");
    await dialog.getByRole("spinbutton", { name: t.healthLoss, exact: true }).fill("8500000000");
    await expect(output(dialog, t.firstAdvance)).toHaveText("4s");
  });

  test(`${locale}: warning-time taps retain state 2 and finalization needs another update`, async ({ page }) => {
    const dialog = await open(page, "timing", "timing", "&timing.mode=2", locale);
    const t = messages.labs.announcement;
    await expect(output(dialog, t.spawn)).toHaveText("31s");
    await expect(output(dialog, t.state)).toHaveText("2");
    await expect(output(dialog, t.freshDeadline)).toHaveText("53.5s");
    await expect(output(dialog, t.following)).toHaveText("53.5s");
    await dialog.getByRole("spinbutton", { name: t.tapInput, exact: true }).fill("20");
    await expect(output(dialog, t.state)).toHaveText("1");
    await expect(output(dialog, t.following)).toHaveText("25s");
    await dialog.getByRole("spinbutton", { name: t.tapInput, exact: true }).fill("31");
    await dialog.getByRole("combobox", { name: t.wave, exact: true }).selectOption("15");
    await expect(output(dialog, t.finish)).toHaveText("53.5s +");
    await expect(dialog.getByText(t.anotherUpdate, { exact: true })).toBeVisible();
  });
}

test("all mechanism views and tabs work in both languages on mobile", async ({
  page,
}) => {
  test.setTimeout(60000);
  await page.setViewportSize({ width: 390, height: 844 });
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /MISSING_MESSAGE|INVALID_MESSAGE|Hydration|React error/.test(
        message.text(),
      )
    )
      errors.push(message.text());
  });
  for (const locale of ["en", "zh-CN"] as const) {
    for (const [chapter, kind] of views) {
      await page.goto(`/${locale}/${chapter}/?lab=${kind}`);
      const dialog = page.getByRole("dialog", {
        name: (locale === "en" ? en : zh).labs[kind].title,
        exact: true,
      });
      await expect(dialog).toBeVisible();
      await expect(
        dialog.locator(".lab-intro,.lab-tabs").first(),
      ).toBeVisible();
      expect(
        await dialog
          .locator(".lab-body")
          .evaluate((el) => el.scrollWidth - el.clientWidth),
        `${locale}/${kind}`,
      ).toBeLessThan(2);
      for (const tab of await dialog.getByRole("tab").all()) {
        await tab.click();
        expect(
          await dialog
            .locator(".lab-body")
            .evaluate((el) => el.scrollWidth - el.clientWidth),
          `${locale}/${kind} tab`,
        ).toBeLessThan(2);
      }
      await page.keyboard.press("Escape");
      await expect(dialog).not.toBeVisible();
    }
  }
  expect(errors).toEqual([]);
});

test("final reservation skips equality and ordinary filling can spend the same budget", async ({
  page,
}) => {
  const dialog = await open(page, "roster", "reservation");
  await dialog
    .getByRole("button", { name: "Exact match: 200", exact: true })
    .click();
  await seek(dialog, 1);
  await expect(
    dialog.getByRole("heading", { name: "Reservation skips this type" }),
  ).toBeVisible();
  await expect(output(dialog, "Remaining budget")).toHaveText("200");
  await seek(dialog, "end");
  await expect(output(dialog, "Remaining budget")).toHaveText("0");
  await expect(
    dialog.locator(".reservation-result .pipeline-token"),
  ).not.toHaveCount(0);
});

test("an empty portal queue still blocks completion until the later close callback", async ({
  page,
}) => {
  const dialog = await open(page, "worlds", "portals");
  await seek(dialog, 7);
  await expect(output(dialog, "Slots left in the queue")).toHaveText("0");
  await expect(output(dialog, "Children emitted")).toHaveText("4");
  await dialog
    .getByRole("checkbox", { name: "All emitted children have been cleared" })
    .check();
  await expect(dialog.getByTestId("portal-completion")).toContainText(
    "blocked by the portal itself",
  );
  await seek(dialog, 8);
  await expect(dialog.getByTestId("portal-completion")).toContainText(
    "blocked by the portal itself",
  );
  await seek(dialog, 9);
  await expect(dialog.getByTestId("portal-completion")).toContainText(
    "Neither this portal nor its emitted children block",
  );
});

test("Steam applies one strict damage pass per update and preserves transport deadlines", async ({
  page,
}) => {
  const dialog = await open(page, "worlds", "steam");
  await seek(dialog, 3);
  await dialog
    .getByRole("spinbutton", { name: "Game-time delta per update" })
    .fill("1");
  await dialog
    .getByRole("button", { name: "Run one update", exact: true })
    .click();
  await expect(output(dialog, "Damage passes")).toHaveText("0");
  await dialog
    .getByRole("button", { name: "Run one update", exact: true })
    .click();
  await expect(output(dialog, "Damage passes")).toHaveText("1");
  await dialog
    .getByRole("tab", { name: "Pipeline transport", exact: true })
    .click();
  await dialog.getByRole("button", { name: "3s", exact: true }).click();
  await expect(
    dialog.getByRole("heading", { name: "The entity uses the exit position" }),
  ).toBeVisible();
  await dialog.getByRole("button", { name: "3.1s", exact: true }).click();
  await expect(
    dialog.getByRole("heading", {
      name: "Completion deadline strictly exceeded",
    }),
  ).toBeVisible();
  await dialog
    .getByRole("checkbox", { name: "Block the exit at t = 1" })
    .check();
  await expect(output(dialog, "Damage rate to one blocker")).toHaveText("53");
  await dialog
    .getByRole("spinbutton", { name: "Transported zombies" })
    .fill("5");
  await expect(output(dialog, "Damage rate to one blocker")).toHaveText("53");
  await dialog.getByRole('button', { name: '15.1s', exact: true }).click();
  await expect(output(dialog, 'Damage rate to one blocker')).toHaveText('0');
});

test("requested levels, table fallback, and leader health remain separate in the inspector", async ({
  page,
}) => {
  const dialog = await open(
    page,
    "strength",
    "strength",
    "&strength.level=2&strength.residue=10",
  );
  await expect(output(dialog, "This instruction requests")).toHaveText("2");
  await dialog.getByRole("button", { name: "L 3", exact: true }).click();
  await expect(output(dialog, "This instruction requests")).toHaveText("2");
  const residue = dialog.getByRole("slider", {
    name: /Chosen integer residue/,
  });
  await residue.focus();
  await residue.press("ArrowRight");
  await expect(output(dialog, "This instruction requests")).toHaveText("1");
  await dialog
    .getByRole("button", { name: "Level-5 conehead example", exact: true })
    .click();
  const body = await output(dialog, "Body HP").textContent();
  const bite = await output(dialog, "Base bite damage / game second").textContent();
  await dialog.getByRole("checkbox", { name: "Apply the leader marker once" }).check();
  await expect(output(dialog, "Body HP")).not.toHaveText(body!);
  await expect(output(dialog, "Base bite damage / game second")).toHaveText(bite!);
  await dialog
    .getByRole("button", { name: "Inspect missing row 6", exact: true })
    .click();
  await expect(dialog.locator(".lab-note")).toContainText(
    "lookup returns multiplier 1",
  );
});

test("placement hooks retain or replace the provisional position", async ({
  page,
}) => {
  const dialog = await open(page, "placement", "placement");
  await dialog
    .getByRole("tab", { name: "Placement sequence", exact: true })
    .click();
  await dialog
    .getByRole("combobox", { name: "Newcomer type" })
    .selectOption("0");
  await dialog
    .getByRole("checkbox", { name: "An active circle accepts this newcomer" })
    .uncheck();
  await seek(dialog, 1);
  const provisionalX = await dialog.getByTestId("placement-zombie").getAttribute("data-game-x");
  await seek(dialog, 4);
  await expect(dialog.getByTestId("placement-zombie")).toHaveAttribute("data-game-x", provisionalX!);
  await dialog
    .getByRole("combobox", { name: "Newcomer type" })
    .selectOption("1");
  await dialog
    .getByRole("checkbox", { name: "An active circle accepts this newcomer" })
    .check();
  await dialog
    .getByRole("button", { name: "All occupied", exact: true })
    .click();
  await seek(dialog, 4);
  await expect(dialog.getByTestId("placement-zombie")).toHaveAttribute(
    "data-game-x",
    "744",
  );
  await expect(dialog.getByTestId("placement-zombie")).toHaveAttribute(
    "data-row",
    "3",
  );
  await expect(output(dialog, "Row credited in history")).toHaveText("2");
  await expect(dialog.locator(".lab-readout")).toContainText("ZS_Die");
});

test("the clock distinguishes normal advancement, regular boundaries, and short final waves", async ({
  page,
}) => {
  const dialog = await open(page, "timing", "timing");
  await expect(output(dialog, "First wave advance")).toHaveText("4s");
  await dialog
    .getByRole("checkbox", { name: "Automatic next-wave option" })
    .check();
  await expect(output(dialog, "First wave advance")).toHaveText("1s");
  await dialog
    .getByRole("button", { name: "Before regular flag wave 5", exact: true })
    .click();
  await expect(output(dialog, "First wave advance")).toHaveText("6s");
  await dialog
    .getByRole("button", { name: "Before short final wave 13", exact: true })
    .click();
  await expect(output(dialog, "First wave advance")).toHaveText("1s");
  await dialog
    .getByRole("tab", { name: "Complete the battle", exact: true })
    .click();
  await dialog
    .getByRole("button", {
      name: "Empty lawn, future waves remain",
      exact: true,
    })
    .click();
  await expect(dialog.locator(".completion-output")).toContainText(
    "still blocked",
  );
  await dialog
    .getByRole("button", {
      name: "Last child gone, portal is closing",
      exact: true,
    })
    .click();
  await expect(dialog.locator(".completion-output")).toContainText(
    "still blocked",
  );
  await dialog
    .getByRole("button", { name: "All shown predicates pass", exact: true })
    .click();
  await expect(dialog.locator(".completion-output")).toContainText(
    "Completion passes",
  );
});

test("plant-food consumption and strict saved-schedule equality are visible", async ({
  page,
}) => {
  const dialog = await open(page, "drops", "loot");
  await dialog.getByRole("button", { name: "L 56", exact: true }).click();
  await expect(output(dialog, "Total planned plant food")).toHaveText("0");
  await dialog
    .getByRole("tab", { name: "Request carriers", exact: true })
    .click();
  await dialog
    .getByRole("combobox", { name: "Instruction order" })
    .selectOption("1");
  await seek(dialog, "end");
  await expect(output(dialog, "Quota remaining")).toHaveText("0");
  await expect(output(dialog, "Accepted markers")).toHaveText("0");
  await dialog
    .getByRole("combobox", { name: "Instruction order" })
    .selectOption("0");
  await seek(dialog, "end");
  await expect(output(dialog, "Accepted markers")).toHaveText("1");
  await expect(output(dialog, "Pickups requested")).toHaveText("1");
  await dialog
    .getByRole("tab", { name: "Advance saved schedules", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Inspect exact equality", exact: true })
    .click();
  await expect(output(dialog, "LevelLengthsPlayed")).toHaveText("2.000");
  await expect(output(dialog, "NextDropTime")).toHaveText("2.000");
  await expect(dialog.locator(".lab-readout h3")).toHaveText(
    "0 loot codes emitted so far",
  );
  await dialog
    .getByRole("button", { name: "Plan another level", exact: true })
    .click();
  await expect(dialog.locator(".lab-readout h3")).toHaveText(
    "1 loot codes emitted so far",
  );
});

test("the original roster view can replay pool-index removal before filling", async ({
  page,
}) => {
  await page.goto("/en/roster/");
  await page.locator(".view-launcher").first().click();
  const dialog = page.getByRole("dialog", {
    name: "From a pool to a wave",
    exact: true,
  });
  await dialog
    .getByRole("button", { name: "Replay type selection", exact: true })
    .click();
  await dialog
    .getByRole("button", { name: "Pause selection", exact: true })
    .click();
  await expect(
    dialog.locator(".selection-token[data-selected=true]"),
  ).toHaveCount(1);
  await dialog
    .getByRole("button", { name: "Next choice", exact: false })
    .click();
  await expect(
    dialog.locator(".selection-token[data-selected=true]"),
  ).toHaveCount(2);
  await dialog
    .getByRole("button", { name: "Use final selection", exact: true })
    .click();
  await expect(
    dialog.locator(".selection-token[data-selected=true]"),
  ).toHaveCount(5);
  await expect(
    dialog.getByRole("button", { name: "Next draw", exact: false }),
  ).toBeVisible();
});

test("normal motion animates the zombie between verified placement coordinates", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  const dialog = await open(
    page,
    "placement",
    "placement",
    "&placement.mode=1&placement.type=0&placement.circle=0",
  );
  const zombie = dialog.getByTestId("placement-zombie");
  await expect(zombie).toHaveAttribute("data-game-x", "852");
  const transition = zombie.evaluate(
    (node) =>
      new Promise<string>((resolve) =>
        node.addEventListener(
          "transitionrun",
          (event) => resolve((event as TransitionEvent).propertyName),
          { once: true },
        ),
      ),
  );
  await dialog.getByRole("button", { name: "Next step", exact: false }).click();
  await expect(zombie).toHaveAttribute("data-game-x", "944");
  expect(await transition).toMatch(/transform/);
});

test("language switching preserves a mechanism example and its replay position", async ({
  page,
}) => {
  const dialog = await open(page, "worlds", "jam");
  await dialog
    .getByRole("combobox", { name: "Displayed level", exact: true })
    .selectOption("51");
  await dialog
    .getByRole("spinbutton", { name: "Example seed", exact: true })
    .fill("19");
  await seek(dialog, 3);
  await page.keyboard.press("Escape");
  await page.getByRole("link", { name: "中文", exact: true }).click();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-CN");
  await page
    .getByRole("button", { name: new RegExp(zh.labs.jam.title) })
    .click();
  const chinese = page.getByRole("dialog", {
    name: zh.labs.jam.title,
    exact: true,
  });
  await expect(
    chinese.getByRole("combobox", { name: zh.labs.level, exact: true }),
  ).toHaveValue("51");
  await expect(
    chinese.getByRole("spinbutton", { name: zh.labs.seed, exact: true }),
  ).toHaveValue("19");
  await expect(
    chinese.getByRole("slider", { name: zh.labs.step, exact: true }),
  ).toHaveValue("3");
});

test("wide formulas provide a localized scroll cue and keyboard access only when needed", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/zh-CN/strength/");
  const formula = page
    .getByRole("group", { name: zh.site.scrollableFormula, exact: true })
    .first();
  await expect(formula).toBeVisible();
  await expect(page.locator(".math-scroll-note").first()).toContainText(
    zh.site.scrollFormulaHint,
  );
  await formula.focus();
  await formula.press("ArrowRight");
  await expect
    .poll(() => formula.evaluate((node) => node.scrollLeft))
    .toBeGreaterThan(0);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator(".math-scroll-note")).toHaveCount(0);
});
