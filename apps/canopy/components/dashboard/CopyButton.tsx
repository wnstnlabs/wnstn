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
      className="mono text-[11px] border border-white/[0.09] bg-[#12151d] text-slate-300 hover:bg-[#171b25] hover:text-slate-100 hover:border-white/[0.16] rounded-md px-2.5 py-1 transition"
    >
      {copied ? 'Copied ✓' : 'Copy'}
    </button>
  );
}
