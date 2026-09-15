'use client';
import type { ReactNode } from 'react';
import './new-labs.css';
import { LazyMotion, MotionConfig } from 'motion/react';
const features = () => import('./motion-features').then((module) => module.default);
export function AnimatedLab({ children }: { children: ReactNode }) {
  return (
    <MotionConfig reducedMotion="user">
      <LazyMotion features={features} strict>
        {children}
      </LazyMotion>
    </MotionConfig>
  );
}
