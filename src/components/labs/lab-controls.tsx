"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ordinaryLevels } from "@/lib/wave-model";

// Lab bodies mount only inside the client-side dialog portal. Read their URL
// inputs on the first mount so a later effect cannot overwrite an early click.
export function useParameters<T extends Record<string, number>>(
  prefix: string,
  defaults: T,
  limits: { [K in keyof T]: readonly [number, number, number?] },
) {
  const bounds = useRef(limits);
  const normalize = (key: keyof T, value: number) => {
    const [min, max, step = 1] = bounds.current[key];
    let result = Math.max(min, Math.min(max, Math.round(value / step) * step));
    if (key === "level" && result % 5 === 0) result = Math.min(max, result + 1);
    return result;
  };
  const [values, setValues] = useState<T>(() => {
    const next = { ...defaults };
    const query = new URLSearchParams(
      typeof window === "undefined" ? "" : window.location.search,
    );
    for (const key in next) {
      const raw = query.get(`${prefix}.${key}`);
      if (raw === null) continue;
      const n = Number(raw);
      if (Number.isFinite(n)) next[key] = normalize(key, n) as T[typeof key];
    }
    return next;
  });
  useEffect(() => {
    const url = new URL(window.location.href);
    for (const key in values)
      url.searchParams.set(`${prefix}.${key}`, String(values[key]));
    window.history.replaceState(window.history.state, "", url);
  }, [prefix, values]);
  const update = (patch: Partial<T>) =>
    setValues((old) => {
      const next = { ...old };
      for (const key in patch) {
        const value = patch[key];
        if (value !== undefined && Number.isFinite(value))
          next[key] = normalize(key, value) as T[typeof key];
      }
      return next;
    });
  return [values, update, true] as const;
}
export function useCanvasWidth() {
  const ref = useRef<HTMLDivElement>(null),
    [width, setWidth] = useState(900);
  useEffect(() => {
    if (!ref.current) return;
    const observer = new ResizeObserver((entries) =>
      setWidth(Math.max(280, entries[0].contentRect.width)),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return [ref, width] as const;
}
export function LevelControl({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const t = useTranslations("labs");
  return (
    <label>
      {t("level")}
      <select
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
      >
        {ordinaryLevels.map((level) => (
          <option key={level} value={level}>
            {level}
          </option>
        ))}
      </select>
    </label>
  );
}
export function Playback({
  step,
  total,
  onChange,
}: {
  step: number;
  total: number;
  onChange: (step: number) => void;
}) {
  const t = useTranslations("labs");
  const [playing, setPlaying] = useState(false);
  const callback = useRef(onChange);
  callback.current = onChange;
  useEffect(() => {
    if (!playing) return;
    if (step >= total) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => callback.current(step + 1), 950);
    return () => clearTimeout(timer);
  }, [playing, step, total]);
  const go = (value: number) => {
    setPlaying(false);
    onChange(value);
  };
  return (
    <div className="lab-playback">
      <div>
        <button onClick={() => go(0)} disabled={step === 0}>
          {t("reset")}
        </button>
        <button
          onClick={() => go(step - 1)}
          disabled={step === 0}
          aria-label={t("previous")}
        >
          ←
        </button>
        <button onClick={() => setPlaying(!playing)} disabled={step >= total}>
          {playing ? t("pause") : t("play")}
        </button>
        <button onClick={() => go(step + 1)} disabled={step >= total}>
          {t("next")} →
        </button>
      </div>
      <label>
        <span className="sr-only">{t("step")}</span>
        <input
          type="range"
          min={0}
          max={Math.max(1, total)}
          value={step}
          onChange={(event) => go(Math.min(total, Number(event.target.value)))}
        />
      </label>
      <output>
        {step} / {total}
      </output>
    </div>
  );
}
export function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="lab-stat">
      <span>{label}</span>
      <output aria-label={label}>{value}</output>
      {detail && <small>{detail}</small>}
    </div>
  );
}
export function Toggle({
  checked,
  onChange,
  children,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  children: ReactNode;
}) {
  return (
    <label className="lab-toggle">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}
export function StepTitle({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="lab-step-title">
      <span>{String(index).padStart(2, "0")}</span>
      <div>
        <h3>{title}</h3>
        {children && <p>{children}</p>}
      </div>
    </div>
  );
}
