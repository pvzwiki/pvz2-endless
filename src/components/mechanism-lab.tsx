"use client";

import { useEffect, useId, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import "./labs/labs.css";

function LoadingView() {
  const t = useTranslations("labs");
  return (
    <p className="lab-loading" role="status">
      {t("loading")}
    </p>
  );
}
const views = {
  pipeline: dynamic(() => import("./labs/pipeline-lab"), {
    loading: LoadingView,
  }),
  reservation: dynamic(() => import("./labs/reservation-lab"), {
    loading: LoadingView,
  }),
  jam: dynamic(() => import("./labs/jam-lab"), { loading: LoadingView }),
  portals: dynamic(() => import("./labs/portal-lab"), { loading: LoadingView }),
  steam: dynamic(() => import("./labs/steam-lab"), { loading: LoadingView }),
  strength: dynamic(() => import("./labs/strength-lab"), {
    loading: LoadingView,
  }),
  placement: dynamic(() => import("./labs/placement-lab"), {
    loading: LoadingView,
  }),
  timing: dynamic(() => import("./labs/timing-lab"), { loading: LoadingView }),
  loot: dynamic(() => import("./labs/loot-lab"), { loading: LoadingView }),
};
export type LabKind = keyof typeof views;

export function MechanismLab({ kind }: { kind: LabKind }) {
  const t = useTranslations("labs");
  const [open, setOpen] = useState(false),
    [ready, setReady] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null),
    trigger = useRef<HTMLButtonElement>(null);
  const id = useId(),
    View = views[kind];
  useEffect(() => {
    setOpen(new URLSearchParams(window.location.search).get("lab") === kind);
    setReady(true);
  }, [kind]);
  useEffect(() => {
    if (!ready) return;
    const url = new URL(window.location.href);
    if (open) {
      url.searchParams.set("lab", kind);
      if (!dialog.current?.open) dialog.current?.showModal();
    } else {
      if (url.searchParams.get("lab") === kind) url.searchParams.delete("lab");
      if (dialog.current?.open) {
        dialog.current.close();
        trigger.current?.focus({ preventScroll: true });
      }
    }
    window.history.replaceState(window.history.state, "", url);
  }, [open, ready, kind]);
  return (
    <div className="mechanism-lab-launch">
      <button
        className="view-launcher"
        ref={trigger}
        disabled={!ready}
        onClick={() => setOpen(true)}
      >
        <span className="launcher-glyph" aria-hidden="true">
          ◇
        </span>
        <span>
          <strong>{t(`${kind}.title`)}</strong>
          <small>{t(`${kind}.description`)}</small>
        </span>
        <span className="launcher-action">
          {t("open")}
          <b aria-hidden="true">+</b>
        </span>
      </button>
      {ready &&
        createPortal(
          <dialog
            className="mechanism-dialog"
            ref={dialog}
            aria-labelledby={id}
            data-lab={kind}
            onCancel={(event) => {
              event.preventDefault();
              setOpen(false);
            }}
            onClick={(event) => {
              if (event.target === event.currentTarget) setOpen(false);
            }}
          >
            <div className="lab-header">
              <div>
                <span className="eyebrow">{t("explore")}</span>
                <h2 id={id}>{t(`${kind}.title`)}</h2>
              </div>
              <button
                className="close-view"
                aria-label={t("close")}
                onClick={() => setOpen(false)}
              >
                ×
              </button>
            </div>
            <div className="lab-body">{open && <View />}</div>
          </dialog>,
          document.body,
        )}
    </div>
  );
}
