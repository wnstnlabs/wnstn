'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { formatNumber, cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Copy, Check, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const siteSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  domain: z.string().min(1, 'Domain is required'),
  public: z.boolean(),
  trackOutbound: z.boolean(),
  respectDnt: z.boolean(),
  sampleRate: z.number().min(0).max(1),
});

type SiteFormData = z.infer<typeof siteSchema>;

interface SiteData {
  id: string;
  domain: string;
  name: string;
  public: boolean;
  verified: boolean;
  verificationRecord: string;
  createdAt: string;
}

export function SettingsGeneral({ site }: { site: SiteData }) {
  const router = useRouter();
  const { toast } = useToast();
  const [verifying, setVerifying] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const form = useForm<SiteFormData>({
    resolver: zodResolver(siteSchema),
    defaultValues: {
      name: site.name,
      domain: site.domain,
      public: site.public,
      trackOutbound: true,
      respectDnt: true,
      sampleRate: 1,
    },
  });

  const onSubmit = async (data: SiteFormData) => {
    try {
      const res = await fetch(`/api/sites/${site.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: 'Settings saved', description: 'Your site settings have been updated.' });
      } else {
        throw new Error('Failed to save');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to save settings', variant: 'destructive' });
    }
  };

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await fetch(`/api/sites/${site.id}/verify`, { method: 'POST' });
      if (res.ok) {
        toast({ title: 'Verification started', description: 'We\'re checking your DNS record.' });
        router.refresh();
      } else {
        throw new Error('Failed to verify');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to start verification', variant: 'destructive' });
    } finally {
      setVerifying(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/sites/${site.id}`, { method: 'DELETE' });
      if (res.ok) {
        toast({ title: 'Site deleted', description: 'The site has been permanently removed.' });
        router.push('/dashboard');
      } else {
        throw new Error('Failed to delete');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to delete site', variant: 'destructive' });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">General Settings</h1>
        <p className="text-zinc-500 mt-1">Configure your site's basic settings</p>
      </div>

      <Tabs defaultValue="settings" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="verification">Domain Verification</TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Basic Information</CardTitle>
                <CardDescription>How your site appears in the dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Site Name</Label>
                  <Input
                    id="name"
                    {...form.register('name')}
                    placeholder="My Website"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="domain">Domain</Label>
                  <div className="flex gap-2">
                    <Input
                      id="domain"
                      {...form.register('domain')}
                      placeholder="example.com"
                    />
                    <Badge variant={site.verified ? 'success' : 'secondary'}>
                      {site.verified ? 'Verified' : 'Unverified'}
                    </Badge>
                  </div>
                  {form.formState.errors.domain && (
                    <p className="text-sm text-red-400">{form.formState.errors.domain.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sampleRate">Sample Rate</Label>
                  <Select
                    value={String(form.watch('sampleRate') ?? 1)}
                    onValueChange={(v) => form.setValue('sampleRate', Number(v), { shouldDirty: true })}
                  >
                    <SelectTrigger id="sampleRate">
                      <SelectValue placeholder="Select sample rate" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">100% (all events)</SelectItem>
                      <SelectItem value="0.5">50%</SelectItem>
                      <SelectItem value="0.1">10%</SelectItem>
                      <SelectItem value="0.01">1%</SelectItem>
                      <SelectItem value="0.001">0.1%</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-zinc-500">Percentage of events to track (useful for high-traffic sites)</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tracking Options</CardTitle>
                <CardDescription>Control what data is collected</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Track Outbound Links</p>
                    <p className="text-sm text-zinc-500">Automatically track clicks to external domains</p>
                  </div>
                  <Switch
                    {...form.register('trackOutbound')}
                    checked={form.watch('trackOutbound') ?? true}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Respect Do Not Track</p>
                    <p className="text-sm text-zinc-500">Honor browser DNT header (GDPR friendly)</p>
                  </div>
                  <Switch
                    {...form.register('respectDnt')}
                    checked={form.watch('respectDnt') ?? true}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-white">Public Dashboard</p>
                    <p className="text-sm text-zinc-500">Allow anyone with the link to view analytics</p>
                  </div>
                  <Switch
                    {...form.register('public')}
                    checked={form.watch('public') ?? false}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline">Cancel</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="verification">
          <Card>
            <CardHeader>
              <CardTitle>Domain Verification</CardTitle>
              <CardDescription>
                Verify ownership of your domain to unlock custom domain features and ensure data accuracy.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className={cn(
                'rounded-xl p-4 border',
                site.verified
                  ? 'border-emerald-500/30 bg-emerald-500/5'
                  : 'border-amber-500/30 bg-amber-500/5'
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      'h-10 w-10 rounded-lg flex items-center justify-center',
                      site.verified ? 'bg-emerald-500/20' : 'bg-amber-500/20'
                    )}>
                      {site.verified ? (
                        <Check className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <ExternalLink className="h-5 w-5 text-amber-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-white">
                        {site.verified ? 'Domain Verified' : 'Domain Not Verified'}
                      </p>
                      <p className="text-sm text-zinc-500">
                        {site.verified
                          ? 'Your domain is verified and ready to use.'
                          : 'Add the TXT record below to your DNS provider to verify ownership.'}
                      </p>
                    </div>
                  </div>
                  {!site.verified && (
                    <Button onClick={handleVerify} disabled={verifying}>
                      {verifying ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Verifying...
                        </>
                      ) : (
                        'Verify Now'
                      )}
                    </Button>
                  )}
                </div>
              </div>

              {!site.verified && (
                <div className="space-y-4">
                  <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                    <p className="text-sm text-zinc-400 mb-3">Add this TXT record to your DNS provider:</p>
                    <div className="flex gap-2">
                      <code className="flex-1 mono text-sm bg-black/30 rounded px-3 py-2 break-all">
                        {site.verificationRecord || 'canopy-verify=xxxxxxxxxx'}
                      </code>
                      <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(site.verificationRecord)}>
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <p className="text-xs text-zinc-500 mt-2">
                      DNS changes can take up to 48 hours to propagate. We'll check automatically.
                    </p>
                  </div>
                </div>
              )}

              <Separator />

              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-white">Tracking Script</p>
                  <p className="text-sm text-zinc-500">Add this to your site&apos;s <code>{'<head>'}</code></p>
                </div>
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(
                  `<script\n  src="${process.env.NEXT_PUBLIC_CANOPY_URL}/p.js"\n  data-site-id="${site.id}"\n  async\n></script>`
                )}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Script
                </Button>
              </div>
            </CardContent>
          </Card>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Site</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the site "{site.name}" and all its analytics data. Please type the site name to confirm.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Type site name to confirm"
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                />
              </div>
              <AlertDialogAction onClick={handleDelete} disabled={deleting || deleteConfirm !== site.name}>
                {deleting ? 'Deleting...' : 'Delete Site'}
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
          </AlertDialog>
        </TabsContent>
      </Tabs>
    </div>
  );
}