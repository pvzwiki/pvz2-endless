"use client";
import { useTranslations } from "next-intl";
import { clamp, f32 } from "@/lib/mechanism-model";
import {
  LevelControl,
  Playback,
  Stat,
  Toggle,
  useCanvasWidth,
  useParameters,
} from "./lab-controls";
const stepKeys = ["0", "1", "2", "3", "4", "5", "6", "7"] as const;
export default function SteamLab() {
  const t = useTranslations("labs.steam");
  const [state, set] = useParameters(
    "steam",
    {
      level: 34,
      mode: 0,
      step: 0,
      time: 0,
      blocked: 0,
      size: 0,
      count: 1,
      updates: 0,
      delta: 1.2,
    },
    {
      level: [1, 149],
      mode: [0, 1],
      step: [0, 7],
      time: [0, 17, 0.1],
      blocked: [0, 1],
      size: [0, 2],
      count: [1, 5],
      updates: [0, 10],
      delta: [0, 4, 0.1],
    },
  );
  const alpha = clamp(f32(f32(state.level - 1) / 99), 0, 1),
    smoke = Math.trunc(f32(3 * alpha)),
    pipes = Math.trunc(f32(5 * alpha)),
    start = Math.trunc(f32(15 + 15 * alpha)),
    damage = Math.trunc(f32(30 + 70 * alpha));
  const [ref, width] = useCanvasWidth(),
    cell = (width - 42) / 9,
    rowHeight = 49,
    height = 5 * rowHeight + 45;
  const x = (column: number) => 35 + (column + 0.5) * cell,
    y = (row: number) => 28 + (row + 0.5) * rowHeight;
  const blocked = !!state.blocked && state.time >= 1 && pipes > 0,
    under = 2 + (blocked ? 12 : 0),
    complete = 3 + (blocked ? 12 : 0),
    admitted = state.size === 0 && pipes > 0;
  let accumulator = 0,
    passes = 0;
  for (let i = 0; i < state.updates; i++) {
    accumulator = f32(accumulator + state.delta);
    if (accumulator > 1) {
      passes++;
      accumulator = f32(accumulator - 1);
    }
  }
  const activeSmoke = state.mode === 0 && state.step === 3;
  return (
    <div>
      <div className="lab-tabs" role="tablist" aria-label={t("systems")}>
        <button
          role="tab"
          aria-selected={state.mode === 0}
          onClick={() => set({ mode: 0 })}
        >
          {t("smoke")}
        </button>
        <button
          role="tab"
          aria-selected={state.mode === 1}
          onClick={() => set({ mode: 1 })}
        >
          {t("pipeline")}
        </button>
      </div>
      <div className="lab-controls">
        <LevelControl
          value={state.level % 5 === 0 ? state.level + 1 : state.level}
          onChange={(level) => set({ level, time: 0, step: 0, updates: 0 })}
        />
        {[21, 34, 67, 101].map((level) => (
          <button
            key={level}
            onClick={() => set({ level, time: 0, step: 0, updates: 0 })}
          >
            L {level}
          </button>
        ))}
        {state.mode === 1 && (
          <>
            <label>
              {t("size")}
              <select
                value={state.size}
                onChange={(event) =>
                  set({ size: Number(event.target.value), time: 0 })
                }
              >
                <option value={0}>{t("small")}</option>
                <option value={1}>{t("medium")}</option>
                <option value={2}>{t("large")}</option>
              </select>
            </label>
            <label>
              {t("zombies")}
              <input
                type="number"
                min={1}
                max={5}
                value={state.count}
                onChange={(event) => set({ count: Number(event.target.value) })}
              />
            </label>
            <Toggle
              checked={!!state.blocked}
              onChange={(checked) => set({ blocked: Number(checked) })}
            >
              {t("blocker")}
            </Toggle>
          </>
        )}
      </div>
      <div className="lab-stat-grid">
        <Stat label={t("holeCount")} value={smoke} />
        <Stat label={t("pipeCount")} value={pipes} />
        <Stat
          label={t("damage")}
          value={damage}
          detail={state.mode === 0 ? t("perPass") : t("perBlocker")}
        />
      </div>
      <div className="lab-stage" ref={ref}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={t("board")}
        >
          {Array.from({ length: 9 }, (_, c) => (
            <text
              key={c}
              x={x(c)}
              y="14"
              textAnchor="middle"
              className="lab-axis-label"
            >
              {c + 1}
            </text>
          ))}
          {Array.from({ length: 5 }, (_, r) => (
            <g key={r}>
              <text x="12" y={y(r) + 4} className="lab-axis-label">
                {r + 1}
              </text>
              {Array.from({ length: 9 }, (_, c) => (
                <rect
                  key={c}
                  x={x(c) - cell / 2 + 2}
                  y={y(r) - rowHeight / 2 + 2}
                  width={cell - 4}
                  height={rowHeight - 4}
                  rx="4"
                  fill={(r + c) % 2 ? "#1b3527" : "#203d2c"}
                />
              ))}
            </g>
          ))}
          {Array.from({ length: pipes }, (_, r) => (
            <g key={`pipe-${r}`}>
              <path
                d={`M ${x(6)} ${y(r)} Q ${x(5)} ${y(r) + 20} ${x(4)} ${y(r)}`}
                fill="none"
                stroke="#bd9967"
                strokeWidth="3"
                strokeDasharray={state.mode === 1 ? "" : "3 4"}
                opacity={state.mode === 1 ? 1 : 0.35}
              />
              <ellipse cx={x(6)} cy={y(r)} rx="11" ry="6" fill="#b69468" />
              <ellipse cx={x(4)} cy={y(r)} rx="11" ry="6" fill="#b69468" />
            </g>
          ))}
          {Array.from({ length: smoke }, (_, i) => (
            <g key={`hole-${i}`}>
              <ellipse
                cx={x(5)}
                cy={y(i + 1)}
                rx="13"
                ry="8"
                fill="#101713"
                stroke="#7b8978"
              />
              {activeSmoke && (
                <g className="smoke-cloud">
                  {[-1, 0, 1].flatMap((dy) =>
                    [-1, 0, 1].map((dx) => (
                      <circle
                        key={`${dx}-${dy}`}
                        cx={x(5 + dx)}
                        cy={y(i + 1 + dy)}
                        r={Math.min(cell * 0.53, 21)}
                        fill="#b4c0a8"
                        opacity=".24"
                      />
                    )),
                  )}
                </g>
              )}
            </g>
          ))}
          {state.mode === 1 &&
            Array.from({ length: state.count }, (_, i) => {
              const atExit = admitted && state.time >= under,
                px = x(atExit ? 4 : 6) + (i - (state.count - 1) / 2) * 9,
                hidden = admitted && state.time >= 1 && state.time < under;
              return (
                <g
                  key={i}
                  className="lab-token"
                  style={{
                    transform: `translate(${px}px,${y(0) - 15}px)`,
                    opacity: hidden ? 0.25 : 1,
                  }}
                >
                  <circle
                    r="7"
                    fill={
                      state.size === 0
                        ? "#c8df99"
                        : state.size === 1
                          ? "#d7b579"
                          : "#d39277"
                    }
                  />
                  <text y="4" textAnchor="middle" fontSize="7" fill="#243623">
                    {i + 1}
                  </text>
                </g>
              );
            })}
          {state.mode === 1 && blocked && (
            <g>
              <rect
                x={x(4) - 10}
                y={y(0) - 13}
                width="20"
                height="26"
                rx="6"
                fill="#bd7f88"
              />
              <text
                x={x(4)}
                y={y(0) + 4}
                textAnchor="middle"
                fontSize="13"
                fill="#fff"
              >
                ×
              </text>
            </g>
          )}
        </svg>
      </div>
      {state.mode === 0 ? (
        <>
          <Playback
            step={smoke ? state.step : 0}
            total={smoke ? 7 : 0}
            onChange={(step) => set({ step, updates: 0 })}
          />
          <div className="lab-readout">
            <h3>
              {smoke ? t(`smokeStages.${stepKeys[state.step]}`) : t("noSmoke")}
            </h3>
            <p>
              {smoke
                ? t(`smokeExplain.${stepKeys[state.step]}`, {
                    start,
                    alert: 3,
                    cooldown: 5,
                    nextRoar: 8,
                  })
                : t("noSmokeDetail")}
            </p>
          </div>
          {state.step === 3 && smoke > 0 && (
            <>
              <div className="lab-controls smoke-updates">
                <label>
                  {t("delta")}
                  <input
                    type="number"
                    step="0.1"
                    min={0}
                    max={4}
                    value={state.delta}
                    onChange={(event) =>
                      set({ delta: Number(event.target.value), updates: 0 })
                    }
                  />
                </label>
                <button
                  onClick={() => set({ updates: state.updates + 1 })}
                  disabled={state.updates >= 10}
                >
                  {t("update")}
                </button>
                <button onClick={() => set({ updates: 0 })}>
                  {t("resetDamage")}
                </button>
              </div>
              <div className="lab-stat-grid">
                <Stat label={t("passes")} value={passes} />
                <Stat label={t("accumulator")} value={accumulator.toFixed(2)} />
                <Stat label={t("targetDamage")} value={passes * damage} />
              </div>
              <p className="lab-caption">{t("onePass")}</p>
            </>
          )}
        </>
      ) : (
        <>
          <div className="lab-controls steam-time">
            <label>
              {t("time")}
              <span className="control-value" aria-hidden="true">
                {state.time.toFixed(1)} s
              </span>
              <input
                type="range"
                min={0}
                max={17}
                step={0.1}
                value={state.time}
                onChange={(event) => set({ time: Number(event.target.value) })}
              />
            </label>
            {[0, 1, 2, 3, 3.1, 14, 15.1].map((time) => (
              <button key={time} onClick={() => set({ time })}>
                {time}s
              </button>
            ))}
          </div>
          <div className="lab-readout">
            <h3>
              {!pipes
                ? t("noPipe")
                : !admitted
                  ? t("denied")
                  : state.time > complete
                    ? t("completed")
                    : state.time >= under
                      ? t("atExit")
                      : state.time >= 1
                        ? t("underground")
                        : t("entry")}
            </h3>
            <p>
              {admitted
                ? t("pipeDetail", { under, complete, count: state.count })
                : t("deniedDetail")}
            </p>
          </div>
          <div className="lab-stat-grid">
            <Stat
              label={t("blockerDps")}
              value={blocked && admitted ? damage : 0}
              detail={t("notPerZombie")}
            />
            <Stat
              label={t("waveMarker")}
              value={admitted ? "7" : "—"}
              detail={t("retained")}
            />
            <Stat
              label={t("countsInHealth")}
              value={admitted ? t("yes") : "—"}
            />
          </div>
        </>
      )}
      <p className="lab-caption">{t("positions")}</p>
    </div>
  );
}
