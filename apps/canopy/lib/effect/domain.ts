import { Effect, Data } from 'effect';

export class InvalidDomainError extends Data.TaggedError('InvalidDomainError')<{ input: string }> {}

export const normalizeDomainEffect = (input: string) =>
  Effect.gen(function* () {
    const trimmed = input.trim().toLowerCase();
    if (!trimmed) return yield* Effect.fail(new InvalidDomainError({ input }));
    const withProto = trimmed.includes('://') ? trimmed : `https://${trimmed}`;
    let host: string;
    try {
      host = new URL(withProto).hostname.replace(/^www\./, '');
    } catch {
      return yield* Effect.fail(new InvalidDomainError({ input }));
    }
    if (!host.includes('.') || host.length < 3 || host.includes(' ')) {
      return yield* Effect.fail(new InvalidDomainError({ input }));
    }
    return host;
  });

export const domainToSiteId = (domain: string) => `canopy_${domain.replace(/[^a-z0-9]/g, '_')}`;

export const parseDomainForm = (formData: FormData) =>
  Effect.gen(function* () {
    const raw = String(formData.get('domain') ?? '');
    const tab = String(formData.get('tab') ?? 'pageviews');
    const host = yield* normalizeDomainEffect(raw);
    return { host, tab, siteId: domainToSiteId(host) };
  });
