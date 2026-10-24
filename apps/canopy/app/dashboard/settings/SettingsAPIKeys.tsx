'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { KeyRound, Loader2, Trash2, ShieldAlert } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ApiKey {
  id: string;
  siteId: string;
  name: string;
  createdAt: string;
}

export function SettingsAPIKeys({ siteId, infisicalEnabled = false }: { siteId: string; infisicalEnabled?: boolean }) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ name: '', key: '', siteId });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [createdKey, setCreatedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch(`/api/api-keys?siteId=${siteId}`)
      .then((r) => r.json())
      .then((data) => {
        setKeys(data.keys ?? []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [siteId]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    try {
      const res = await fetch('/api/api-keys', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, siteId }),
      });
      if (res.ok) {
        const data = await res.json();
        // Server-generated keys are returned once — show them so the user can copy
        if (data.key) {
          setCreatedKey(data.key);
        }
        toast({ title: 'API key created', description: 'Your API key has been generated.' });
        setShowForm(false);
        setForm({ name: '', key: '', siteId });
        // Refetch after creation
        setTimeout(() => {
          fetch(`/api/api-keys?siteId=${siteId}`).then((r) => r.json()).then((data) => setKeys(data.keys ?? []));
        }, 500);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Failed to create API key');
      }
    } catch (err) {
      toast({ title: 'Error', description: (err as Error).message, variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setDeletingId(null);
    try {
      await fetch(`/api/api-keys?siteId=${siteId}&id=${deletingId}`, { method: 'DELETE' });
      toast({ title: 'API key deleted', description: 'The API key has been removed.' });
      // Refetch after deletion
      setTimeout(() => {
        fetch(`/api/api-keys?siteId=${siteId}`).then((r) => r.json()).then((data) => setKeys(data.keys ?? []));
      }, 300);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to delete API key', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-lg font-medium text-white">API Keys</h2>
        <p className="text-slate-500 text-sm mt-1">Manage API keys for programmatic access to your analytics data.</p>
      </div>

      {/* Infisical status */}
      {infisicalEnabled && (
        <Card className="border-canopy-500/20 bg-canopy-500/[0.04]">
          <CardContent className="pt-6 flex items-center gap-3 p-4">
            <ShieldAlert className="h-5 w-5 text-canopy-400" />
            <div className="flex-1">
              <p className="font-medium text-white text-sm">Infisical Enabled</p>
              <p className="text-xs text-slate-500 mt-0.5">
                API keys are stored in Infisical. Keys are managed locally here for validation — you can retrieve them from the Infisical dashboard anytime.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Create key form */}
      {!showForm && (
        <Card className="border-white/[0.06] bg-white/[0.015]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white">Create API Key</CardTitle>
            <CardDescription>Generate an API key for server-side or third-party integration with Canopy.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <Button onClick={() => setShowForm(true)}>
              <KeyRound className="h-4 w-4 mr-2" />
              Create Key
            </Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="border-white/[0.06] bg-white/[0.015]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white">Create API Key</CardTitle>
            <CardDescription>Fill in the details below. The key will be shown once.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={onSubmit} className="space-y-4 pt-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-slate-400 text-sm">Name</Label>
                <Input
                  id="name"
                  placeholder="e.g., Production Server SDK"
                  className="bg-white/[0.03] border-white/[0.08] h-10"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="key" className="text-slate-400 text-sm">API Key</Label>
                <Input
                  id="key"
                  placeholder="Leave empty to generate one automatically"
                  className="bg-white/[0.03] border-white/[0.08] h-10 mono"
                  value={form.key}
                  onChange={(e) => setForm({ ...form, key: e.target.value })}
                />
                <p className="text-xs text-slate-500">
                  Leave empty to generate a new key, or paste an existing one from Infisical.
                </p>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={creating || !form.name}>
                  {creating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Key'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Show the key once — it is never returned again */}
      {createdKey && (
        <Card className="border-canopy-500/30 bg-canopy-500/[0.04]">
          <CardContent className="pt-6 space-y-3">
            <div className="flex items-center gap-3">
              <KeyRound className="h-5 w-5 text-canopy-400" />
              <div>
                <p className="font-medium text-white text-sm">Your new API key</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Copy it now — it is shown only once and cannot be retrieved later.
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                readOnly
                value={createdKey}
                className="flex-1 bg-white/[0.03] border-white/[0.08] h-10 mono text-xs"
                onFocus={(e) => e.currentTarget.select()}
              />
              <Button
                type="button"
                variant="outline"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(createdKey);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                    toast({ title: 'Copied', description: 'API key copied to clipboard' });
                  } catch {
                    toast({ title: 'Error', description: 'Could not copy to clipboard', variant: 'destructive' });
                  }
                }}
              >
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Keys table */}
      <Card className="border-white/[0.06] bg-white/[0.015]">
        <CardContent className="pt-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-canopy-500" />
            </div>
          ) : keys.length === 0 ? (
            <div className="text-center py-12">
              <KeyRound className="h-12 w-12 mx-auto text-slate-500 mb-4" />
              <p className="text-slate-500">No API keys yet</p>
              <Button className="mt-4" onClick={() => setShowForm(true)}>
                <KeyRound className="h-4 w-4 mr-2" />
                Create Your First Key
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-white/[0.06]">
                  <TableHead>Name</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {keys.map((key) => (
                  <TableRow key={key.id} className="hover:bg-white/[0.02]">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-white">{key.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{key.siteId}</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-slate-500">{new Date(key.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Trash2 className="h-4 w-4 text-red-400" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this API key?</AlertDialogTitle>
                            <AlertDialogDescription>
                              This will remove "{key.name}" and all its permissions. This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogAction onClick={handleDelete} disabled={deletingId === key.id}>
                            {deletingId === key.id ? 'Deleting...' : 'Delete Key'}
                          </AlertDialogAction>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
