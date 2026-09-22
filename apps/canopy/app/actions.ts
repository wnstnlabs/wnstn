'use server';

import { redirect } from 'next/navigation';
import { Effect } from 'effect';
import { normalizeDomainEffect, domainToSiteId } from '@/lib/effect/domain';

/**
 * Domain capture — Effect pipeline, no useState/useEffect.
 * Uses Effect for validation + error mapping, then Next.js redirect.
 */
export async function submitDomainAction(formData: FormData): Promise<void> {
  const raw = String(formData.get('domain') ?? '');
  const tab = String(formData.get('tab') ?? 'pageviews');

  const program = Effect.gen(function* () {
    const host = yield* normalizeDomainEffect(raw);
    const siteId = domainToSiteId(host);
    return { host, siteId, tab };
  });

  const result = await Effect.runPromise(
    program.pipe(
      Effect.catchAll(() =>
        Effect.succeed({ host: null as string | null, siteId: null as string | null, tab })
      )
    )
  );

  if (!result.host || !result.siteId) {
    // On invalid domain, redirect back with error flag — UI shows inline error via searchParam
    redirect(`/?error=invalid_domain&value=${encodeURIComponent(raw)}`);
  }

  redirect(`/onboarding?domain=${encodeURIComponent(result.host)}&tab=${encodeURIComponent(tab)}`);
}
