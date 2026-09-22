'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { Separator } from '@/components/ui/Separator';
import { Plus, Check, Loader2, Trash2, Globe, Shield, ExternalLink, Key } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const customDomainSchema = z.object({
  domain: z.string().min(1, 'Domain is required').regex(
    /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/,
    'Invalid domain format (e.g., analytics.example.com)'
  ),
});

type CustomDomainFormData = z.infer<typeof customDomainSchema>;

interface CustomDomain {
  id: string;
  domain: string;
  verified: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
  cnameTarget: string;
  createdAt: string;
}

export function SettingsDomain({ 
  customDomains = [],
  siteId 
}: { 
  customDomains: CustomDomain[];
  siteId: string;
}) {
  const { toast } = useToast();
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<CustomDomain | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [verifying, setVerifying] = useState<string | null>(null);

  const form = useForm<CustomDomainFormData>({
    resolver: zodResolver(customDomainSchema),
    defaultValues: { domain: '' },
  });

  const onAddSubmit = async (data: CustomDomainFormData) => {
    setAdding(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/custom-domains`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: 'Domain added', description: 'Please verify the domain using the CNAME record.' });
        setAddDialogOpen(false);
        form.reset();
      } else {
        throw new Error('Failed to add domain');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to add domain', variant: 'destructive' });
    } finally {
      setAdding(false);
    }
  };

  const handleVerify = async (domain: CustomDomain) => {
    setVerifying(domain.id);
    try {
      const res = await fetch(`/api/sites/${siteId}/custom-domains/${domain.id}/verify`, {
        method: 'POST',
      });
      if (res.ok) {
        toast({ title: 'Verification started', description: 'Checking DNS records...' });
      } else {
        throw new Error('Failed to verify');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to start verification', variant: 'destructive' });
    } finally {
      setVerifying(null);
    }
  };

  const handleDelete = async () => {
    if (!selectedDomain) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/custom-domains/${selectedDomain.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Domain removed', description: `${selectedDomain.domain} has been removed.` });
        setDeleteDialogOpen(false);
      } else {
        throw new Error('Failed to delete');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete domain', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  const getSSLStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'default' | 'secondary' | 'destructive'> = {
      active: 'success',
      pending: 'default',
      failed: 'destructive',
    };
    return variants[status] || 'secondary';
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Custom Domains</h1>
          <p className="text-zinc-500 mt-1">Use your own domain for tracking and dashboards</p>
        </div>
        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Domain
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Custom Domain</DialogTitle>
              <DialogDescription>
                Enter a subdomain (e.g., analytics.example.com) to use for your tracking script and dashboard.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onAddSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="domain">Subdomain</Label>
                  <div className="flex gap-2">
                    <Input
                      id="domain"
                      {...form.register('domain')}
                      placeholder="analytics.example.com"
                    />
                  </div>
                  {form.formState.errors.domain && (
                    <p className="text-sm text-red-400">{form.formState.errors.domain.message}</p>
                  )}
                  <p className="text-xs text-zinc-500">
                    Must be a valid subdomain (e.g., analytics.yourdomain.com)
                  </p>
                </div>
              </div>
<DialogFooter>
                <Button type="button" variant="outline" onClick={() => { setAddDialogOpen(false); form.reset(); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={adding}>
                  {adding ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Adding...</> : 'Add Domain'}
                </Button>
              </DialogFooter>
              </form>
            </DialogContent>
        </Dialog>
      </div>

      {/* DNS Configuration Guide */}
      <Card className="border-amber-500/30 bg-amber-500/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-amber-400" />
            DNS Configuration Required
          </CardTitle>
          <CardDescription>
            Add a CNAME record to your DNS provider to verify domain ownership and enable SSL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Record Type</Label>
                <code className="mono text-sm bg-black/30 rounded px-3 py-2 block break-all">CNAME</code>
              </div>
              <div className="space-y-2">
                <Label>Host / Name</Label>
                <code className="mono text-sm bg-black/30 rounded px-3 py-2 block break-all">
                  {customDomains[0]?.domain ? customDomains[0].domain.split('.')[0] : 'analytics'}
                </code>
              </div>
              <div className="space-y-2">
                <Label>Value / Target</Label>
                <code className="mono text-sm bg-black/30 rounded px-3 py-2 block break-all">
                  {customDomains[0]?.cnameTarget || 'cname.canopy.wnstn.io'}
                </code>
              </div>
              <div className="space-y-2">
                <Label>TTL</Label>
                <code className="mono text-sm bg-black/30 rounded px-3 py-2 block">300 (5 minutes)</code>
              </div>
            </div>
          </div>
          <p className="text-sm text-zinc-500">
            DNS changes can take up to 48 hours to propagate. SSL certificates are provisioned automatically after verification.
          </p>
        </CardContent>
      </Card>

      {/* Custom Domains List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Your Domains</CardTitle>
          <Button onClick={() => setAddDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </Button>
        </CardHeader>
        <CardContent className="pt-0">
          {customDomains.length === 0 ? (
            <div className="text-center py-12">
              <Globe className="h-12 w-12 mx-auto text-zinc-500 mb-4" />
              <p className="text-zinc-500">No custom domains yet</p>
              <p className="text-sm text-zinc-500 mt-2">Add a custom domain to use your own subdomain for tracking</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domain</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>SSL</TableHead>
                  <TableHead className="w-12">Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customDomains.map((domain) => (
                  <TableRow key={domain.id}>
                    <TableCell className="flex items-center gap-3">
                      <Globe className="h-4 w-4 text-zinc-500" />
                      <div>
                        <p className="font-mono text-sm text-white">{domain.domain}</p>
                        <p className="text-xs text-zinc-500">CNAME → {domain.cnameTarget}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={domain.verified ? 'success' : 'secondary'}>
                        {domain.verified ? 'Verified' : 'Pending'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getSSLStatusBadge(domain.sslStatus)}>
                        {domain.sslStatus.charAt(0).toUpperCase() + domain.sslStatus.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-zinc-500 mono text-xs">
                      {new Date(domain.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      {!domain.verified && (
                        <Button variant="ghost" size="icon" onClick={() => handleVerify(domain)} disabled={verifying === domain.id}>
                          {verifying === domain.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="icon">
            <Trash2 className="h-4 w-4" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove custom domain?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{selectedDomain?.domain}</strong> and its SSL certificate. The domain will no longer work for tracking.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogAction onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Removing...' : 'Remove Domain'}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}