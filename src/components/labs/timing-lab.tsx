"use client";
import { useLocale, useTranslations } from "next-intl";
import { deadlineScenario, waveThreshold } from "@/lib/mechanism-model";
import { entityHealthReport, INT32_MAX, reportedHealth } from "@/lib/wave-health";
import { createWavePlan } from "@/lib/wave-model";
import AnnouncementLab from "./announcement-lab";
import {
  LevelControl,
  Stat,
  Toggle,
  useCanvasWidth,
  useParameters,
} from "./lab-controls";
const conditionKeys = [
  "finished",
  "currentClear",
  "olderClear",
  "childrenClear",
  "portalGone",
] as const;
export default function TimingLab() {
  const t = useTranslations("labs.timing"), locale = useLocale();
  const [state, set] = useParameters(
    "timing",
    {
      mode: 0,
      level: 36,
      wave: 2,
      fraction: 0.8,
      damage: 2000,
      at: 1,
      time: 0,
      automatic: 0,
      rejected: 1,
      eligibleHp: 8000,
      newcomerHp: 2000,
      normalInterval: 24,
      finished: 0,
      currentClear: 0,
      olderClear: 0,
      childrenClear: 0,
      portalGone: 0,
    },
    {
      mode: [0, 2],
      level: [1, 149],
      wave: [1, 14],
      fraction: [0.7, 0.85, 0.01],
      damage: [0, 1_000_000_000_000],
      at: [0, 35, 0.1],
      time: [0, 40, 0.1],
      automatic: [0, 1],
      rejected: [0, 1],
      eligibleHp: [0, 100_000_000_000],
      newcomerHp: [0, 100000],
      normalInterval: [20, 25, 0.1],
      finished: [0, 1],
      currentClear: [0, 1],
      olderClear: [0, 1],
      childrenClear: [0, 1],
      portalGone: [0, 1],
    },
  );
  const level = state.level % 5 === 0 ? state.level + 1 : state.level,
    plan = createWavePlan(level),
    wave = Math.min(state.wave, plan.count - 1),
    next = plan.waves[wave],
    large = next.flag || next.final,
    interval = large ? 35 : state.normalInterval,
    guarded = wave % plan.spacing === plan.spacing - 1;
  const initialAccumulator = Math.fround(Math.fround(state.eligibleHp)
      + Math.fround(state.rejected ? 0 : entityHealthReport(state.newcomerHp))),
    initial = reportedHealth(initialAccumulator),
    threshold = waveThreshold(initial, state.fraction),
    after = reportedHealth(Math.fround(Math.max(0, initialAccumulator - state.damage))),
    crossing = initial <= threshold ? 0 : after <= threshold ? state.at : null,
    scenario = deadlineScenario(
      interval,
      crossing,
      !!state.automatic,
      guarded,
      large,
    );
  const health = state.time >= state.at ? after : initial,
    deadline =
      crossing !== null && state.time >= crossing
        ? Math.min(interval, crossing)
        : interval;
  const [ref, width] = useCanvasWidth(),
    x = (time: number) => 35 + (time / 40) * (width - 60),
    win = conditionKeys.every((key) => !!state[key]);
  return (
    <div className="timing-lab">
      <div className="lab-tabs" role="tablist" aria-label={t("views")}>
        <button
          role="tab"
          aria-selected={state.mode === 0}
          onClick={() => set({ mode: 0 })}
        >
          {t("advancement")}
        </button>
        <button
          role="tab"
          aria-selected={state.mode === 2}
          onClick={() => set({ mode: 2 })}
        >
          {t("announcement")}
        </button>
        <button
          role="tab"
          aria-selected={state.mode === 1}
          onClick={() => set({ mode: 1 })}
        >
          {t("completion")}
        </button>
      </div>
      {state.mode === 0 ? (
        <>
          <p className="lab-intro">{t("intro")}</p>
          <div className="lab-controls">
            <LevelControl
              value={level}
              onChange={(level) => set({ level, wave: 1, time: 0 })}
            />
            <label>
              {t("trackedWave")}
              <select
                value={wave}
                onChange={(event) =>
                  set({ wave: Number(event.target.value), time: 0 })
                }
              >
                {plan.waves.slice(0, -1).map((row) => (
                  <option key={row.number} value={row.number}>
                    {row.number}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("eligibleHp")}
              <input type="number" min={0} max={100_000_000_000} value={state.eligibleHp}
                onChange={(event) => set({ eligibleHp: Number(event.target.value) })} />
            </label>
            <label>
              {t("newcomerHp")}
              <input type="number" min={0} max={100000} value={state.newcomerHp}
                onChange={(event) => set({ newcomerHp: Number(event.target.value) })} />
            </label>
            <label>
              {t("intervalInput")}
              <input type="number" min={20} max={25} step={0.1} value={state.normalInterval}
                disabled={large}
                onChange={(event) => set({ normalInterval: Number(event.target.value) })} />
            </label>
            <label>
              q
              <span className="control-value" aria-hidden="true">
                {state.fraction.toFixed(2)}
              </span>
              <input
                type="range"
                min={0.7}
                max={0.85}
                step={0.01}
                value={state.fraction}
                onChange={(event) =>
                  set({ fraction: Number(event.target.value) })
                }
              />
            </label>
            <Toggle
              checked={!!state.automatic}
              onChange={(checked) =>
                set({ automatic: Number(checked), time: 0 })
              }
            >
              {t("automatic")}
            </Toggle>
            <Toggle
              checked={!!state.rejected}
              onChange={(checked) => set({ rejected: Number(checked) })}
            >
              {t("reject")}
            </Toggle>
          </div>
          <div className="lab-controls">
            <label>
              {t("healthLoss")}
              <input
                type="number"
                min={0}
                max={initialAccumulator}
                value={state.damage}
                onChange={(event) =>
                  set({ damage: Number(event.target.value) })
                }
              />
            </label>
            <label>
              {t("lossAt")}
              <input
                type="number"
                min={0}
                max={35}
                step={0.1}
                value={state.at}
                onChange={(event) => set({ at: Number(event.target.value) })}
              />
            </label>
            <button
              onClick={() => set({ level: 36, wave: 2, fraction: 0.8, normalInterval: 24,
                eligibleHp: 10_000_000_000, newcomerHp: 0,
                rejected: 1, damage: 2_000_000_000, at: 1, time: 0, automatic: 0 })}
            >
              {t("largeHpExample")}
            </button>
            <button
              onClick={() =>
                set({ level: 81, wave: 4, at: 1, damage: 2000, time: 0,
                  eligibleHp: 8000, newcomerHp: 2000, rejected: 1, fraction: 0.8 })
              }
            >
              {t("beforeFlag")}
            </button>
            <button
              onClick={() =>
                set({
                  level: 81,
                  wave: 12,
                  automatic: 1,
                  at: 1,
                  damage: 2000,
                  eligibleHp: 8000,
                  newcomerHp: 2000,
                  rejected: 1,
                  fraction: 0.8,
                  time: 0,
                })
              }
            >
              {t("shortFinal")}
            </button>
          </div>
          <div className="lab-stat-grid health-report-grid">
            <Stat
              label="H₀"
              value={initial.toLocaleString(locale)}
              detail={t("snapshotDetail", { raw: initialAccumulator.toLocaleString(locale) })}
            />
            <Stat
              label="T"
              value={threshold.toLocaleString(locale)}
              detail={`${state.fraction} × ${initial}`}
            />
            <Stat
              label="H(t)"
              value={health.toLocaleString(locale)}
              detail={health <= threshold ? "H(t) ≤ T" : "H(t) > T"}
            />
          </div>
          {initialAccumulator > INT32_MAX && <p className="lab-note" data-testid="health-saturation">
            {t("saturationDetail", { cap: INT32_MAX.toLocaleString(locale) })}
          </p>}
          <div className="lab-stage" ref={ref}>
            <svg
              viewBox={`0 0 ${width} 235`}
              role="img"
              aria-label={t("timeline")}
            >
              {[0, 10, 20, 30, 40].map((time) => (
                <g key={time}>
                  <line
                    x1={x(time)}
                    x2={x(time)}
                    y1="28"
                    y2="207"
                    className="lab-axis"
                  />
                  <text
                    x={x(time)}
                    y="225"
                    textAnchor="middle"
                    className="lab-axis-label"
                  >
                    {time}s
                  </text>
                </g>
              ))}
              <text x="5" y="18" className="lab-axis-label">
                {t("healthEvent")}
              </text>
              <line x1={x(0)} x2={x(40)} y1="48" y2="48" stroke="#73965d" />
              <circle cx={x(state.at)} cy="48" r="6" fill="#d9b575" />
              <text x="5" y="85" className="lab-axis-label">
                {t("normalPath")}
              </text>
              <rect
                x={x(0)}
                y="100"
                width={x(scenario.normal) - x(0)}
                height="22"
                rx="4"
                fill="#6f9767"
              />
              <circle cx={x(scenario.normal)} cy="111" r="7" fill="#bfd69b" />
              {large && (
                <line
                  x1={x(scenario.normalGate)}
                  x2={x(scenario.normal)}
                  y1="137"
                  y2="137"
                  stroke="#d7b579"
                  strokeWidth="3"
                />
              )}
              <text x="5" y="161" className="lab-axis-label">
                {t("selectedPath")}
              </text>
              <rect
                x={x(0)}
                y="176"
                width={x(scenario.advance) - x(0)}
                height="22"
                rx="4"
                fill={scenario.request ? "#9f8bb5" : "#6f9767"}
              />
              <circle
                cx={x(scenario.advance)}
                cy="187"
                r="7"
                fill={scenario.request ? "#d4bcdf" : "#bfd69b"}
              />
              <g
                className="lab-token"
                style={{ transform: `translate(${x(state.time)}px,0)` }}
              >
                <line
                  x1="0"
                  x2="0"
                  y1="30"
                  y2="204"
                  stroke="#eef0d9"
                  strokeWidth="2"
                />
                <path d="M-4 25 L4 25 L0 32Z" fill="#eef0d9" />
              </g>
            </svg>
          </div>
          <div className="lab-controls steam-time">
            <label>
              {t("clock")}
              <span className="control-value" aria-hidden="true">
                {state.time.toFixed(1)}s
              </span>
              <input
                type="range"
                min={0}
                max={40}
                step={0.1}
                value={state.time}
                onChange={(event) => set({ time: Number(event.target.value) })}
              />
            </label>
            {[0, state.at, 4, scenario.advance]
              .filter((n, i, a) => a.indexOf(n) === i)
              .map((time) => (
                <button key={time} onClick={() => set({ time })}>
                  {time}s
                </button>
              ))}
          </div>
          <div className="lab-stat-grid">
            <Stat
              label={t("deadline")}
              value={`${deadline}s`}
              detail={large ? t("largeInterval") : t("ordinaryInterval", { n: state.normalInterval })}
            />
            <Stat
              label={t("visibility")}
              value={`${scenario.visible}s`}
              detail={guarded ? t("guarded") : t("allowed")}
            />
            <Stat
              label={t("firstAdvance")}
              value={`${scenario.advance}s`}
              detail={
                scenario.request
                  ? t("manualPath")
                  : large
                    ? t("withAnnouncement")
                    : t("normalPath")
              }
            />
          </div>
          <div className="lab-note">
            {t("guardFormula", {
              wave,
              spacing: plan.spacing,
              result: wave % plan.spacing,
              boundary: plan.spacing - 1,
            })}
            {large
              ? ` ${t("announcementDetail", { old: scenario.deadline, next: scenario.deadline + 5, gate: scenario.normalGate })}`
              : ""}
          </div>
          <p className="lab-caption">{t("trackedDetail")}</p>
        </>
      ) : state.mode === 2 ? <AnnouncementLab /> : (
        <>
          <p className="lab-intro">{t("completionIntro")}</p>
          <div className="lab-controls">
            <button
              onClick={() =>
                set({
                  finished: 0,
                  currentClear: 1,
                  olderClear: 1,
                  childrenClear: 1,
                  portalGone: 1,
                })
              }
            >
              {t("emptyLawn")}
            </button>
            <button
              onClick={() =>
                set({
                  finished: 1,
                  currentClear: 1,
                  olderClear: 1,
                  childrenClear: 1,
                  portalGone: 0,
                })
              }
            >
              {t("closingPortal")}
            </button>
            <button
              onClick={() =>
                set({
                  finished: 1,
                  currentClear: 1,
                  olderClear: 1,
                  childrenClear: 1,
                  portalGone: 1,
                })
              }
            >
              {t("allClear")}
            </button>
          </div>
          <div className="completion-gates">
            {conditionKeys.map((key) => (
              <div className={state[key] ? "pass" : ""} key={key}>
                <Toggle
                  checked={!!state[key]}
                  onChange={(checked) => set({ [key]: Number(checked) })}
                >
                  {t(`conditions.${key}`)}
                </Toggle>
                <span>{state[key] ? "✓" : "×"}</span>
              </div>
            ))}
          </div>
          <div
            className={`completion-output ${win ? "pass" : ""}`}
            aria-live="polite"
          >
            <span>AND</span>
            <strong>{win ? t("victory") : t("blocked")}</strong>
          </div>
          <div className="lab-note">{t("completionDetail")}</div>
        </>
      )}
    </div>
  );
}
