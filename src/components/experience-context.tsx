'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { createWavePlan, isOrdinaryLevel, type WavePlan } from '@/lib/wave-model';
import type { Locale } from '@/i18n/locales';
import { useLocale } from 'next-intl';

type Experience = {
  ready: boolean;
  locale: Locale; plan: WavePlan; selected: number; showBoost: boolean;
  setLevel: (level: number) => void; setSelected: (wave: number) => void;
  inspectWave: (level: number, wave: number) => void;
  setShowBoost: (value: boolean) => void;
  view: 'visualization' | 'levels' | 'roster' | null;
  setView: (view: 'visualization' | 'levels' | 'roster' | null) => void;
};
const Context = createContext<Experience | null>(null);

export function ExperienceProvider({ children, kind }: { children: ReactNode; kind: 'waves' | 'roster' }) {
  const locale = useLocale() as Locale;
  const [level, updateLevel] = useState(36);
  const [selected, updateSelected] = useState(5);
  const [showBoost, setShowBoost] = useState(true);
  const [view, setView] = useState<'visualization' | 'levels' | 'roster' | null>(null);
  const [urlReady, setUrlReady] = useState(false);
  const plan = useMemo(() => createWavePlan(level), [level]);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const requested = Number(query.get('level'));
    const validLevel = isOrdinaryLevel(requested) ? requested : 36;
    const requestedWave = Number(query.get('wave'));
    updateLevel(validLevel);
    updateSelected(Number.isInteger(requestedWave) && requestedWave > 0
      ? Math.min(requestedWave, createWavePlan(validLevel).count) : 5);
    setShowBoost(query.get('boost') !== '0');
    const requestedView = query.get('view');
    if (kind === 'waves' && (requestedView === 'visualization' || requestedView === 'levels')) setView(requestedView);
    if (kind === 'roster' && requestedView === 'roster') setView(requestedView);
    setUrlReady(true);
  }, [kind]);
  useEffect(() => {
    if (!urlReady) return;
    const url = new URL(window.location.href);
    url.searchParams.set('level', String(level));
    if (kind === 'waves') {
      url.searchParams.set('wave', String(selected));
      url.searchParams.set('boost', showBoost ? '1' : '0');
    } else {
      url.searchParams.delete('wave');
      url.searchParams.delete('boost');
    }
    if (view) url.searchParams.set('view', view); else url.searchParams.delete('view');
    window.history.replaceState(window.history.state, '', url);
  }, [level, selected, showBoost, view, urlReady, kind]);
  function setLevel(value: number) {
    if (!isOrdinaryLevel(value)) return;
    updateLevel(value);
    updateSelected((previous) => Math.min(previous, createWavePlan(value).count));
  }
  return <Context.Provider value={{ ready: urlReady, locale, plan, selected, showBoost, setLevel,
    inspectWave: (nextLevel, wave) => {
      if (!isOrdinaryLevel(nextLevel)) return;
      updateLevel(nextLevel);
      updateSelected(Math.max(1, Math.min(createWavePlan(nextLevel).count, wave)));
    },
    setSelected: (wave) => updateSelected(Math.max(1, Math.min(plan.count, wave))),
    setShowBoost, view, setView }}>{children}</Context.Provider>;
}

export function useExperience() {
  const value = useContext(Context);
  if (!value) throw new Error('An experience provider is required.');
  return value;
}
