'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export function LoginForm({ winstonEnabled }: { winstonEnabled: boolean }) {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get('next') ?? '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await (authClient as any).signIn.email({ email, password });
    setLoading(false);
    if (error) {
      setErr(error.message ?? 'Could not sign in');
      return;
    }
    router.push(next);
    router.refresh();
  };

  const onWinston = async () => {
    setErr(null);
    setLoading(true);
    const { error } = await (authClient as any).signIn.oauth2({
      providerId: 'winston',
      callbackURL: next,
    } as any);
    // better-auth will redirect; if not, show error
    if (error) {
      setErr(error.message ?? 'Winston SSO failed');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#0f0f12] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <div className="flex items-center gap-2">
          <span className="size-7 rounded-lg bg-white text-zinc-900 grid place-items-center font-semibold text-xs">◯</span>
          <span className="font-semibold tracking-tight text-white">canopy</span>
          <span className="ml-auto mono text-[10px] text-zinc-500 border border-white/[0.08] rounded-full px-2 py-0.5">secure sign in</span>
        </div>
        <h1 className="mt-5 text-[20px] font-semibold tracking-tight text-white">Welcome back</h1>
        <p className="mt-1 text-[13px] text-zinc-400">Sign in to your analytics workspace.</p>
      </div>

      <div className="px-6 pb-6">
        {err && <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</div>}

        <form onSubmit={onEmail} className="space-y-3">
          <div>
            <label className="mono text-[11px] text-zinc-400">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@company.com"
              className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/15 focus:bg-white/[0.06]"
            />
          </div>
          <div>
            <label className="mono text-[11px] text-zinc-400">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/15 focus:bg-white/[0.06]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white text-zinc-900 font-medium py-2.5 text-sm hover:bg-zinc-100 disabled:opacity-60 transition"
          >
            {loading ? 'Signing in…' : 'Continue with email'}
          </button>
        </form>

        {winstonEnabled && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="mono text-[10px] text-zinc-600">or</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>
            <button
              onClick={onWinston}
              disabled={loading}
              className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.07] px-3 py-2.5 text-sm text-white flex items-center justify-center gap-2 transition disabled:opacity-60"
            >
              <span className="size-2 rounded-full bg-white" />
              Continue with Winston
              <span className="mono text-[10px] text-zinc-500">SSO</span>
            </button>
          </>
        )}

        <p className="mt-4 text-center text-xs text-zinc-500">
          No account? <Link href="/signup" className="text-white underline underline-offset-4">Create one</Link>
        </p>
        <p className="mt-2 text-center mono text-[10px] text-zinc-600">1.5kb script • No cookies • You own the data</p>
      </div>
    </div>
  );
}
