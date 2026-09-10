"use client";
import { useTranslations } from "next-intl";
import {
  mechanismInputs,
  eligibleRows,
  initialHistory,
  rowWeights,
  updateRowHistory,
  specialPlacement,
  typeRecord,
} from "@/lib/mechanism-model";
import {
  Playback,
  Stat,
  Toggle,
  useCanvasWidth,
  useParameters,
} from "./lab-controls";
const cases = [
  ["egypt", "mummy", "egypt"],
  [
    "pirate",
    mechanismInputs.worlds.find((w) => w.id === "pirate")!.basic,
    "pirate",
  ],
  ["pirate", "seagull", "seagull"],
  ["pirate", "cannon", "cannon"],
  ["future", "disco_mech", "future"],
  ["skycity", "invisible_plane", "plane3"],
  ["skycity", "skycity_twinsplane", "plane2"],
] as const;
const stepKeys = ["0", "1", "2", "3", "4"] as const,
  explanationKeys = ["0", "1", "2", "3"] as const;
const specialTypes = ["ordinary", "king", "fisherman"] as const;
export default function PlacementLab() {
  const t = useTranslations("labs.placement");
  const [state, set] = useParameters(
    "placement",
    {
      mode: 0,
      case: 0,
      choices: 0,
      step: 0,
      type: 2,
      row: 1,
      occupied: 0,
      circle: 1,
      seed: 7,
      queue: 1,
      jitter: 12,
    },
    {
      mode: [0, 1],
      case: [0, 6],
      choices: [0, 555555555555],
      step: [0, 12],
      type: [0, 2],
      row: [0, 4],
      occupied: [0, 31],
      circle: [0, 1],
      seed: [0, 65535],
      queue: [0, 2],
      jitter: [0, 29],
    },
  );
  const [world, id] = cases[state.case],
    enabled = eligibleRows(world, id),
    eligible = enabled.flatMap((on, i) => (on ? [i] : []));
  const choices = state.choices
    ? String(state.choices)
        .split("")
        .map(Number)
        .map((n) => n - 1)
        .filter((row) => row >= 0 && row < 5 && enabled[row])
    : [];
  const rowStep = Math.min(state.step, choices.length);
  let history = initialHistory();
  for (const row of choices.slice(0, rowStep))
    history = updateRowHistory(history, enabled, row);
  const weights = rowWeights(history, enabled),
    kind = specialTypes[state.type],
    occupied = [0, 1, 2, 3, 4].filter((row) => state.occupied & (1 << row));
  const placement = specialPlacement(kind, state.row, occupied, !!state.circle, state.seed),
    step = Math.min(state.step, 4);
  const final = placement.final;
  const row =
    step < 2
      ? state.row
      : step < 4
        ? placement.afterCircle
        : (final ?? placement.afterCircle);
  const [ref, width] = useCanvasWidth(),
    left = 35,
    span = width - 55,
    x = (column: number) => left + ((column + 0.5) / 14) * span,
    y = (row: number) => 35 + row * 50;
  const typeId =
    kind === "king"
      ? "dark_king"
      : kind === "fisherman"
        ? "beach_fisherman"
        : "mummy";
  const hitRect = typeRecord(typeId).values.HitRect as { mWidth: number };
  const baseX = 820 + hitRect.mWidth,
    jitterX = baseX + 80 * state.queue + state.jitter;
  let positionX = step === 0 ? baseX : jitterX;
  if (step >= 2 && state.circle) positionX = 744;
  if (step >= 4 && kind !== "ordinary" && final !== null) positionX = 744;
  const px = left + ((positionX - 200) / 64 / 14) * span;
  const append = (row: number) => {
    const sequence = [...choices.slice(0, rowStep), row];
    if (sequence.length <= 12)
      set({
        choices: Number(sequence.map((n) => n + 1).join("")),
        step: sequence.length,
      });
  };
  const preset = (same: boolean) => {
    const a = eligible[0],
      b = eligible[Math.min(1, eligible.length - 1)];
    set({ choices: Number(`${a + 1}${(same ? a : b) + 1}`), step: 2 });
  };
  return (
    <div>
      <div className="lab-tabs" role="tablist" aria-label={t("views")}>
        <button
          role="tab"
          aria-selected={state.mode === 0}
          onClick={() => set({ mode: 0, step: choices.length })}
        >
          {t("history")}
        </button>
        <button
          role="tab"
          aria-selected={state.mode === 1}
          onClick={() => set({ mode: 1, step: 0 })}
        >
          {t("hooks")}
        </button>
      </div>
      {state.mode === 0 ? (
        <>
          <p className="lab-intro">{t("historyIntro")}</p>
          <div className="lab-controls">
            <label>
              {t("case")}
              <select
                value={state.case}
                onChange={(event) =>
                  set({ case: Number(event.target.value), choices: 0, step: 0 })
                }
              >
                {cases.map((row, index) => (
                  <option key={row[2]} value={index}>
                    {t(`cases.${row[2]}`)}
                  </option>
                ))}
              </select>
            </label>
            <button onClick={() => preset(false)}>{t("different")}</button>
            <button onClick={() => preset(true)}>{t("same")}</button>
            <button onClick={() => set({ choices: 0, step: 0 })}>
              {t("clearHistory")}
            </button>
          </div>
          <div className="lab-stage">
            <div className="row-weight-bars">
              {weights.map((value, index) => (
                <div
                  key={index}
                  className={!enabled[index] ? "ineligible" : ""}
                >
                  <span>{t("row", { n: index + 1 })}</span>
                  <div>
                    <i style={{ width: `${value.share * 100}%` }} />
                  </div>
                  <strong>{(value.share * 100).toFixed(2)}%</strong>
                  <button
                    disabled={!enabled[index] || choices.length >= 12}
                    aria-label={t("chooseRow", { n: index + 1 })}
                    onClick={() => append(index)}
                  >
                    +
                  </button>
                </div>
              ))}
            </div>
          </div>
          <div className="lab-sequence" aria-label={t("sequence")}>
            {choices.map((row, index) => (
              <span
                key={index}
                className={index === rowStep - 1 ? "current" : ""}
              >
                {row + 1}
              </span>
            ))}
          </div>
          {choices.length > 0 && (
            <Playback
              step={rowStep}
              total={choices.length}
              onChange={(step) => set({ step })}
            />
          )}
          <table className="lab-table">
            <thead>
              <tr>
                <th>{t("rowLabel")}</th>
                <th>{t("baseWeight")}</th>
                <th>a</th>
                <th>b</th>
                <th>{t("adjusted")}</th>
              </tr>
            </thead>
            <tbody>
              {weights.map((value, i) => (
                <tr
                  key={i}
                  className={
                    rowStep > 0 && choices[rowStep - 1] === i ? "selected" : ""
                  }
                >
                  <td>{i + 1}</td>
                  <td>{value.p.toFixed(3)}</td>
                  <td>{value.last}</td>
                  <td>{value.previous}</td>
                  <td>{value.weight.toFixed(5)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="lab-caption">{t("recurrence")}</p>
          <details className="lab-details">
            <summary>{t("zeroTitle")}</summary>
            <p>{t("zeroDetail")}</p>
          </details>
        </>
      ) : (
        <>
          <p className="lab-intro">{t("hooksIntro")}</p>
          <div className="lab-controls">
            <label>
              {t("type")}
              <select
                value={state.type}
                onChange={(event) =>
                  set({ type: Number(event.target.value), step: 0 })
                }
              >
                {specialTypes.map((key, i) => (
                  <option key={key} value={i}>
                    {t(`types.${key}`)}
                  </option>
                ))}
              </select>
            </label>
            <label>
              {t("provisional")}
              <select
                value={state.row}
                onChange={(event) =>
                  set({ row: Number(event.target.value), step: 0 })
                }
              >
                {[0, 1, 2, 3, 4].map((row) => (
                  <option key={row} value={row}>
                    {row + 1}
                  </option>
                ))}
              </select>
            </label>
            <Toggle
              checked={!!state.circle}
              onChange={(checked) => set({ circle: Number(checked), step: 0 })}
            >
              {t("circle")}
            </Toggle>
          </div>
          <div className="lab-controls">
            <label>
              {t("queueCount")}
              <input
                type="number"
                min={0}
                max={2}
                value={state.queue}
                onChange={(event) =>
                  set({ queue: Number(event.target.value), step: 0 })
                }
              />
            </label>
            <label>
              {t("jitter")}
              <input
                type="number"
                min={0}
                max={29}
                value={state.jitter}
                onChange={(event) =>
                  set({ jitter: Number(event.target.value), step: 0 })
                }
              />
            </label>
          </div>
          <div className="lab-controls occupancy">
            <span>{t("occupied")}</span>
            {[0, 1, 2, 3, 4].map((row) => (
              <Toggle
                key={row}
                checked={!!(state.occupied & (1 << row))}
                onChange={(checked) =>
                  set({
                    occupied: checked
                      ? state.occupied | (1 << row)
                      : state.occupied & ~(1 << row),
                    step: 0,
                  })
                }
              >
                {row + 1}
              </Toggle>
            ))}
            <button onClick={() => set({ occupied: 31, step: 0 })}>
              {t("full")}
            </button>
            <button onClick={() => set({ occupied: 0, step: 0 })}>
              {t("empty")}
            </button>
          </div>
          <Playback step={step} total={4} onChange={(step) => set({ step })} />
          <div className="lab-stage" ref={ref}>
            <svg
              viewBox={`0 0 ${width} 272`}
              role="img"
              aria-label={t("board")}
            >
              {[0, 1, 2, 3, 4].map((r) => (
                <g key={r}>
                  <text x="8" y={y(r) + 5} className="lab-axis-label">
                    {r + 1}
                  </text>
                  <rect
                    x={left}
                    y={y(r) - 20}
                    width={(span * 9) / 14}
                    height="40"
                    fill={r === state.row ? "#304d2f" : "#1e3828"}
                    stroke={r === state.row ? "#b8d597" : "none"}
                    strokeDasharray="4 3"
                    rx="5"
                  />
                  {state.occupied & (1 << r) ? (
                    <rect
                      x={x(8) - 8}
                      y={y(r) - 9}
                      width="16"
                      height="18"
                      rx="4"
                      fill="#88967b"
                    />
                  ) : null}
                  {step >= 3 &&
                    placement.candidates.includes(r) &&
                    kind !== "ordinary" && (
                      <circle
                        cx={x(7)}
                        cy={y(r)}
                        r="11"
                        fill="none"
                        stroke="#d7b577"
                        strokeWidth="2"
                      />
                    )}
                </g>
              ))}
              {Array.from({ length: 9 }, (_, column) => (
                <g key={`column-${column}`}>
                  <text
                    x={x(column)}
                    y="13"
                    textAnchor="middle"
                    className="lab-axis-label"
                  >
                    {column + 1}
                  </text>
                  {column > 0 && (
                    <line
                      x1={left + (column / 14) * span}
                      x2={left + (column / 14) * span}
                      y1="15"
                      y2="255"
                      className="lab-axis"
                    />
                  )}
                </g>
              ))}
              {state.circle && (
                <ellipse
                  cx={x(8)}
                  cy={y(2)}
                  rx="16"
                  ry="22"
                  fill="none"
                  stroke="#a09bbd"
                  strokeWidth="3"
                  className={step === 2 ? "portal-pulse" : ""}
                />
              )}
              <g
                data-testid="placement-zombie"
                data-game-x={positionX}
                data-row={row + 1}
                className="lab-token"
                style={{
                  transform: `translate(${px}px,${y(row)}px)`,
                  opacity:
                    step === 4 && placement.rejected && kind === "fisherman"
                      ? 0.15
                      : 1,
                }}
              >
                <circle
                  r="12"
                  fill={
                    step === 4 && placement.rejected ? "#c78876" : "#d7bf7c"
                  }
                />
                <text y="4" textAnchor="middle" fontSize="10" fill="#203520">
                  {step === 4 && placement.rejected ? "×" : "Z"}
                </text>
              </g>
            </svg>
          </div>
          <div className="lab-readout">
            <h3>{t(`hookStages.${stepKeys[step]}`)}</h3>
            <p>
              {step === 4
                ? placement.rejected
                  ? t(kind === "king" ? "rejectedKing" : "rejectedFisher")
                  : t(placement.retained ? "retainedRow" : "shuffledRow", {
                      n: (final ?? 0) + 1,
                    })
                : step === 3 && kind === "ordinary"
                  ? t("ordinaryHook")
                  : t(`hookExplain.${explanationKeys[step]}`, {
                      row: state.row + 1,
                    })}
            </p>
          </div>
          <div className="lab-stat-grid">
            <Stat label={t("historyRow")} value={state.row + 1} />
            <Stat
              label={t("visibleRow")}
              value={row + 1}
              detail={`X = ${positionX}`}
            />
            <Stat
              label={t("candidates")}
              value={
                step >= 3
                  ? placement.candidates.map((row) => row + 1).join(" / ") ||
                    "∅"
                  : "—"
              }
            />
          </div>
          {!placement.retained &&
            placement.candidates.length > 0 &&
            kind !== "ordinary" && (
              <div className="lab-controls">
                <label>
                  {t("chosenShuffle")}
                  <input type="number" min={0} max={65535} value={state.seed}
                    onChange={(event) => set({ seed: Number(event.target.value) })} />
                </label>
              </div>
            )}
          <p className="lab-caption">{t("hookCaption")}</p>
        </>
      )}
    </div>
  );
}
