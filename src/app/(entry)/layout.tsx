import type { ReactNode } from 'react';

export default function EntryLayout({ children }: { children: ReactNode }) {
  return <html lang="en"><body style={{ margin: 0, background: '#10241b', color: '#f4f2e9', fontFamily: 'system-ui, sans-serif' }}>{children}</body></html>;
}
