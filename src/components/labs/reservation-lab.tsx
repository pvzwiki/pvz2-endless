"use client";
import { useLocale, useTranslations } from "next-intl";
import { fillBudget } from "@/lib/roster-model";
import { typeNumber, typeRecord } from "@/lib/mechanism-model";
import { Playback, Stat, Toggle, useParameters } from "./lab-controls";
const ids = [
  "mummy",
  "mummy_armor1",
  "mummy_armor2",
  "tomb_raiser",
  "egypt_gargantuar_danger",
];
export default function ReservationLab() {
  const t = useTranslations("labs.reservation"),
    c = useTranslations("labs"),
    locale = useLocale();
  const [state, set] = useParameters(
    "reservation",
    { budget: 200, unseen: 18, seed: 1, step: 0 },
    { budget: [0, 30000], unseen: [0, 31], seed: [0, 65535], step: [0, 400] },
  );
  const types = ids.map((id) => ({
    id,
    cost: typeNumber(id, "WavePointCost"),
    weight: typeNumber(id, "Weight"),
  }));
  let remaining = state.budget;
  const reserved: string[] = [];
  const passes = types
    .filter((_, index) => state.unseen & (1 << index))
    .map((type) => {
      const before = remaining,
        accepted = type.cost < remaining;
      if (accepted) {
        remaining -= type.cost;
        reserved.push(type.id);
      }
      return {
        id: type.id,
        cost: type.cost,
        before,
        after: remaining,
        accepted,
      };
    });
  const filler = fillBudget(remaining, types, state.seed),
    total = passes.length + filler.steps.length,
    step = Math.min(state.step, total);
  const currentPass =
    step > 0 && step <= passes.length ? passes[step - 1] : null;
  const fillStep =
    step > passes.length ? filler.steps[step - passes.length - 1] : null;
  const seenPasses = passes.slice(0, Math.min(step, passes.length)),
    visible = [
      ...seenPasses.filter((row) => row.accepted).map((row) => row.id),
      ...filler.steps
        .slice(0, Math.max(0, step - passes.length))
        .map((row) => row.chosen.id),
    ];
  const balance = fillStep?.after ?? currentPass?.after ?? state.budget;
  return (
    <div>
      <p className="lab-intro">{t("intro")}</p>
      <div className="lab-controls">
        <label>
          {t("budget")}
          <input
            type="number"
            min={0}
            max={30000}
            value={state.budget}
            onChange={(event) =>
              set({ budget: Number(event.target.value), step: 0 })
            }
          />
        </label>
        <label>
          {c("seed")}
          <input
            type="number"
            value={state.seed}
            min={0}
            max={65535}
            onChange={(event) =>
              set({ seed: Number(event.target.value), step: 0 })
            }
          />
        </label>
        <button onClick={() => set({ budget: 200, unseen: 2, step: 0 })}>
          {t("exact")}
        </button>
        <button onClick={() => set({ budget: 600, unseen: 6, step: 0 })}>
          {t("orderCase")}
        </button>
      </div>
      <div className="lab-table-scroll">
        <table className="lab-table">
          <thead>
            <tr>
              <th>{t("type")}</th>
              <th>{c("cost")}</th>
              <th>{t("unseen")}</th>
              <th>{t("reservation")}</th>
              <th>{t("filler")}</th>
            </tr>
          </thead>
          <tbody>
            {types.map((type, index) => (
              <tr
                key={type.id}
                className={currentPass?.id === type.id ? "selected" : ""}
              >
                <td>{typeRecord(type.id).name[locale]}</td>
                <td>{type.cost}</td>
                <td>
                  <Toggle
                    checked={!!(state.unseen & (1 << index))}
                    onChange={(value) =>
                      set({
                        unseen: value
                          ? state.unseen | (1 << index)
                          : state.unseen & ~(1 << index),
                        step: 0,
                      })
                    }
                  >
                    <span className="sr-only">
                      {t("unseenType", {
                        name: typeRecord(type.id).name[locale],
                      })}
                    </span>
                  </Toggle>
                </td>
                <td>
                  {type.cost} &lt; {balance}
                </td>
                <td>
                  {type.cost} ≤ {balance}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Playback step={step} total={total} onChange={(step) => set({ step })} />
      <div className="lab-stat-grid">
        <Stat
          label={t("phase")}
          value={
            step === 0
              ? t("ready")
              : step <= passes.length
                ? t("reservation")
                : t("filler")
          }
        />
        <Stat label={t("remaining")} value={balance.toLocaleString(locale)} />
        <Stat label={t("inserted")} value={visible.length} />
      </div>
      <div className="lab-readout" aria-live="polite">
        <h3>
          {currentPass
            ? currentPass.accepted
              ? t("accepted")
              : t("rejected")
            : fillStep
              ? t("drawn")
              : t("ready")}
        </h3>
        <p>
          {currentPass
            ? t("passDetail", {
                name: typeRecord(currentPass.id).name[locale],
                cost: currentPass.cost,
                before: currentPass.before,
                after: currentPass.after,
              })
            : fillStep
              ? t("fillDetail", {
                  name: typeRecord(fillStep.chosen.id).name[locale],
                  cost: fillStep.chosen.cost,
                  before: fillStep.before,
                  after: fillStep.after,
                })
              : t("startDetail")}
        </p>
      </div>
      <div className="lab-stage reservation-result">
        <span className="eyebrow">{t("result")}</span>
        <div className="pipeline-instructions">
          {visible.map((id, index) => (
            <div className="pipeline-token" key={`${id}-${index}`}>
              <span>{index + 1}</span>
              <strong>{typeRecord(id).name[locale]}</strong>
              <small>
                {index < seenPasses.filter((row) => row.accepted).length
                  ? t("reservation")
                  : t("filler")}
              </small>
            </div>
          ))}
        </div>
        {!visible.length && <p className="lab-caption">{t("empty")}</p>}
      </div>
      <p className="lab-caption">{t("explanation")}</p>
    </div>
  );
}
