'use client';

import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1200);
      }}
      className="mono text-[11px] border border-white/[0.08] bg-white text-zinc-900 hover:bg-zinc-100 rounded-full px-2.5 py-1 transition"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  );
}
