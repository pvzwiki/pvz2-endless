import type { ReactNode } from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

/** Server boundaries send only messages used by the enclosed controls. */
export async function ClientMessages({
  children,
  labs = [],
  namespaces = [],
}: {
  children: ReactNode;
  labs?: readonly string[];
  namespaces?: readonly ('roster' | 'plants' | 'catalog' | 'equipment' | 'search')[];
}) {
  const all = await getMessages();
  const selectedLabs = new Set(labs);
  if (selectedLabs.has('timing')) selectedLabs.add('announcement');
  const messages = {
    site: all.site,
    strengthReference: all.strengthReference,
    ...Object.fromEntries(namespaces.map((name) => [name, all[name]])),
    ...(labs.length
      ? {
          labs: Object.fromEntries(
            Object.entries(all.labs).filter(
              ([key, value]) => typeof value === 'string' || selectedLabs.has(key),
            ),
          ),
        }
      : {}),
  };
  return <NextIntlClientProvider messages={messages}>{children}</NextIntlClientProvider>;
}
