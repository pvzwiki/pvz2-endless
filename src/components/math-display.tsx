"use client";

import { useEffect, useRef, useState, type ComponentProps } from "react";
import { useTranslations } from "next-intl";

export function MathDisplay(props: ComponentProps<"span">) {
  const t = useTranslations("site");
  const ref = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(false);
  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const measure = () =>
      setOverflow(element.scrollWidth > element.clientWidth + 1);
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    const content = element.querySelector(".katex");
    if (content) observer.observe(content);
    measure();
    return () => observer.disconnect();
  }, []);
  return (
    <>
      <span
        {...props}
        ref={ref}
        tabIndex={overflow ? 0 : undefined}
        role={overflow ? "group" : undefined}
        aria-label={overflow ? t("scrollableFormula") : undefined}
        onKeyDown={(event) => {
          props.onKeyDown?.(event);
          if (
            !overflow ||
            event.defaultPrevented ||
            event.altKey ||
            event.ctrlKey ||
            event.metaKey ||
            event.shiftKey
          )
            return;
          if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
            event.preventDefault();
            event.currentTarget.scrollLeft +=
              event.key === "ArrowRight" ? 48 : -48;
          }
        }}
      />
      {overflow && (
        <span className="math-scroll-note" aria-hidden="true">
          ↔ {t("scrollFormulaHint")}
        </span>
      )}
    </>
  );
}
