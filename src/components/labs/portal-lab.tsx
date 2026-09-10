"use client";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import { portalReplay } from "@/lib/runtime-model";
import { mechanismInputs, typeRecord, clamp, f32 } from "@/lib/mechanism-model";
import {
  LevelControl,
  Playback,
  Stat,
  Toggle,
  useParameters,
  useCanvasWidth,
} from "./lab-controls";
export default function PortalLab() {
  const t = useTranslations("labs.portals"),
    c = useTranslations("labs"),
    locale = useLocale();
  const [state, set] = useParameters(
    "portals",
    {
      level: 36,
      family: 0,
      seed: 1,
      opening: 1,
      step: 0,
      interval: 11,
      offset: 3,
      cleared: 0,
    },
    {
      level: [1, 149],
      family: [0, 9],
      seed: [0, 65535],
      opening: [0, 60, 0.1],
      step: [0, 9],
      interval: [10, 12],
      offset: [0, 12],
      cleared: [0, 1],
    },
  );
  const portal = mechanismInputs.portals[state.family];
  const offset = Math.min(state.offset, state.interval);
  const frames = useMemo(() => portalReplay(portal.types, state.seed, offset, state.interval, state.opening),
    [portal, state.seed, offset, state.interval, state.opening]);
  const step = Math.min(state.step, frames.length - 1), frame = frames[step], current = frame.state;
  const queue = [...current.children, ...current.queue];
  const emitted = current.children.length, remaining = current.queue.length;
  const alpha = clamp(f32(f32(state.level - 1) / 29), 0, 1),
    range = (a: [number, number], b: [number, number], shift = 0) => {
      const values = [
        ...new Set(
          a.flatMap((first) =>
            b.map(
              (second) =>
                Math.trunc(f32(first + (second - first) * alpha)) + shift,
            ),
          ),
        ),
      ].sort((x, y) => x - y);
      return values.length === 1
        ? String(values[0])
        : `${values[0]}–${values.at(-1)}`;
    };
  const [ref, width] = useCanvasWidth(),
    cell = (width - 10) / 4;
  return (
    <div>
      <p className="lab-intro">{t("intro")}</p>
      <div className="lab-controls">
        <LevelControl
          value={state.level % 5 === 0 ? state.level + 1 : state.level}
          onChange={(level) => set({ level, step: 0 })}
        />
        <label>
          {t("family")}
          <select
            value={state.family}
            onChange={(event) =>
              set({ family: Number(event.target.value), step: 0 })
            }
          >
            {mechanismInputs.portals.map((item, index) => (
              <option value={index} key={item.family}>
                {item.family}
              </option>
            ))}
          </select>
        </label>
        <label>
          {c("seed")}
          <input type="number" min={0} max={65535} value={state.seed}
            onChange={(event) => set({ seed: Number(event.target.value), step: 0 })} />
        </label>
        <button onClick={() => set({ seed: (state.seed + 1) % 65536, step: 0 })}>{t("reshuffle")}</button>
        <label>
          {t("interval")}
          <input
            type="number"
            min={10}
            max={12}
            value={state.interval}
            onChange={(event) =>
              set({ interval: Number(event.target.value), step: 0 })
            }
          />
        </label>
        <label>
          {t("offset")}
          <input
            type="number"
            min={0}
            max={state.interval}
            value={offset}
            onChange={(event) =>
              set({ offset: Number(event.target.value), step: 0 })
            }
          />
        </label>
        <label>
          {t("opening")}
          <input type="number" min={0} max={60} step={0.1} value={state.opening}
            onChange={(event) => set({ opening: Number(event.target.value), step: 0 })} />
        </label>
      </div>
      <details className="lab-details">
        <summary>{t("parameters")}</summary>
        <table className="lab-table">
          <thead>
            <tr>
              <th>{t("parameter")}</th>
              <th>L {state.level}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{t("subset")}</td>
              <td>{range([1, 1], [4, 4])}</td>
            </tr>
            <tr>
              <td>{t("firstWave")}</td>
              <td>{range([4, 4], [2, 3], 1)}</td>
            </tr>
            <tr>
              <td>{t("spacing")}</td>
              <td>{range([4, 4], [2, 2])}</td>
            </tr>
            <tr>
              <td>{t("portalCount")}</td>
              <td>{range([1, 1], [3, 4])}</td>
            </tr>
            <tr>
              <td>{t("column")}</td>
              <td>{range([8, 8], [5, 6], 1)}</td>
            </tr>
            <tr>
              <td>{t("unusedCount")}</td>
              <td>{range([1, 2], [3, 4])}</td>
            </tr>
            <tr>
              <td>{t("actualCount")}</td>
              <td>{portal.types.length}</td>
            </tr>
          </tbody>
        </table>
        <p>{t("parameterDetail")}</p>
      </details>
      <Playback
        step={step}
        total={frames.length - 1}
        onChange={(step) => set({ step })}
      />
      <div className="lab-readout" aria-live="polite">
        <h3>{t(`stages.${frame.kind}`, { n: emitted })}</h3>
        <p>{t(`explain.${frame.kind}`)}</p>
      </div>
      <div className="lab-stat-grid">
        <Stat label={t("queued")} value={remaining} />
        <Stat label={t("emitted")} value={emitted} />
        <Stat
          label={t("deadline")}
          value={current.phase === 'removed' ? '—' : `${current.deadline}s`}
          detail={t("scheduled")}
        />
        <Stat label={t("clock")} value={current.phase === "removed" ? t("callbackTime") : `${current.time}s`} />
      </div>
      <div className="lab-stage" ref={ref}>
        <svg viewBox={`0 0 ${width} 252`} role="img" aria-label={t("diagram")}>
          <text x="5" y="15" className="lab-axis-label">
            {t("queue")}
          </text>
          <text x="5" y="161" className="lab-axis-label">
            {t("children")}
          </text>
          {portal.types.map((id, slot) => {
            const index = queue.findIndex((item) => item.slot === slot),
              isOut = index < emitted,
              x = 5 + index * cell,
              y = isOut ? 181 : 35;
            return (
              <g
                key={`${state.family}-${slot}`}
                data-slot={slot}
                data-order={index}
                data-emitted={isOut}
                className="lab-token"
                style={{
                  transform: `translate(${x}px,${y}px)`,
                  opacity: isOut && state.cleared ? 0.22 : 1,
                }}
              >
                <title>{typeRecord(id).name[locale]}</title>
                <rect
                  width={cell - 10}
                  height="50"
                  rx="6"
                  fill={isOut ? "#d3b179" : "#b2caa1"}
                />
                <text
                  x={(cell - 10) / 2}
                  y="19"
                  textAnchor="middle"
                  fontSize="11"
                  fill="#30472a"
                >
                  {t("slot", { n: slot + 1 })}
                </text>
                <text
                  x={(cell - 10) / 2}
                  y="37"
                  textAnchor="middle"
                  fontSize="9"
                  fill="#30472a"
                >
                  {isOut ? "wave −5" : `#${index + 1}`}
                </text>
              </g>
            );
          })}
          <line x1="5" x2={width - 10} y1="118" y2="118" className="lab-axis" />
          <circle
            cx={width / 2}
            cy="118"
            r="20"
            fill="#516e82"
            opacity={current.phase === 'removed' ? 0.15 : 1}
            className={step >= 2 && current.phase !== 'removed' ? "portal-pulse" : ""}
          />
          <circle cx={width / 2} cy="118" r="11" fill="#132b25" />
          <text x={width / 2 + 31} y="122" fontSize="10" fill="#b5c9a2">
            {current.phase === 'removed' ? t("removed") : t("portal")}
          </text>
        </svg>
      </div>
      <div className="lab-chip-list">
        {portal.types.map((id, index) => (
          <span className="lab-chip" key={index}>
            {index + 1}. {typeRecord(id).name[locale]}
          </span>
        ))}
      </div>
      <Toggle
        checked={!!state.cleared}
        onChange={(checked) => set({ cleared: Number(checked) })}
      >
        {t("clearChildren")}
      </Toggle>
      <div className="lab-note" data-testid="portal-completion">
        {current.phase !== 'removed'
          ? t("blockedPortal")
          : emitted && !state.cleared
            ? t("blockedChildren")
            : t("clear")}
      </div>
      <p className="lab-caption">{t("orderDetail")}</p>
    </div>
  );
}
