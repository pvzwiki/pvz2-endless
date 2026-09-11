"use client";
import { useLocale, useTranslations } from "next-intl";
import { announcementScenario } from "@/lib/announcement-model";
import { createWavePlan } from "@/lib/wave-model";
import { LevelControl, Stat, useCanvasWidth, useParameters } from "./lab-controls";

export default function AnnouncementLab() {
  const t = useTranslations("labs.announcement"), locale = useLocale();
  const [state, set] = useParameters("announcement", {
    level: 149, wave: 5, deadline: 30, tap: 31, interval: 22.5, clear: 5, manual: 1,
  }, {
    level: [1, 149], wave: [1, 15], deadline: [0, 35, 0.1], tap: [0, 60, 0.1],
    interval: [20, 25, 0.1], clear: [0, 60, 0.1], manual: [0, 1],
  });
  const waves = createWavePlan(state.level).waves.filter((wave) => wave.flag || wave.final);
  const wave = waves.find((wave) => wave.number === state.wave) ?? waves[0];
  const input = {
    deadline: state.deadline, intervalAfterSpawn: state.interval,
    clearAfterSpawn: state.clear, final: wave.final,
  };
  const normal = announcementScenario({ ...input, tap: null });
  const selected = announcementScenario({ ...input, tap: state.manual ? state.tap : null });
  const [ref, width] = useCanvasWidth();
  const end = Math.ceil((Math.max(normal.following, selected.following, normal.clear, selected.clear) + 2) / 10) * 10;
  const tickStep = width < 520 ? Math.ceil(end / 40) * 10 : 10;
  const x = (time: number) => 28 + time / end * (width - 50);
  const number = (value: number) => value.toLocaleString(locale, { maximumFractionDigits: 1 });
  const lanes = [normal, selected];
  return (
    <div>
      <p className="lab-intro">{t("intro")}</p>
      <div className="lab-controls">
        <LevelControl value={state.level} onChange={(level) => set({ level, wave: 1 })} />
        <label>{t("wave")}
          <select value={wave.number} onChange={(event) => set({ wave: Number(event.target.value) })}>
            {waves.map((row) => <option key={row.number} value={row.number}>
              {t(row.final ? "finalWave" : "flagWave", { n: row.number })}
            </option>)}
          </select>
        </label>
        <label>{t("deadlineInput")}
          <input type="number" min={0} max={35} step={0.1} value={state.deadline}
            onChange={(event) => set({ deadline: Number(event.target.value) })} />
        </label>
        <label>{t("tapInput")}
          <input type="number" min={0} max={60} step={0.1} value={state.tap} disabled={!state.manual}
            onChange={(event) => set({ tap: Number(event.target.value) })} />
        </label>
        <label>{t("intervalInput")}
          <input type="number" min={20} max={25} step={0.1} value={state.interval}
            onChange={(event) => set({ interval: Number(event.target.value) })} />
        </label>
        <label>{t("clearInput")}
          <input type="number" min={0} max={60} step={0.1} value={state.clear}
            onChange={(event) => set({ clear: Number(event.target.value) })} />
        </label>
      </div>
      <div className="lab-controls">
        <button onClick={() => set({ manual: 0 })}>{t("wait")}</button>
        <button onClick={() => set({ manual: 1, tap: (normal.visible + normal.warningStart) / 2 })}>{t("before")}</button>
        <button onClick={() => set({ manual: 1, tap: (normal.warningStart + normal.warningEnd) / 2 })}>{t("during")}</button>
      </div>
      <div className="lab-note">
        {t("window", { from: number(normal.warningStart), to: number(normal.warningEnd), visible: number(normal.visible) })}
        {state.manual && !selected.accepted ? ` ${t("unavailable")}` : ""}
      </div>
      <div className="lab-stage" ref={ref}>
        <svg viewBox={`0 0 ${width} 247`} role="img" aria-label={t("timeline")}>
          {Array.from({ length: Math.floor(end / tickStep) + 1 }, (_, i) => i * tickStep).map((time) => (
            <g key={time}>
              <line x1={x(time)} x2={x(time)} y1="28" y2="215" className="lab-axis" />
              <text x={x(time)} y="238" textAnchor="middle" className="lab-axis-label">{number(time)}s</text>
            </g>
          ))}
          {lanes.map((lane, index) => {
            const y = index * 105;
            const warningShown = !lane.accepted || lane.retained;
            return <g key={index}>
              <text x="5" y={18 + y} className="lab-axis-label">{t(index ? "selected" : "normal")}</text>
              {warningShown && <rect x={x(lane.warningStart)} y={38 + y}
                width={Math.max(0, x(lane.spawn) - x(lane.warningStart))} height="18" rx="3" fill="#d7b579" />}
              <rect x={x(lane.spawn)} y={68 + y} width={x(lane.following) - x(lane.spawn)}
                height="22" rx="3" fill={lane.retained ? "#9f8bb5" : "#6f9767"} />
              <circle cx={x(lane.spawn)} cy={79 + y} r="5" fill="#e6dfc9" />
              <line x1={x(lane.clear)} x2={x(lane.clear)} y1={61 + y} y2={99 + y}
                stroke="#e6dfc9" strokeWidth="2" strokeDasharray="3 3" />
              <circle cx={x(lane.following)} cy={79 + y} r="5" fill={lane.retained ? "#d4bcdf" : "#bfd69b"} />
            </g>;
          })}
        </svg>
      </div>
      <p className="lab-caption">{t("legend")}</p>
      <div className="lab-stat-grid health-report-grid" data-testid="announcement-result">
        <Stat label={t("spawn")} value={`${number(selected.spawn)}s`} detail={t("spawnDetail", { n: wave.number })} />
        <Stat label={t("state")} value={selected.stateAfterSpawn} detail={t(selected.retained ? "retained" : "timed")} />
        <Stat label={t("freshDeadline")} value={`${number(selected.freshDeadline)}s`} detail={t("intervalDetail", { n: number(state.interval) })} />
        <Stat label={t(wave.final ? "finish" : "following")} value={`${number(selected.following)}s${selected.completionNeedsAnotherUpdate ? " +" : ""}`}
          detail={selected.completionNeedsAnotherUpdate ? t("anotherUpdate") : wave.final ? t("finishDetail") : t("followingDetail", { n: wave.number + 1 })} />
      </div>
      <p className="lab-note" aria-live="polite">
        {selected.retained ? t("retainedEffect", { clear: number(selected.clear), deadline: number(selected.freshDeadline) }) : t("timedEffect")}
        {wave.final ? ` ${t("completionBoundary")}` : ""}
      </p>
      <p className="lab-caption">{t("scope")}</p>
    </div>
  );
}
