'use client';

import dynamic from 'next/dynamic';
import { useLayoutEffect, type ReactNode } from 'react';
import { ExperienceProvider, useExperience } from './experience-context';

const WaveViewer = dynamic(() => import('./wave-explorer').then((module) => module.WaveViewer));
const RosterViewer = dynamic(() =>
  import('./roster-explorer').then((module) => module.RosterViewer),
);

function ActiveViewer({ kind }: { kind: 'waves' | 'roster' }) {
  const { view } = useExperience();
  const open = view !== null;
  useLayoutEffect(() => {
    if (!open) return;
    const element = document.activeElement;
    return () => {
      if (element instanceof HTMLElement) element.focus({ preventScroll: true });
    };
  }, [open]);
  return open ? kind === 'waves' ? <WaveViewer /> : <RosterViewer /> : null;
}
export default function ExperimentHost({
  kind,
  children,
}: {
  kind: 'waves' | 'roster';
  children: ReactNode;
}) {
  return (
    <ExperienceProvider kind={kind}>
      {children}
      <ActiveViewer kind={kind} />
    </ExperienceProvider>
  );
}
