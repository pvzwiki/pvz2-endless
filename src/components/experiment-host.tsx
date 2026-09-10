'use client';

import dynamic from 'next/dynamic';
import type { ReactNode } from 'react';
import { ExperienceProvider } from './experience-context';

const WaveViewer = dynamic(() => import('./wave-explorer').then((module) => module.WaveViewer));
const RosterViewer = dynamic(() => import('./roster-explorer').then((module) => module.RosterViewer));

export default function ExperimentHost({ kind, children }: { kind: 'waves' | 'roster'; children: ReactNode }) {
  return <ExperienceProvider kind={kind}>{children}{kind === 'waves' ? <WaveViewer /> : <RosterViewer />}</ExperienceProvider>;
}
