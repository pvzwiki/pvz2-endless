"use client";
import { useLocale, useTranslations } from "next-intl";
import {
  applyJams,
  jamNames,
  rosterCost,
  typeRecord,
  type VisualInstruction,
} from "@/lib/mechanism-model";
import { useMemo } from "react";
import { generateOrdinaryRosters } from "@/lib/roster-simulation";
import {
  LevelControl,
  Playback,
  Stat,
  useParameters,
  useCanvasWidth,
} from "./lab-controls";
const marks: Record<string, string> = {
  eighties: "BA",
  eighties_armor1: "A1",
  eighties_armor2: "A2",
  eighties_punk: "PU",
  eighties_gargantuar_danger: "GA",
  eighties_glitter: "GL",
  eighties_mc: "MC",
  eighties_breakdancer: "BR",
  eighties_arcade: "AR",
  eighties_imp: "IM",
  eighties_boombox: "BO",
};
const colors = ["#bca3c9", "#dca07e", "#caba71", "#8bb9b4", "#98a9d0"];
export default function JamLab() {
  const t = useTranslations("labs.jam"),
    c = useTranslations("labs"),
    locale = useLocale();
  const [state, set] = useParameters(
    "jam",
    { level: 36, seed: 7, event: 0, step: 0 },
    { level: [1, 149], seed: [0, 65535], event: [0, 14], step: [0, 30] },
  );
  const level = state.level;
  const { generated, out } = useMemo(() => {
    const generated = generateOrdinaryRosters('eighties', level, state.seed);
    const out = applyJams(level, generated.waves.map((wave) => wave.instructions), state.seed + 1);
    return { generated, out };
  }, [level, state.seed]);
  const { plan } = generated;
  const event = out.events[Math.min(state.event, out.events.length - 1)],
    step = Math.min(state.step, event.frames.length - 1),
    frame = event.frames[step],
    before = event.frames[0].roster;
  const [canvas, width] = useCanvasWidth();
  const columns = Math.max(4, Math.floor((width - 10) / 64)),
    cell = (width - 10) / columns;
  const rosterRows = Math.ceil(before.length / columns),
    shelfY = rosterRows * 61 + 44,
    height = shelfY + Math.ceil(event.replacement_count / columns) * 61 + 30;
  const locate = (index: number, y = 0) => ({
    x: 5 + (index % columns) * cell,
    y: 10 + Math.floor(index / columns) * 61 + y,
  });
  const removedFinal =
    event.frames.filter((row) => row.kind === "remove").at(-1)?.removed ?? [];
  const tokenState = (original: VisualInstruction) => {
    const direct = frame.roster.findIndex((row) => row.key === original.key);
    if (direct >= 0) return { ...original, ...locate(direct), removed: false };
    const removedIndex = removedFinal.findIndex(
      (row) => row.key === original.key,
    );
    const replacementIndex = frame.roster.findIndex(
      (row) => row.key === `w${event.wave - 1}-new${removedIndex}`,
    );
    if (replacementIndex >= 0)
      return {
        ...frame.roster[replacementIndex],
        ...locate(replacementIndex),
        removed: false,
      };
    const shelfIndex = frame.removed.findIndex(
      (row) => row.key === original.key,
    );
    return {
      ...original,
      ...locate(Math.max(0, shelfIndex), shelfY),
      removed: true,
    };
  };
  const eventName = (jam: (typeof jamNames)[number]) => t(`names.${jam}`);
  return (
    <div>
      <p className="lab-intro">{t("intro")}</p>
      <div className="lab-controls">
        <LevelControl
          value={level}
          onChange={(level) => set({ level, event: 0, step: 0 })}
        />
        <label>
          {c("seed")}
          <input
            type="number"
            min={0}
            max={65535}
            value={state.seed}
            onChange={(event) =>
              set({ seed: Number(event.target.value), event: 0, step: 0 })
            }
          />
        </label>
        <button
          onClick={() =>
            set({ seed: (state.seed + 1) % 65536, event: 0, step: 0 })
          }
        >
          {t("newSeed")}
        </button>
        {[6, 7, 14, 16, 49, 51].map((value) => (
          <button
            key={value}
            aria-pressed={level === value}
            onClick={() => set({ level: value, event: 0, step: 0 })}
          >
            L {value}
          </button>
        ))}
      </div>
      <div className="lab-chip-list">
        {jamNames.map((jam, index) => (
          <span
            key={jam}
            className={`lab-chip ${out.selected.includes(index) ? "selected" : "dim"}`}
            style={{ "--color": colors[index] } as React.CSSProperties}
          >
            <i />
            {eventName(jam)}
            {index >= out.available ? ` · ${t("unavailable")}` : ""}
          </span>
        ))}
      </div>
      <p className="lab-caption">
        {t("selectedDetail", {
          n: out.selected.length,
          first: out.first.value + 1,
        })}
      </p>
      <div className="lab-wave-strip">
        {plan.waves.map((wave) => {
          const index = out.events.findIndex(
              (item) => item.wave === wave.number,
            ),
            item = out.events[index];
          return (
            <button
              key={wave.number}
              className={item ? "event" : ""}
              disabled={!item}
              aria-pressed={event.wave === wave.number}
              aria-label={t("inspectWave", { n: wave.number })}
              style={
                {
                  "--color": item ? colors[jamNames.indexOf(item.jam)] : "#aaa",
                } as React.CSSProperties
              }
              onClick={() => set({ event: index, step: 0 })}
            >
              {String(wave.number).padStart(2, "0")}
              <strong>{item ? eventName(item.jam) : "—"}</strong>
            </button>
          );
        })}
      </div>
      <div className="lab-columns">
        <div>
          <div className="lab-step-title">
            <span>{String(event.wave).padStart(2, "0")}</span>
            <div>
              <h3>
                {eventName(event.jam)} ·{" "}
                {typeRecord(event.replacement_type).name[locale]}
              </h3>
              <p>
                {t("eventDetail", {
                  n: event.replacement_count,
                  first: event.amount.first,
                  second: event.amount.second,
                  alpha: event.amount.alpha.toFixed(3),
                  spacing: event.spacing.value,
                })}
              </p>
            </div>
          </div>
        </div>
        <div className="lab-readout">
          <dl>
            <div>
              <dt>{t("count")}</dt>
              <dd>
                {before.length} → {frame.roster.length}
              </dd>
            </div>
            <div>
              <dt>{t("cost")}</dt>
              <dd>
                {rosterCost(before).toLocaleString(locale)} →{" "}
                {rosterCost(frame.roster).toLocaleString(locale)}
              </dd>
            </div>
            <div>
              <dt>{t("leaders")}</dt>
              <dd>
                {before.filter((row) => row.leader).length} →{" "}
                {frame.roster.filter((row) => row.leader).length}
              </dd>
            </div>
          </dl>
        </div>
      </div>
      <Playback
        step={step}
        total={event.frames.length - 1}
        onChange={(step) => set({ step })}
      />
      <div className="lab-note" aria-live="polite">
        {frame.kind === "before"
          ? t("beforeDetail")
          : frame.kind === "remove"
            ? t("removeDetail", {
                n: (frame.picked ?? 0) + 1,
                level: frame.removed.at(-1)!.level,
              })
            : t("appendDetail", { type: event.replacement_type })}
      </div>
      <div className="lab-stage jam-board" ref={canvas}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={t("diagram")}
        >
          <text x="5" y={shelfY - 3} className="lab-axis-label">
            {t("savedLevels")}
          </text>
          <line
            x1="5"
            x2={width - 10}
            y1={shelfY - 17}
            y2={shelfY - 17}
            className="lab-axis"
          />
          {before.map((original, index) => {
            const item = tokenState(original),
              isNew = item.key !== original.key;
            return (
              <g
                className="lab-token"
                key={original.key}
                data-level={item.level}
                data-type={item.zombie}
                data-leader={item.leader}
                data-replaced={isNew}
                style={{
                  transform: `translate(${item.x}px,${item.y}px)`,
                  opacity: item.removed ? 0.45 : 1,
                }}
              >
                <title>{`${typeRecord(item.zombie).name[locale]} · level ${item.level}`}</title>
                <rect
                  width={cell - 8}
                  height="53"
                  rx="5"
                  fill={
                    isNew
                      ? colors[jamNames.indexOf(event.jam)]
                      : item.leader
                        ? "#dbba75"
                        : "#bad2a5"
                  }
                  stroke={item.leader ? "#f2e4ba" : "none"}
                />
                <text
                  x={(cell - 8) / 2}
                  y="13"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#43603b"
                >
                  {isNew ? t("new") : String(index + 1).padStart(2, "0")}
                  {item.leader ? " ★" : ""}
                </text>
                <text
                  x={(cell - 8) / 2}
                  y="29"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#17351e"
                >
                  {marks[item.zombie] || "Z"}
                </text>
                <text
                  x={(cell - 8) / 2}
                  y="44"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#304b2e"
                >
                  Lv {item.level}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
      <div className="lab-chip-list">
        {[
          ...new Set([
            ...before.map((row) => row.zombie),
            event.replacement_type,
          ]),
        ].map((id) => (
          <span className="lab-chip" key={id}>
            {marks[id]} · {typeRecord(id).name[locale]}
          </span>
        ))}
      </div>
      <p className="lab-caption">{t("inputDetail")}</p>
      <details className="lab-details">
        <summary>{t("generationDetails")}</summary>
        <p>{t("selectedTypes", { names: generated.types.map((type) => typeRecord(type.id).name[locale]).join(" · ") })}</p>
        <p>{t("budgetDetail", {
          budget: generated.waves[event.wave - 1].budget,
          remaining: generated.waves[event.wave - 1].remaining,
          reserved: generated.waves[event.wave - 1].reserved.length,
          leaders: generated.waves[event.wave - 1].leader ? 1 : 0,
        })}</p>
      </details>
      <details className="lab-details">
        <summary>{t("subsetTrace")}</summary>
        <p>{t("subsetExplanation")}</p>
        <div className="lab-chip-list">
          {out.selectionDraws.map((draw, index) => (
            <span
              key={index}
              className={`lab-chip ${draw.accepted ? "" : "dim"}`}
            >
              {index + 1}. {eventName(jamNames[draw.candidate])}{" "}
              {draw.accepted ? "✓" : "↻"}
            </span>
          ))}
        </div>
      </details>
    </div>
  );
}
