'use client';
import { useEffect, useRef } from 'react';
export function ReadingProgress() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const main = document.getElementById('main-content');
      if (!main || !ref.current) return;
      const bounds = main.getBoundingClientRect();
      const distance = Math.max(1, main.offsetHeight - window.innerHeight + 100);
      ref.current.style.transform = `scaleX(${Math.max(0, Math.min(1, (100 - bounds.top) / distance))})`;
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const observer = new ResizeObserver(schedule);
    const main = document.getElementById('main-content');
    if (main) observer.observe(main);
    update();
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, []);
  return <div ref={ref} className="reading-progress" aria-hidden="true" />;
}
