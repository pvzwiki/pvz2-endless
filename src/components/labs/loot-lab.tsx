"use client";
import { useLocale, useTranslations } from "next-intl";
import {
  foodPlan,
  carrierRequests,
  assignLoot,
  advanceLootSchedule,
  typeRecord,
  typeNumber,
  mechanismInputs,
  f32,
  type LootScheduleState,
} from "@/lib/mechanism-model";
import { createWavePlan } from "@/lib/wave-model";
import {
  LevelControl,
  Playback,
  Stat,
  Toggle,
  useParameters,
  useCanvasWidth,
} from "./lab-controls";
const stepKeys = ["0", "1", "2", "3", "4", "5", "6", "7"] as const,
  phaseKeys = ["0", "1", "2"] as const;
const examples = [
  ["eighties_gargantuar_danger", "eighties"],
  ["cowboy_gargantuar_danger", "cowboy"],
  ["cowboy", "cowboy_gargantuar_danger"],
] as const;
const lootTypes = ["mummy", "egypt_gargantuar_danger", "mummy_flag"];
const tabs = ["quota", "carriers", "tags", "schedule"] as const;
export default function LootLab() {
  const t = useTranslations("labs.loot"),
    c = useTranslations("labs"),
    locale = useLocale();
  const [state, set] = useParameters(
    "loot",
    {
      mode: 0,
      level: 49,
      seed: 7,
      example: 0,
      quota: 1,
      step: 0,
      canDrop: 1,
      tags: 2,
      runs: 0,
      entry: 0,
      period: 4,
      phase: 2,
      count: 1,
      length: 2,
    },
    {
      mode: [0, 3],
      level: [1, 149],
      seed: [0, 65535],
      example: [0, 2],
      quota: [0, 5],
      step: [0, 10],
      canDrop: [0, 1],
      tags: [1, 3],
      runs: [0, 8],
      entry: [0, 7],
      period: [1, 40],
      phase: [0, 40, 0.1],
      count: [1, 3],
      length: [0, 10, 0.001],
    },
  );
  const level = state.level % 5 === 0 ? state.level + 1 : state.level,
    plan = createWavePlan(level),
    allocation = foodPlan(level, state.seed),
    carriers = carrierRequests(examples[state.example], state.quota),
    tags = assignLoot(lootTypes, state.tags, state.seed),
    tagStep = Math.min(state.step, tags.length),
    bag = tags[Math.max(0, tagStep - 1)],
    tagged = tags.slice(0, tagStep).map((row) => row.chosen);
  const phase = Math.min(state.phase, state.period),
    synthetic = f32(f32(f32(plan.count - 10) / 3) + 4),
    length = state.length || synthetic;
  let schedule: LootScheduleState = {
      length: 0,
      nextDrop: null,
      nextSchedule: 0,
    },
    emitted = 0;
  const history: {
    run: number;
    events: { kind: "schedule" | "drop"; at: number }[];
    emitted: number;
  }[] = [];
  for (let run = 0; run < state.runs; run++) {
    const next = advanceLootSchedule(
      schedule,
      length,
      state.period,
      phase,
      state.count,
    );
    schedule = next.state;
    emitted += next.emitted;
    history.push({ run: run + 1, events: next.events, emitted: next.emitted });
  }
  const [ref, width] = useCanvasWidth(),
    max = Math.max(16, schedule.nextSchedule + state.period),
    x = (value: number) => 30 + (value / max) * (width - 45);
  const quotaStep = Math.min(state.step, 7),
    consumed = carriers.filter(
      (row, i) => row.requested && quotaStep >= i * 3 + 2,
    ).length,
    marked = carriers.filter(
      (row, i) => row.carrier && quotaStep >= i * 3 + 3,
    ).length;
  return (
    <div>
      <div className="lab-tabs" role="tablist" aria-label={t("views")}>
        {tabs.map((key, index) => (
          <button
            role="tab"
            key={key}
            aria-selected={state.mode === index}
            onClick={() => set({ mode: index, step: 0 })}
          >
            {t(`tabs.${key}`)}
          </button>
        ))}
      </div>
      {state.mode === 0 ? (
        <>
          <p className="lab-intro">{t("quotaIntro")}</p>
          <div className="lab-controls">
            <LevelControl value={level} onChange={(level) => set({ level })} />
            <label>
              {c("seed")}
              <input
                type="number"
                min={0}
                max={65535}
                value={state.seed}
                onChange={(event) => set({ seed: Number(event.target.value) })}
              />
            </label>
            {[39, 41, 51, 54, 56].map((level) => (
              <button key={level} onClick={() => set({ level })}>
                L {level}
              </button>
            ))}
          </div>
          <div className="lab-columns">
            <div>
              <h3 className="lab-small-heading">FlagWaveSetupList</h3>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>MinLevel</th>
                    <th>FlagCount</th>
                    <th>{t("eligible")}</th>
                  </tr>
                </thead>
                <tbody>
                  {mechanismInputs.flagRows.map((row, i) => (
                    <tr
                      key={i}
                      className={row === allocation.chosen ? "selected" : ""}
                    >
                      <td>{row.MinLevel}</td>
                      <td>{row.FlagCount}</td>
                      <td>{row.MinLevel <= level ? "✓" : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div>
              <h3 className="lab-small-heading">PlantfoodSetupList</h3>
              <table className="lab-table">
                <thead>
                  <tr>
                    <th>MinLevel</th>
                    <th>Min</th>
                    <th>Max</th>
                  </tr>
                </thead>
                <tbody>
                  {mechanismInputs.foodRows.map((row, i) => (
                    <tr
                      key={i}
                      className={
                        row.MinLevel <= level &&
                        row.MinPlantfoodPerFlagWave === allocation.low
                          ? "selected"
                          : ""
                      }
                    >
                      <td>{row.MinLevel}</td>
                      <td>{row.MinPlantfoodPerFlagWave}</td>
                      <td>{row.MaxPlantfoodPerFlagWave}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <div className="lab-stat-grid">
            <Stat label={t("flagCount")} value={allocation.chosen.FlagCount} />
            <Stat
              label={t("bounds")}
              value={`${allocation.low} / ${allocation.high}`}
            />
            <Stat
              label={t("planned")}
              value={allocation.draws.reduce((a, b) => a + b, 0)}
              detail={allocation.draws.join(" + ")}
            />
          </div>
          <div className="lab-wave-strip quota-strip">
            {plan.waves.map((wave, i) => (
              <button
                key={i}
                className={allocation.quotas[i] ? "event" : ""}
                disabled
                style={{ "--color": "#bbd58d" } as React.CSSProperties}
              >
                {c("wave")} {wave.number}
                <strong>{allocation.quotas[i]}</strong>
              </button>
            ))}
          </div>
          <p className="lab-caption">{t("allocationDetail")}</p>
        </>
      ) : state.mode === 1 ? (
        <>
          <p className="lab-intro">{t("carrierIntro")}</p>
          <div className="lab-controls">
            <label>
              {t("case")}
              <select
                value={state.example}
                onChange={(event) =>
                  set({ example: Number(event.target.value), step: 0 })
                }
              >
                {examples.map((_, i) => (
                  <option value={i} key={i}>
                    {t(`examples.${phaseKeys[i]}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("inputQuota")}
              <input
                type="number"
                min={0}
                max={5}
                value={state.quota}
                onChange={(event) =>
                  set({ quota: Number(event.target.value), step: 0 })
                }
              />
            </label>
            <Toggle
              checked={!!state.canDrop}
              onChange={(checked) => set({ canDrop: Number(checked) })}
            >
              {t("canDrop")}
            </Toggle>
          </div>
          <Playback
            step={quotaStep}
            total={7}
            onChange={(step) => set({ step })}
          />
          <div className="carrier-track">
            {carriers.map((row, i) => {
              const inspected = quotaStep >= i * 3 + 1,
                requested = quotaStep >= i * 3 + 2,
                accepted = quotaStep >= i * 3 + 3;
              return (
                <div
                  key={i}
                  className={`carrier-row ${inspected ? "active" : ""}`}
                >
                  <div>
                    <span>{i + 1}</span>
                    <strong>{typeRecord(row.id).name[locale]}</strong>
                    <code>{row.id}</code>
                  </div>
                  <div className={inspected ? "active" : ""}>
                    <small>CanSpawnPlantFood</small>
                    <strong>{row.declared ? "true" : "false"}</strong>
                  </div>
                  <div className={requested ? "active" : ""}>
                    <small>{t("request")}</small>
                    <strong>
                      {requested ? (row.requested ? "−1" : t("skip")) : "—"}
                    </strong>
                  </div>
                  <div className={accepted ? "active" : ""}>
                    <small>{t("marker")}</small>
                    <strong>
                      {accepted
                        ? row.carrier
                          ? "✓"
                          : row.rejected
                            ? "×"
                            : "—"
                        : "—"}
                    </strong>
                  </div>
                  <div className={quotaStep === 7 ? "active" : ""}>
                    <small>{t("pickup")}</small>
                    <strong>
                      {quotaStep === 7 && state.canDrop && row.carrier
                        ? "●"
                        : "—"}
                    </strong>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="lab-stat-grid">
            <Stat label={t("remainingQuota")} value={state.quota - consumed} />
            <Stat label={t("accepted")} value={marked} />
            <Stat
              label={t("pickups")}
              value={quotaStep === 7 && state.canDrop ? marked : 0}
            />
          </div>
          <div className="lab-readout" aria-live="polite">
            <h3>{t(`carrierStages.${stepKeys[quotaStep]}`)}</h3>
            <p>
              {quotaStep === 7
                ? t("dropDetail")
                : quotaStep === 0
                  ? t("carrierStart")
                  : t("carrierStep", {
                      name: typeRecord(
                        carriers[Math.floor((quotaStep - 1) / 3)].id,
                      ).name[locale],
                      phase: t(
                        `carrierPhases.${phaseKeys[(quotaStep - 1) % 3]}`,
                      ),
                    })}
            </p>
          </div>
        </>
      ) : state.mode === 2 ? (
        <>
          <p className="lab-intro">{t("tagsIntro")}</p>
          <div className="lab-controls">
            <label>
              {c("seed")}
              <input
                type="number"
                min={0}
                max={65535}
                value={state.seed}
                onChange={(event) =>
                  set({ seed: Number(event.target.value), step: 0 })
                }
              />
            </label>
            <label>
              {t("tagCount")}
              <input
                type="number"
                min={1}
                max={3}
                value={state.tags}
                onChange={(event) =>
                  set({ tags: Number(event.target.value), step: 0 })
                }
              />
            </label>
          </div>
          <Playback
            step={tagStep}
            total={tags.length}
            onChange={(step) => set({ step })}
          />
          <div className="lab-stage">
            <div className="loot-weight-bag">
              {lootTypes.map((id, index) => (
                <div
                  key={id}
                  style={{
                    width: `${bag.remaining.includes(index) ? (typeNumber(id, "WavePointCost") / bag.total) * 100 : 0}%`,
                    background: ["#b7ce9b", "#d8b577", "#99b8c0"][index],
                  }}
                >
                  <span>{index + 1}</span>
                </div>
              ))}
            </div>
            <div className="bag-scale">
              <span>0</span>
              <span>{bag.total}</span>
            </div>
            {tagStep > 0 && (
              <div
                className="loot-draw-marker"
                style={{ left: `${(bag.draw / bag.total) * 100}%` }}
              >
                {t("draw", { n: bag.draw })}
              </div>
            )}
          </div>
          <table className="lab-table">
            <thead>
              <tr>
                <th>{t("type")}</th>
                <th>WavePointCost</th>
                <th>Weight</th>
                <th>{t("tag")}</th>
              </tr>
            </thead>
            <tbody>
              {lootTypes.map((id, index) => (
                <tr
                  key={id}
                  className={tagged.includes(index) ? "selected" : ""}
                >
                  <td>{typeRecord(id).name[locale]}</td>
                  <td>{typeNumber(id, "WavePointCost")}</td>
                  <td>{typeNumber(id, "Weight")}</td>
                  <td>
                    {tagged.includes(index)
                      ? `${tagged.indexOf(index) + 1} → ${tagged.indexOf(index) === 0 ? "coin_silver" : "coin_gold"}`
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="lab-caption">{t("tagsDetail")}</p>
        </>
      ) : (
        <>
          <p className="lab-intro">{t("scheduleIntro")}</p>
          <div className="lab-controls">
            <label>
              {t("entry")}
              <select
                value={state.entry}
                onChange={(event) => {
                  const entry = Number(event.target.value),
                    row = mechanismInputs.lootEntries[entry - 1];
                  set(
                    row
                      ? {
                          entry,
                          period: row.Period,
                          phase: row.Period / 2,
                          count: row.Min,
                          runs: 0,
                        }
                      : { entry: 0, runs: 0 },
                  );
                }}
              >
                <option value={0}>{t("custom")}</option>
                {mechanismInputs.lootEntries.map((row, i) => (
                  <option value={i + 1} key={row.UniqueId}>
                    {row.UniqueId}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("length")}
              <input
                type="number"
                min={0}
                max={10}
                step={0.001}
                value={state.length}
                onChange={(event) =>
                  set({ length: Number(event.target.value), runs: 0 })
                }
              />
            </label>
            <label>
              Period
              <input
                type="number"
                min={1}
                max={40}
                value={state.period}
                onChange={(event) =>
                  set({
                    period: Number(event.target.value),
                    phase: Math.min(state.phase, Number(event.target.value)),
                    entry: 0,
                    runs: 0,
                  })
                }
              />
            </label>
            <label>
              {t("phase")}
              <input
                type="number"
                min={0}
                max={state.period}
                step={0.1}
                value={phase}
                onChange={(event) =>
                  set({ phase: Number(event.target.value), runs: 0 })
                }
              />
            </label>
            <label>
              {t("drawnCount")}
              <input
                type="number"
                min={1}
                max={3}
                value={state.count}
                onChange={(event) =>
                  set({ count: Number(event.target.value), runs: 0 })
                }
              />
            </label>
          </div>
          <div className="lab-controls">
            <button
              onClick={() => set({ runs: state.runs + 1 })}
              disabled={state.runs >= 8}
            >
              {t("planNext")}
            </button>
            <button onClick={() => set({ runs: 0 })}>{c("reset")}</button>
            <button
              onClick={() =>
                set({
                  entry: 0,
                  length: 2,
                  period: 4,
                  phase: 2,
                  count: 1,
                  runs: 1,
                })
              }
            >
              {t("equality")}
            </button>
            <button
              onClick={() => set({ entry: 0, length: 0, runs: 0 })}
            >
              {t("waveLength", { count: plan.count })}
            </button>
          </div>
          <div className="lab-stage" ref={ref}>
            <svg
              viewBox={`0 0 ${width} 150`}
              role="img"
              aria-label={t("scheduleDiagram")}
            >
              <line x1="30" x2={width - 15} y1="75" y2="75" stroke="#78996b" />
              {Array.from(
                { length: Math.min(20, Math.floor(max / state.period) + 1) },
                (_, i) => i * state.period,
              ).map((time) => (
                <g key={time}>
                  <line
                    x1={x(time)}
                    x2={x(time)}
                    y1="30"
                    y2="110"
                    className="lab-axis"
                  />
                  <text
                    x={x(time)}
                    y="131"
                    textAnchor="middle"
                    className="lab-axis-label"
                  >
                    {time}
                  </text>
                </g>
              ))}
              {history.flatMap((run) =>
                run.events
                  .filter((event) => event.kind === "drop")
                  .map((event, i) => (
                    <circle
                      key={`${run.run}-${i}`}
                      cx={x(event.at)}
                      cy="75"
                      r="6"
                      fill="#d8b575"
                    />
                  )),
              )}
              {schedule.nextDrop !== null && (
                <circle
                  cx={x(schedule.nextDrop)}
                  cy="75"
                  r="7"
                  fill="none"
                  stroke="#d8b575"
                  strokeWidth="2"
                />
              )}
              <g
                className="lab-token"
                style={{ transform: `translate(${x(schedule.length)}px,0)` }}
              >
                <line
                  x1="0"
                  x2="0"
                  y1="20"
                  y2="105"
                  stroke="#edf3d5"
                  strokeWidth="2"
                />
                <path d="M-4 18 L4 18 L0 25Z" fill="#edf3d5" />
              </g>
            </svg>
          </div>
          <div className="lab-stat-grid">
            <Stat
              label="LevelLengthsPlayed"
              value={schedule.length.toFixed(3)}
            />
            <Stat
              label="NextDropTime"
              value={
                schedule.nextDrop === null ? "∞" : schedule.nextDrop.toFixed(3)
              }
            />
            <Stat
              label="NextScheduleTime"
              value={schedule.nextSchedule.toFixed(3)}
            />
          </div>
          <div className="lab-readout">
            <h3>{t("emitted", { n: emitted })}</h3>
            <p>
              {t("scheduleDetail", {
                length: length.toFixed(3),
                phase,
                count: state.count,
              })}
            </p>
          </div>
          <table className="lab-table">
            <thead>
              <tr>
                <th>{t("planningCall")}</th>
                <th>{t("events")}</th>
                <th>{t("emittedColumn")}</th>
              </tr>
            </thead>
            <tbody>
              {history.map((run) => (
                <tr key={run.run}>
                  <td>{run.run}</td>
                  <td>
                    {run.events
                      .map((event) => `${t(event.kind)} ${event.at.toFixed(2)}`)
                      .join(" → ") || "—"}
                  </td>
                  <td>{run.emitted}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}
