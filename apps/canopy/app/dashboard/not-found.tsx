'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex items-center justify-center px-6">
      <div className="text-center">
        <div className="text-6xl">404</div>
        <h1 className="mt-4 text-xl font-semibold text-white">Page not found</h1>
        <p className="mt-2 text-sm text-zinc-400">The page you're looking for doesn't exist.</p>
        <div className="mt-6 flex gap-3 justify-center">
          <Button asChild>
            <Link href="/dashboard">Go to Dashboard</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}