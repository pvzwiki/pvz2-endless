'use client';
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import type { ArticleEvidence } from '@/content/evidence-types';

const EvidenceContext = createContext<{
  entries: ArticleEvidence;
  note: string | null;
  setNote: (id: string | null) => void;
} | null>(null);
function useEvidence() {
  const value = useContext(EvidenceContext);
  if (!value) throw new Error('Evidence notes require their provider.');
  return value;
}
export function EvidenceProvider({
  children,
  entries,
}: {
  children: ReactNode;
  entries: ArticleEvidence;
}) {
  const [note, setNote] = useState<string | null>(null);
  return (
    <EvidenceContext.Provider value={{ entries, note, setNote }}>
      {children}
      <EvidenceNotes />
    </EvidenceContext.Provider>
  );
}
export function Note({ id }: { id: string }) {
  const { entries, setNote } = useEvidence();
  const t = useTranslations('site');
  const entry = entries[id];
  if (!entry) throw new Error(`Evidence ${id} was not provided to this article.`);
  return (
    <sup>
      <a
        className="note-ref"
        href={`#evidence-${id}`}
        aria-label={`${t('footnoteLabel')} ${entry.number}`}
        onClick={(event) => {
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
          event.preventDefault();
          event.currentTarget.focus({ preventScroll: true });
          setNote(id);
        }}
      >
        {entry.number}
      </a>
    </sup>
  );
}
function EvidenceNotes() {
  const { entries, note, setNote } = useEvidence();
  const t = useTranslations('site');
  const dialog = useRef<HTMLDialogElement>(null);
  const entry = note ? entries[note] : null;
  useEffect(() => {
    if (note && !dialog.current?.open) dialog.current?.showModal();
    if (!note && dialog.current?.open) dialog.current?.close();
  }, [note]);
  return (
    <dialog
      ref={dialog}
      className="evidence-dialog"
      aria-labelledby="evidence-title"
      onClose={() => setNote(null)}
      onClick={(event) => {
        if (event.target === event.currentTarget) setNote(null);
      }}
    >
      <div className="evidence-content">
        <div className="evidence-top">
          <span className="eyebrow">
            {t('note')} / {entry?.number}
          </span>
          <button className="icon-button" aria-label={t('close')} onClick={() => setNote(null)}>
            ×
          </button>
        </div>
        <h2 id="evidence-title">{entry?.title}</h2>
        <p>{entry?.text}</p>
        <div className="address-list">
          {entry?.addresses.map((address) => (
            <code key={address}>{address}</code>
          ))}
        </div>
        {note && (
          <a
            className="text-link"
            href={`#evidence-${note}`}
            onClick={() => {
              const appendix = document.getElementById('evidence');
              if (appendix instanceof HTMLDetailsElement) appendix.open = true;
              const entry = document.getElementById(`evidence-${note}`)?.querySelector('details');
              if (entry) entry.open = true;
              dialog.current?.close();
              setNote(null);
            }}
          >
            {t('sourceIntro')} ↗
          </a>
        )}
      </div>
    </dialog>
  );
}
