"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { useFormatter, useTranslations } from "next-intl";
import { egypt, selectTypes, fillBudget } from "@/lib/roster-model";
import { ordinaryLevels } from "@/lib/wave-model";
import { useExperience } from "./experience-context";
import { useCanvasWidth } from "./labs/lab-controls";

const palette = [
  "#bed7ba",
  "#d7be87",
  "#b39e82",
  "#b1bd79",
  "#829d9a",
  "#c19d80",
  "#e5cf70",
  "#91ae8e",
  "#ce9964",
];
const marks = ["MU", "CA", "EX", "CO", "BU", "PH", "RA", "TR", "GA"];
const color = (id: string) =>
  palette[egypt.types.findIndex((type) => type.id === id)];
const mark = (id: string) =>
  marks[egypt.types.findIndex((type) => type.id === id)];

export function RosterExplorer() {
  const t = useTranslations("roster");
  const { setView, ready } = useExperience();
  return (
    <div className="view-launchers" id="explorer">
      <button
        disabled={!ready}
        className="view-launcher"
        onClick={(event) => {
          event.currentTarget.focus({ preventScroll: true });
          setView("roster");
        }}
      >
        <span className="launcher-glyph" aria-hidden="true">
          ◉
        </span>
        <span>
          <strong>{t("launch")}</strong>
          <small>{t("launchDescription")}</small>
        </span>
        <span className="launcher-action">
          {t("view")}
          <b aria-hidden="true">+</b>
        </span>
      </button>
    </div>
  );
}

function Experiment() {
  const { locale, plan, setLevel } = useExperience();
  const t = useTranslations("roster");
  const format = useFormatter();
  const [seed, setSeed] = useState(1);
  const [budget, setBudget] = useState(2350);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [ready, setReady] = useState(false);
  const [selectionStep, setSelectionStep] = useState(5);
  const [selectionPlaying, setSelectionPlaying] = useState(false);
  const [selectionCanvas, selectionWidth] = useCanvasWidth();
  const selection = useMemo(
    () => selectTypes(plan.level, seed),
    [plan.level, seed],
  );
  const types = selection.selected.map((id) =>
    egypt.types.find((type) => type.id === id)!,
  );
  const result = useMemo(
    () =>
      fillBudget(
        budget,
        selection.selected.map((id) =>
          egypt.types.find((type) => type.id === id)!,
        ),
        seed + 1,
      ),
    [budget, selection],
  );
  const step =
    result.steps[Math.max(0, Math.min(cursor - 1, result.steps.length - 1))];
  const remaining =
    cursor === 0
      ? budget
      : (result.steps[Math.min(cursor - 1, result.steps.length - 1)]?.after ??
        budget);
  const name = (id: string) =>
    egypt.types.find((type) => type.id === id)!.name[locale];
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const savedSeed = Number(query.get("seed")),
      savedBudget = Number(query.get("budget"));
    if (
      query.has("seed") &&
      Number.isInteger(savedSeed) &&
      savedSeed >= 0 &&
      savedSeed <= 65535
    )
      setSeed(savedSeed);
    if (
      query.has("budget") &&
      Number.isInteger(savedBudget) &&
      savedBudget >= 0 &&
      savedBudget <= 30000
    )
      setBudget(savedBudget);
    setReady(true);
  }, []);
  useEffect(() => {
    setCursor(0);
    setPlaying(false);
    setSelectionStep(5);
    setSelectionPlaying(false);
  }, [plan.level, seed, budget]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    url.searchParams.set("seed", String(seed));
    url.searchParams.set("budget", String(budget));
    window.history.replaceState(window.history.state, "", url);
  }, [seed, budget, ready]);
  useEffect(() => {
    if (!playing) return;
    if (cursor >= result.steps.length) {
      setPlaying(false);
      return;
    }
    const timer = window.setTimeout(() => setCursor((value) => value + 1), 850);
    return () => window.clearTimeout(timer);
  }, [playing, cursor, result.steps.length]);
  useEffect(() => {
    if (!selectionPlaying) return;
    if (selectionStep >= 5) {
      setSelectionPlaying(false);
      return;
    }
    const timer = window.setTimeout(
      () => setSelectionStep((value) => value + 1),
      950,
    );
    return () => window.clearTimeout(timer);
  }, [selectionPlaying, selectionStep]);
  const displayedTypes =
    selectionStep === 5
      ? selection.selected
      : selection.initial.slice(0, selectionStep + 1);
  const remainingPool =
    selectionStep === 5
      ? egypt.pool.filter((id) => !displayedTypes.includes(id))
      : selectionStep === 0
        ? egypt.pool
        : selection.draws[selectionStep - 1].remaining;
  const selectionDraw =
    selectionStep > 0 && selectionStep < 5
      ? selection.draws[selectionStep - 1]
      : null;
  const columns = Math.max(
    3,
    Math.min(8, Math.floor((selectionWidth - 10) / 94)),
  );
  const cell = (selectionWidth - 10) / columns;
  const poolY = 43 + Math.ceil(5 / columns) * 76;
  const poolRows = Math.ceil(
    (selectionStep === 5 ? remainingPool.length : 8) / columns,
  );
  const canvasHeight = poolY + poolRows * 76 + 20;
  return (
    <div className="roster-experiment">
      <div className="roster-controls">
        <label>
          {t("level")}
          <select
            value={plan.level}
            onChange={(event) => setLevel(Number(event.target.value))}
          >
            {ordinaryLevels.map((level) => (
              <option key={level} value={level}>
                {level}
              </option>
            ))}
          </select>
        </label>
        <div className="threshold-presets">
          <button onClick={() => setLevel(49)} aria-pressed={plan.level === 49}>
            L 49
          </button>
          <button onClick={() => setLevel(51)} aria-pressed={plan.level === 51}>
            L 51
          </button>
        </div>
        <label>
          {t("seed")}
          <input
            type="number"
            value={seed}
            min="0"
            max="65535"
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 0 && value <= 65535)
                setSeed(value);
            }}
          />
        </label>
        <button
          className="new-selection"
          onClick={() => setSeed((value) => (value + 1) % 65536)}
        >
          {t("reselect")} ↻
        </button>
        <label>
          {t("budget")} B
          <input
            type="number"
            value={budget}
            min="0"
            max="30000"
            onChange={(event) => {
              const value = Number(event.target.value);
              if (Number.isInteger(value) && value >= 0 && value <= 30000)
                setBudget(value);
            }}
          />
        </label>
      </div>
      <section className="type-selection">
        <div className="lab-section-title">
          <span>01</span>
          <h3>{t("chooseTypes")}</h3>
          <small>{t("poolCount")}</small>
        </div>
        <div className="selection-playback">
          <button
            onClick={() => {
              setSelectionStep(0);
              setSelectionPlaying(true);
              setPlaying(false);
              setCursor(0);
            }}
          >
            {t("replaySelection")}
          </button>
          {selectionPlaying && (
            <button onClick={() => setSelectionPlaying(false)}>
              {t("pauseSelection")}
            </button>
          )}
          <button
            disabled={selectionStep >= 5}
            onClick={() => {
              setSelectionPlaying(false);
              setSelectionStep((value) => value + 1);
            }}
          >
            {t("nextChoice")} →
          </button>
          <button
            disabled={selectionStep >= 5}
            onClick={() => {
              setSelectionPlaying(false);
              setSelectionStep(5);
            }}
          >
            {t("finishSelection")}
          </button>
          <output>{selectionStep} / 5</output>
        </div>
        <p className="selection-explanation" aria-live="polite">
          {selectionDraw
            ? t("selectionDraw", {
                count: selectionDraw.before.length,
                index: selectionDraw.index,
                name: name(selectionDraw.chosen),
              })
            : selectionStep === 0
              ? t("selectionStart")
              : selection.replacement
                ? t("replacement", {
                    removed: name(selection.replacement.removed),
                    added: name(selection.replacement.added),
                  })
                : plan.level > 50
                  ? t("highAlready")
                  : t("highInactive")}
        </p>
        <div className="selection-stage" ref={selectionCanvas}>
          <svg
            viewBox={`0 0 ${selectionWidth} ${canvasHeight}`}
            role="img"
            aria-label={t("selectionDiagram")}
          >
            <text x="5" y="14" className="selection-label">
              {t("selectedSet")}
            </text>
            <text x="5" y={poolY - 4} className="selection-label">
              {selectionStep === 5 ? t("unselectedPool") : t("remainingPool")}
            </text>
            {Array.from(
              { length: 5 },
              (_, index) =>
                index >= displayedTypes.length && (
                  <g
                    key={`slot-${index}`}
                    transform={`translate(${5 + (index % columns) * cell},${27 + Math.floor(index / columns) * 76})`}
                    aria-hidden="true"
                  >
                    <rect
                      width={cell - 10}
                      height="61"
                      rx="6"
                      fill="none"
                      stroke="#a4bb91"
                      strokeDasharray="4 4"
                    />
                    <text
                      x={(cell - 10) / 2}
                      y="35"
                      textAnchor="middle"
                      className="selection-label"
                    >
                      {index}
                    </text>
                  </g>
                ),
            )}
            {egypt.types.map((type) => {
              const selectedIndex = displayedTypes.indexOf(type.id),
                chosen = selectedIndex >= 0;
              const index = chosen
                ? selectedIndex
                : remainingPool.indexOf(type.id);
              const x = 5 + (index % columns) * cell,
                y =
                  27 + Math.floor(index / columns) * 76 + (chosen ? 0 : poolY);
              return (
                <g
                  key={type.id}
                  className="selection-token"
                  data-selected={chosen}
                  data-type={type.id}
                  style={{ transform: `translate(${x}px,${y}px)` }}
                >
                  <title>{type.name[locale]}</title>
                  <rect
                    width={cell - 10}
                    height="61"
                    rx="6"
                    fill={color(type.id)}
                    stroke={chosen ? "#6e9055" : "#bbc8ae"}
                    opacity={chosen ? 1 : 0.65}
                  />
                  <text x="9" y="15" className="selection-index">
                    {type.id === egypt.basic
                      ? "b"
                      : chosen
                        ? `#${selectedIndex}`
                        : `j=${index}`}
                  </text>
                  <text
                    x={(cell - 10) / 2}
                    y="32"
                    textAnchor="middle"
                    className="selection-monogram"
                  >
                    {mark(type.id)}
                  </text>
                  <text
                    x={(cell - 10) / 2}
                    y="49"
                    textAnchor="middle"
                    className="selection-cost"
                  >
                    c = {type.cost}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
        <div className="selection-legend">
          {egypt.types.map((type) => (
            <span key={type.id}>
              <b style={{ background: color(type.id) }}>{mark(type.id)}</b>
              {type.name[locale]}
            </span>
          ))}
        </div>
      </section>
      {selectionStep === 5 && (
        <section className="draw-section">
          <div className="lab-section-title">
            <span>02</span>
            <h3>{t("fillBudget")}</h3>
            <small>{t("displayOrder")}</small>
          </div>
          <div className="draw-layout">
            <div className="weight-instrument">
              <div className="bag-heading">
                <span>{t("bag")}</span>
                <code>R = {format.number(step?.before ?? budget)}</code>
              </div>
              <div className="weight-bag">
                {types.map((type) => {
                  const candidate = step?.candidates.find(
                    (item) => item.type.id === type.id,
                  );
                  const share = candidate ? type.weight / step.totalWeight : 0;
                  return (
                    <div
                      key={type.id}
                      className="weight-segment"
                      style={{
                        width: `${share * 100}%`,
                        background: color(type.id),
                      }}
                    >
                      <span>{mark(type.id)}</span>
                    </div>
                  );
                })}
                {cursor > 0 && step && (
                  <div
                    className="draw-pointer"
                    style={{ left: `${(step.draw / step.totalWeight) * 100}%` }}
                  >
                    <span>↓</span>
                  </div>
                )}
              </div>
              <div className="bag-scale">
                <code>0</code>
                <code>T = {format.number(step?.totalWeight ?? 0)}</code>
              </div>
              <div className="candidate-table">
                <div className="candidate-heading">
                  <span>{t("type")}</span>
                  <span>c</span>
                  <span>a</span>
                  <span>{t("bagShare")}</span>
                </div>
                {types.map((type) => {
                  const candidate = step?.candidates.find(
                    (item) => item.type.id === type.id,
                  );
                  return (
                    <div
                      key={type.id}
                      className={`candidate-row${candidate ? "" : " unaffordable"}${cursor > 0 && step?.chosen.id === type.id ? " draw-chosen" : ""}`}
                    >
                      <span>
                        <i style={{ background: color(type.id) }} />
                        {type.name[locale]}
                      </span>
                      <span>{format.number(type.cost)}</span>
                      <span>{format.number(type.weight)}</span>
                      <span>
                        {candidate
                          ? format.number(type.weight / step.totalWeight, {
                              style: "percent",
                              maximumFractionDigits: 1,
                            })
                          : "—"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="draw-readout">
              <span className="eyebrow">{t("remaining")}</span>
              <output data-testid="roster-remaining">
                {format.number(remaining)}
              </output>
              <div className="draw-result" aria-live="polite">
                <span>
                  {cursor ? t("drawNumber", { number: cursor }) : t("ready")}
                </span>
                <strong>{cursor && step ? name(step.chosen.id) : "—"}</strong>
                <code>
                  {cursor && step
                    ? `${format.number(step.before)} − ${step.chosen.cost} = ${format.number(step.after)}`
                    : `B = ${format.number(budget)}`}
                </code>
                {cursor > 0 && step && (
                  <small>d = {format.number(step.draw)}</small>
                )}
              </div>
              <button
                className="draw-next"
                disabled={cursor >= result.steps.length}
                onClick={() => {
                  setPlaying(false);
                  setCursor((value) => value + 1);
                }}
              >
                {t("nextDraw")} →
              </button>
              <div className="draw-transport">
                <button
                  disabled={
                    !result.steps.length || cursor >= result.steps.length
                  }
                  onClick={() => setPlaying(!playing)}
                >
                  {playing ? t("pause") : t("play")}
                </button>
                <button
                  onClick={() => {
                    setPlaying(false);
                    setCursor(result.steps.length);
                  }}
                >
                  {t("finish")}
                </button>
                <button
                  onClick={() => {
                    setPlaying(false);
                    setCursor(0);
                  }}
                >
                  {t("reset")}
                </button>
              </div>
            </div>
          </div>
          <div className="draw-timeline">
            <label>
              {t("drawTimeline")}
              <input
                type="range"
                min="0"
                max={result.steps.length}
                value={Math.min(cursor, result.steps.length)}
                onChange={(event) => {
                  setPlaying(false);
                  setCursor(Number(event.target.value));
                }}
              />
            </label>
            <span>
              {cursor} / {result.steps.length}
            </span>
          </div>
          <div className="roster-sequence" aria-label={t("resultSequence")}>
            {result.steps.slice(0, cursor).map((entry, index) => (
              <span
                key={index}
                title={`${index + 1} · ${name(entry.chosen.id)}`}
                style={
                  { "--type-color": color(entry.chosen.id) } as CSSProperties
                }
              >
                {mark(entry.chosen.id)}
              </span>
            ))}
            {!cursor && <p>{t("sequenceEmpty")}</p>}
          </div>
          {cursor === result.steps.length && (
            <p className="fill-complete">
              {t("complete", {
                count: result.steps.length,
                remaining: result.remaining,
              })}
            </p>
          )}
        </section>
      )}
      <details className="complete-plan">
        <summary>
          {t("sourceValues")}
          <span aria-hidden="true">+</span>
        </summary>
        <div className="table-scroll">
          <table className="source-values">
            <thead>
              <tr>
                <th>{t("type")}</th>
                <th>WavePointCost</th>
                <th>Weight</th>
                <th>Hitpoints</th>
                <th>HelmHitpoints</th>
              </tr>
            </thead>
            <tbody>
              {egypt.types.map((type) => (
                <tr key={type.id}>
                  <th scope="row">
                    {type.name[locale]}
                    <code>{type.id}</code>
                  </th>
                  <td>{type.cost}</td>
                  <td>{type.weight}</td>
                  <td>{type.properties.Hitpoints ?? "—"}</td>
                  <td>{type.properties.HelmHitpoints ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="source-values-note">{t("omitted")}</p>
      </details>
    </div>
  );
}

export function RosterViewer() {
  const { view, setView } = useExperience();
  const t = useTranslations("roster");
  const dialog = useRef<HTMLDialogElement>(null),
    returnFocus = useRef<HTMLElement | null>(null);
  const active = view === "roster";
  useEffect(() => {
    if (active && !dialog.current?.open) {
      returnFocus.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      dialog.current?.showModal();
    }
    if (!active && dialog.current?.open) dialog.current?.close();
  }, [active]);
  return (
    <dialog
      className="wave-viewer roster-viewer"
      ref={dialog}
      aria-labelledby="roster-viewer-title"
      onClose={() => {
        if (active) setView(null);
        returnFocus.current?.focus({ preventScroll: true });
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) setView(null);
      }}
    >
      <div className="viewer-header">
        <div>
          <span className="eyebrow">{t("eyebrow")}</span>
          <h2 id="roster-viewer-title">{t("title")}</h2>
        </div>
        <button
          className="close-view"
          aria-label={t("close")}
          onClick={() => setView(null)}
        >
          ×
        </button>
      </div>
      <div className="viewer-body">{active && <Experiment />}</div>
    </dialog>
  );
}
