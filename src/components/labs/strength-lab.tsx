"use client";
import { useLocale, useTranslations } from "next-intl";
import {
  mechanismInputs,
  levelRequest,
  entityStrength,
  typeRecord,
} from "@/lib/mechanism-model";
import { ordinaryLevels } from "@/lib/wave-model";
import { entityHealthReport } from "@/lib/wave-health";
import {
  LevelControl,
  Stat,
  Toggle,
  useCanvasWidth,
  useParameters,
} from "./lab-controls";
const types = ["mummy", "mummy_armor1", "mummy_armor2"];
export default function StrengthLab() {
  const t = useTranslations("labs.strength"),
    c = useTranslations("labs"),
    locale = useLocale();
  const [state, set] = useParameters(
    "strength",
    { level: 36, residue: 0, override: 0, type: 1, leader: 0 },
    {
      level: [1, 149],
      residue: [0, 99],
      override: [0, 10],
      type: [0, 2],
      leader: [0, 1],
    },
  );
  const level = state.level % 5 === 0 ? state.level + 1 : state.level,
    request = levelRequest(level),
    chosen = state.residue < request.threshold ? request.upper : request.lower,
    effective = state.override || chosen,
    id = types[state.type];
  const result = entityStrength(id, effective, !!state.leader),
    base = entityStrength(id, 1, false),
    normal = entityStrength(id, effective, false);
  const [ref, width] = useCanvasWidth(),
    x = (level: number) => 35 + ((level - 1) / 148) * (width - 53),
    y = (value: number) => 190 - ((value - 1) / 9) * 162;
  const points = ordinaryLevels
      .map((level) => `${x(level)},${y(levelRequest(level).value)}`)
      .join(" "),
    maximum = Math.max(base.body + base.helmet, result.body + result.helmet, 1);
  return (
    <div>
      <p className="lab-intro">{t("intro")}</p>
      <div className="lab-controls">
        <LevelControl value={level} onChange={(level) => set({ level })} />
        {[2, 3, 46, 54, 91].map((level) => (
          <button key={level} onClick={() => set({ level })}>
            L {level}
          </button>
        ))}
        <label>
          {t("residue")}
          <span className="control-value" aria-hidden="true">
            {state.residue}
          </span>
          <input
            type="range"
            min={0}
            max={99}
            value={state.residue}
            onChange={(event) => set({ residue: Number(event.target.value) })}
          />
        </label>
      </div>
      <div className="lab-stage" ref={ref}>
        <svg viewBox={`0 0 ${width} 224`} role="img" aria-label={t("curve")}>
          {[1, 5, 10].map((n) => (
            <g key={n}>
              <line
                x1="35"
                x2={width - 18}
                y1={y(n)}
                y2={y(n)}
                className="lab-axis"
              />
              <text x="12" y={y(n) + 4} className="lab-axis-label">
                {n}
              </text>
            </g>
          ))}
          {[1, 46, 91, 149].map((n) => (
            <text
              key={n}
              x={x(n)}
              y="215"
              textAnchor="middle"
              className="lab-axis-label"
            >
              {n}
            </text>
          ))}
          <polyline
            points={points}
            fill="none"
            stroke="#b8d596"
            strokeWidth="2"
          />
          <g
            className="lab-token"
            style={{
              transform: `translate(${x(level)}px,${y(request.value)}px)`,
            }}
          >
            <circle r="7" fill="#deb879" />
            <circle r="12" fill="none" stroke="#deb87966" />
          </g>
        </svg>
      </div>
      <div className="lab-stat-grid">
        <Stat label="q(L)" value={request.value.toPrecision(10)} />
        <Stat
          label={t("bounds")}
          value={`${request.lower} / ${request.upper}`}
        />
        <Stat
          label={t("requested")}
          value={chosen}
          detail={`${state.residue} < ${request.threshold.toPrecision(9)}`}
        />
      </div>
      <div className="lab-columns">
        <div>
          <h3 className="lab-small-heading">{t("residueGrid")}</h3>
          <div className="lab-residues" aria-label={t("residueGrid")}>
            {Array.from({ length: 100 }, (_, i) => (
              <span
                key={i}
                className={`${request.lower !== request.upper && i < request.threshold ? "upper" : ""} ${i === state.residue ? "current" : ""}`}
              >
                {i}
              </span>
            ))}
          </div>
          <p className="lab-caption">
            {t("residueDetail", {
              n: request.winning,
              lower: request.lower,
              upper: request.upper,
            })}
          </p>
        </div>
        <div className="lab-readout">
          <h3>{t("separate")}</h3>
          <p>{t("separateDetail")}</p>
          <div className="lab-controls">
            <label>
              {t("override")}
              <select
                value={state.override}
                onChange={(event) =>
                  set({ override: Number(event.target.value) })
                }
              >
                <option value={0}>{t("useRequest")}</option>
                {Array.from({ length: 10 }, (_, i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>
      <div className="lab-controls">
        <label>
          {t("type")}
          <select
            value={state.type}
            onChange={(event) => set({ type: Number(event.target.value) })}
          >
            {types.map((id, i) => (
              <option value={i} key={id}>
                {typeRecord(id).name[locale]}
              </option>
            ))}
          </select>
        </label>
        <Toggle
          checked={!!state.leader}
          onChange={(value) => set({ leader: Number(value) })}
        >
          {t("leader")}
        </Toggle>
        <button onClick={() => set({ type: 1, override: 5, leader: 0 })}>
          {t("conehead")}
        </button>
        <button onClick={() => set({ override: 6 })}>{t("missing")}</button>
      </div>
      <div className="lab-stage">
        {[
          { label: t("base"), value: base },
          { label: t("entity"), value: result },
        ].map(({ label, value }) => (
          <div className="lab-bar-pair" key={label}>
            <span>{label}</span>
            <div className="lab-bar">
              <span style={{ width: `${(value.body / maximum) * 100}%` }}>
                {value.body}
              </span>
              <span
                className="helmet"
                style={{ width: `${(value.helmet / maximum) * 100}%` }}
              >
                {value.helmet || ""}
              </span>
            </div>
          </div>
        ))}
        <p className="lab-caption">{t("barLegend")}</p>
      </div>
      <div className="lab-stat-grid health-report-grid">
        <Stat
          label={t("body")}
          value={result.body.toLocaleString(locale)}
          detail={`h = ${result.healthMultiplier}, ℓ = ${effective}`}
        />
        <Stat
          label={t("helmet")}
          value={result.helmet.toLocaleString(locale)}
        />
        <Stat
          label={t("bite")}
          value={Math.round(result.bite * 1000) / 1000}
          detail={`E × ${result.attackMultiplier} × ${result.levelFactor.toFixed(1)}`}
        />
        <Stat label={t("reportedHealth")}
          value={entityHealthReport(result.body, result.helmet).toLocaleString(locale)}
          detail={t("reportedDetail")} />
      </div>
      {result.missingRow && (
        <div className="lab-note">{t("missingDetail")}</div>
      )}
      {!!state.leader && (
        <p className="lab-caption">
          {t("leaderDetail", {
            before: normal.body + normal.helmet,
            after: result.body + result.helmet,
          })}
        </p>
      )}
      <details className="lab-details">
        <summary>{t("table")}</summary>
        <table className="lab-table">
          <thead>
            <tr>
              <th>ℓ</th>
              <th>{t("healthMultiplier")}</th>
              <th>{t("attackMultiplier")}</th>
              <th>{t("lookup")}</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 10 }, (_, i) => (
              <tr key={i} className={effective === i + 1 ? "selected" : ""}>
                <td>{i + 1}</td>
                <td>{mechanismInputs.strengthRows[i]?.HitPointsLevel ?? 1}</td>
                <td>{mechanismInputs.strengthRows[i]?.AttackLevel ?? 1}</td>
                <td>{i < 5 ? t("declared") : t("fallback")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </div>
  );
}
