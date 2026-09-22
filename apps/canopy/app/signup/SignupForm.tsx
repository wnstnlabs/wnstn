'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export function SignupForm({ winstonEnabled }: { winstonEnabled: boolean }) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    const { error } = await (authClient as any).signUp.email({ name, email, password });
    setLoading(false);
    if (error) {
      setErr(error.message ?? 'Could not create account');
      return;
    }
    router.push('/dashboard');
    router.refresh();
  };

  const onWinston = async () => {
    setErr(null);
    const { error } = await (authClient as any).signIn.oauth2({ providerId: 'winston', callbackURL: '/dashboard' } as any);
    if (error) setErr(error.message ?? 'Winston SSO failed');
  };

  return (
    <div className="w-full max-w-[420px] rounded-2xl border border-white/[0.08] bg-[#0f0f12] shadow-[0_24px_64px_rgba(0,0,0,0.6)] overflow-hidden">
      <div className="px-6 pt-6 pb-4">
        <h1 className="text-[20px] font-semibold tracking-tight text-white">Create your workspace</h1>
        <p className="mt-1 text-[13px] text-zinc-400">Start measuring in under a minute.</p>
      </div>

      <div className="px-6 pb-6">
        {err && <div className="mb-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">{err}</div>}

        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <label className="mono text-[11px] text-zinc-400">Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Alex" className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/15" />
          </div>
          <div>
            <label className="mono text-[11px] text-zinc-400">Work email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="alex@company.com" className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/15" />
          </div>
          <div>
            <label className="mono text-[11px] text-zinc-400">Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required placeholder="••••••••" className="mt-1 w-full rounded-xl bg-white/[0.04] border border-white/[0.08] px-3 py-2.5 text-sm text-white placeholder:text-zinc-600 outline-none focus:border-white/15" />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-xl bg-white text-zinc-900 font-medium py-2.5 text-sm hover:bg-zinc-100 disabled:opacity-60">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        {winstonEnabled && (
          <>
            <div className="my-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-white/[0.08]" />
              <span className="mono text-[10px] text-zinc-600">or</span>
              <div className="h-px flex-1 bg-white/[0.08]" />
            </div>
            <button onClick={onWinston} className="w-full rounded-xl border border-white/[0.10] bg-white/[0.04] hover:bg-white/[0.07] px-3 py-2.5 text-sm text-white flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-white" />
              Continue with Winston <span className="mono text-[10px] text-zinc-500">SSO</span>
            </button>
          </>
        )}

        <p className="mt-4 text-center text-xs text-zinc-500">
          Already have an account? <Link href="/login" className="text-white underline underline-offset-4">Log in</Link>
        </p>
      </div>
    </div>
  );
}
