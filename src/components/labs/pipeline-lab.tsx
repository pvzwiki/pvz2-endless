"use client";
import { useLocale, useTranslations } from "next-intl";
import { createWavePlan } from "@/lib/wave-model";
import { egypt, selectTypes, fillBudget } from "@/lib/roster-model";
import {
  entityStrength,
  levelRequest,
  typeRecord,
  waveThreshold,
} from "@/lib/mechanism-model";
import {
  LevelControl,
  Playback,
  Stat,
  Toggle,
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
    { level: 36, wave: 5, step: 0, leader: 1 },
    { level: [1, 149], wave: [1, 15], step: [0, 9], leader: [0, 1] },
  );
  const level = state.level % 5 === 0 ? state.level + 1 : state.level,
    plan = createWavePlan(level),
    wave = plan.waves[Math.min(state.wave, plan.count) - 1];
  const selected = selectTypes(level, 7).selected.map((id) =>
    egypt.types.find((type) => type.id === id)!,
  );
  const filled = fillBudget(wave.budget, selected, 8);
  const added =
    state.leader === 1 && level >= 4
      ? selected.find((type) => type.cost > 100)
      : undefined;
  const flag = wave.flag || wave.final;
  const request = levelRequest(level),
    roster = filled.steps.map((row) => ({ id: row.chosen.id, leader: false }));
  if (state.step >= 4 && added) roster.push({ id: added.id, leader: true });
  if (state.step >= 6 && flag) roster.push({ id: "mummy_flag", leader: false });
  const health = roster.reduce((sum, row) => {
    const stats = entityStrength(row.id, request.lower, row.leader);
    return sum + stats.body + stats.helmet;
  }, 0);
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
        <Toggle
          checked={!!state.leader}
          onChange={(value) => set({ leader: Number(value) })}
        >
          {t("leaderInput")}
        </Toggle>
      </div>
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
          detail={`100 + (30 + 5 × ${level}) × ${wave.index}`}
        />
        <Stat
          label={t("spent")}
          value={
            state.step >= 3
              ? (wave.budget - filled.remaining).toLocaleString(locale)
              : "—"
          }
          detail={t("left", { n: filled.remaining })}
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
              ? `T (q = 0.8) = ${waveThreshold(health, 0.8).toLocaleString(locale)}`
              : t("flagExtra", { n: state.step >= 6 && flag ? 1 : 0 })
          }
        />
      </div>
      <div className="lab-stage">
        <div className="pipeline-instructions" data-stage={state.step}>
          {(state.step >= 3
            ? roster
            : selected.map((type) => ({ id: type.id, leader: false }))
          ).map((item, index) => (
            <div
              className={`pipeline-token ${item.leader ? "leader" : ""} ${state.step >= 7 ? "entity" : ""}`}
              key={`${item.id}-${index}`}
              style={{ animationDelay: `${Math.min(index, 20) * 15}ms` }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <strong>{typeRecord(item.id).name[locale]}</strong>
              {state.step >= 7 ? (
                <small>
                  {t("entityLevel", { n: request.lower })}
                  {item.leader ? " ★" : ""}
                </small>
              ) : (
                <small>
                  {typeRecord(item.id).values.WavePointCost} {c("cost")}
                </small>
              )}
            </div>
          ))}
        </div>
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
