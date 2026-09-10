'use client';

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { evidence, type EvidenceId } from '@/content/evidence';
import { useLocale, useTranslations } from 'next-intl';

const EvidenceContext = createContext<{ note: EvidenceId | null; setNote: (id: EvidenceId | null) => void } | null>(null);
function useEvidence() {
  const value = useContext(EvidenceContext);
  if (!value) throw new Error('Evidence notes require their provider.');
  return value;
}
export function EvidenceProvider({ children }: { children: ReactNode }) {
  const [note, setNote] = useState<EvidenceId | null>(null);
  return <EvidenceContext.Provider value={{ note, setNote }}>{children}<EvidenceNotes /></EvidenceContext.Provider>;
}

export function Note({ id }: { id: EvidenceId }) {
  const { setNote } = useEvidence();
  const t = useTranslations('site');
  return <sup><button className="note-ref" onClick={(event) => { event.currentTarget.focus({ preventScroll: true }); setNote(id); }}
    aria-label={`${t('footnoteLabel')} ${evidence[id].number}`}>
    {evidence[id].number}
  </button></sup>;
}

function EvidenceNotes() {
  const { note, setNote } = useEvidence();
  const locale = useLocale();
  const dialog = useRef<HTMLDialogElement>(null);
  const t = useTranslations('site');
  const entry = note ? evidence[note] : null;
  useEffect(() => {
    if (note && !dialog.current?.open) dialog.current?.showModal();
    if (!note && dialog.current?.open) dialog.current?.close();
  }, [note]);
  return <dialog ref={dialog} className="evidence-dialog" aria-labelledby="evidence-title"
    onClose={() => setNote(null)} onClick={(event) => {
      if (event.target === event.currentTarget) setNote(null);
    }}>
    <div className="evidence-content">
      <div className="evidence-top"><span className="eyebrow">{t('note')} / {entry?.number}</span>
        <button className="icon-button" aria-label={t('close')} onClick={() => setNote(null)}>×</button></div>
      <h2 id="evidence-title">{entry?.[locale].title}</h2>
      <p>{entry?.[locale].text}</p>
      <div className="address-list">{entry?.addresses.map((address) => <code key={address}>{address}</code>)}</div>
    </div>
  </dialog>;
}
