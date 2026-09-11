"use client";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { generateOrdinaryRosters } from "@/lib/roster-simulation";
import { waveHealth } from "@/lib/wave-health";
import {
  entityStrength,
  typeRecord,
} from "@/lib/mechanism-model";
import {
  LevelControl,
  Playback,
  Stat,
  useParameters,
} from "./lab-controls";
const stages = [
  "inputs",
  "budget",
  "types",
  "fill",
  "extra",
  "world",
  "flag",
  "entities",
  "placement",
  "snapshot",
] as const;
export default function PipelineLab() {
  const t = useTranslations("labs.pipeline"),
    c = useTranslations("labs"),
    locale = useLocale();
  const [state, set] = useParameters(
    "pipeline",
    { level: 36, wave: 5, step: 0, seed: 7 },
    { level: [1, 149], wave: [1, 15], step: [0, 9], seed: [0, 65535] },
  );
  const level = state.level;
  const generated = useMemo(() => generateOrdinaryRosters('egypt', level, state.seed), [level, state.seed]);
  const { plan, types: selected, leaderAttempt } = generated;
  const wave = generated.waves[Math.min(state.wave, plan.count) - 1];
  const roster = state.step >= 4 ? wave.instructions : wave.paid;
  const health = waveHealth(roster.map((row) =>
    entityStrength(row.zombie, row.level, row.leader),
  )).reported;
  return (
    <div>
      <p className="lab-intro">{t("intro")}</p>
      <div className="lab-controls">
        <LevelControl
          value={level}
          onChange={(value) => set({ level: value, wave: 1, step: 0 })}
        />
        <label>
          {c("wave")}
          <select
            value={wave.number}
            onChange={(event) =>
              set({ wave: Number(event.target.value), step: 0 })
            }
          >
            {plan.waves.map((row) => (
              <option value={row.number} key={row.number}>
                {row.number}
              </option>
            ))}
          </select>
        </label>
        <label>
          {c("seed")}
          <input type="number" min={0} max={65535} value={state.seed}
            onChange={(event) => set({ seed: Number(event.target.value), step: 0 })} />
        </label>
        <button onClick={() => set({ seed: (state.seed + 1) % 65536, step: 0 })}>
          {t("newSeed")}
        </button>
      </div>
      <p className="lab-note" data-testid="leader-attempt">
        {leaderAttempt.roll === null ? t("noLeaderAttempt") : t("leaderOutcome", {
          roll: leaderAttempt.roll,
          threshold: leaderAttempt.threshold,
          wave: leaderAttempt.wave ?? "—",
        })}
      </p>
      <div className="pipeline-route">
        {stages.map((key, index) => (
          <button
            key={key}
            aria-pressed={state.step === index}
            className={index <= state.step ? "passed" : ""}
            onClick={() => set({ step: index })}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            {t(`stages.${key}`)}
            <i aria-hidden="true">→</i>
          </button>
        ))}
      </div>
      <Playback
        step={state.step}
        total={9}
        onChange={(step) => set({ step })}
      />
      <div className="lab-step-title">
        <span>{String(state.step + 1).padStart(2, "0")}</span>
        <div>
          <h3>{t(`stages.${stages[state.step]}`)}</h3>
          <p>{t(`explain.${stages[state.step]}`)}</p>
        </div>
      </div>
      <div className="lab-stat-grid">
        <Stat
          label={t("budget")}
          value={wave.budget.toLocaleString(locale)}
          detail={`⌊(100 + (30 + 5 × ${level}) × ${wave.index}) × ${wave.flag || wave.final ? 2.5 : 1}⌋`}
        />
        <Stat
          label={t("spent")}
          value={
            state.step >= 3
              ? (wave.budget - wave.remaining).toLocaleString(locale)
              : "—"
          }
          detail={t("left", { n: wave.remaining })}
        />
        <Stat
          label={state.step < 9 ? t("count") : t("health")}
          value={
            state.step < 3
              ? "—"
              : state.step < 9
                ? roster.length
                : health.toLocaleString(locale)
          }
          detail={
            state.step === 9
              ? t("subtotalDetail")
              : t("flagExtra", { n: state.step >= 6 && wave.flagType ? 1 : 0 })
          }
        />
      </div>
      <div className="lab-stage">
        <div className="pipeline-instructions" data-stage={state.step}>
          {(state.step >= 3
            ? roster
            : selected.map((type) => ({ zombie: type.id, level: 1, leader: false }))
          ).map((item, index) => (
            <div
              className={`pipeline-token ${item.leader ? "leader" : ""} ${state.step >= 7 ? "entity" : ""}`}
              key={`${item.zombie}-${index}`}
              style={{ animationDelay: `${Math.min(index, 20) * 15}ms` }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{typeRecord(item.zombie).name[locale]}</strong>
              {state.step >= 7 ? (
                <small>
                  {t("entityLevel", { n: item.level })}
                  {item.leader ? " ★" : ""}
                </small>
              ) : (
                <small>
                  {typeRecord(item.zombie).values.WavePointCost} {c("cost")}
                </small>
              )}
            </div>
          ))}
        </div>
        {state.step >= 6 && wave.flagType && <p className="lab-note" data-testid="independent-flag">
          {t("separateFlag", { name: typeRecord(wave.flagType).name[locale] })}
        </p>}
        {wave.final && state.step >= 3 && <p className="lab-caption">
          {t("reservationDetail", { n: wave.reserved.length })}
        </p>}
        <p className="lab-caption">
          {state.step >= 7
            ? t("entitiesCaption")
            : state.step >= 3
              ? t("instructionsCaption")
              : t("typesCaption")}
        </p>
      </div>
    </div>
  );
}
