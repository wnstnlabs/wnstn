'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error('Dashboard error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100 flex items-center justify-center px-6">
      <Card className="w-full max-w-md border-red-500/20 bg-red-500/5">
        <CardContent className="pt-8 text-center">
          <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-red-400" />
          </div>
          <h1 className="text-xl font-semibold text-white">Something went wrong</h1>
          <p className="mt-2 text-sm text-zinc-400">
            We couldn't load your analytics data. This might be a temporary issue.
          </p>
          {error.digest && (
            <p className="mt-2 mono text-xs text-zinc-600">Error ID: {error.digest}</p>
          )}
          <div className="mt-6 flex flex-col sm:flex-row gap-2 justify-center">
            <Button onClick={reset}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" asChild>
              <Link href="/dashboard">
                <Home className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}