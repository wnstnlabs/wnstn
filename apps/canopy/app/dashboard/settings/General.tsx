'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Switch } from '@/components/ui/Switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Copy, Check, Loader2, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

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
  const [copied, setCopied] = useState(false);

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
        toast({ title: 'Verification started', description: "We're checking your DNS record." });
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
        <h2 className="text-lg font-medium text-white">Site Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Configure your site's basic settings and tracking options</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="border-white/[0.06] bg-white/[0.015]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white">Basic Information</CardTitle>
            <CardDescription>How your site appears in the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-400 text-sm">Site Name</Label>
              <Input
                id="name"
                {...form.register('name')}
                placeholder="My Website"
                className="bg-white/[0.03] border-white/[0.08] h-10"
              />
              {form.formState.errors.name && (
                <p className="text-sm text-red-400">{form.formState.errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain" className="text-slate-400 text-sm">Domain</Label>
              <div className="flex gap-2">
                <Input
                  id="domain"
                  {...form.register('domain')}
                  placeholder="example.com"
                  className="bg-white/[0.03] border-white/[0.08] h-10"
                />
                <Badge variant={site.verified ? 'success' : 'secondary'} className="h-10 px-3">
                  {site.verified ? 'Verified' : 'Unverified'}
                </Badge>
              </div>
              {form.formState.errors.domain && (
                <p className="text-sm text-red-400">{form.formState.errors.domain.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sampleRate" className="text-slate-400 text-sm">Sample Rate</Label>
              <Select
                value={String(form.watch('sampleRate') ?? 1)}
                onValueChange={(v) => form.setValue('sampleRate', Number(v), { shouldDirty: true })}
              >
                <SelectTrigger id="sampleRate" className="bg-white/[0.03] border-white/[0.08] h-10">
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
              <p className="text-sm text-slate-500">Percentage of events to track (useful for high-traffic sites)</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/[0.06] bg-white/[0.015]">
          <CardHeader>
            <CardTitle className="text-base font-medium text-white">Tracking Options</CardTitle>
            <CardDescription>Control what data is collected by the tracking script</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <p className="font-medium text-white text-sm">Track Outbound Links</p>
                <p className="text-xs text-slate-500 mt-0.5">Automatically track clicks to external domains</p>
              </div>
              <Switch
                {...form.register('trackOutbound')}
                checked={form.watch('trackOutbound') ?? true}
              />
            </div>

            <Separator className="bg-white/[0.06]" />

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <p className="font-medium text-white text-sm">Respect Do Not Track</p>
                <p className="text-xs text-slate-500 mt-0.5">Honor browser DNT header (GDPR friendly)</p>
              </div>
              <Switch
                {...form.register('respectDnt')}
                checked={form.watch('respectDnt') ?? true}
              />
            </div>

            <Separator className="bg-white/[0.06]" />

            <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <div>
                <p className="font-medium text-white text-sm">Public Dashboard</p>
                <p className="text-xs text-slate-500 mt-0.5">Allow anyone with the link to view analytics</p>
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

      <Separator className="bg-white/[0.06]" />

      {/* Verification */}
      <Card className={cn(
        'border-white/[0.06] bg-white/[0.015]',
        site.verified && 'border-teal-500/20 bg-teal-500/[0.04]'
      )}>
        <CardHeader>
          <CardTitle className="text-base font-medium text-white">Domain Verification</CardTitle>
          <CardDescription>
            Verify ownership of your domain to unlock custom domain features and ensure data accuracy.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className={cn(
            'rounded-xl p-4 border',
            site.verified
              ? 'border-teal-500/30 bg-teal-500/5'
              : 'border-amber-500/30 bg-amber-500/5'
          )}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  'h-10 w-10 rounded-lg flex items-center justify-center',
                  site.verified ? 'bg-teal-500/20' : 'bg-amber-500/20'
                )}>
                  {site.verified ? (
                    <Check className="h-5 w-5 text-teal-400" />
                  ) : (
                    <ExternalLink className="h-5 w-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="font-medium text-white">
                    {site.verified ? 'Domain Verified' : 'Domain Not Verified'}
                  </p>
                  <p className="text-sm text-slate-500">
                    {site.verified
                      ? 'Your domain is verified and ready to use.'
                      : 'Add the TXT record below to your DNS provider to verify ownership.'}
                  </p>
                </div>
              </div>
              {!site.verified && (
                <Button onClick={handleVerify} disabled={verifying} size="sm">
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
            <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
              <p className="text-sm text-slate-400 mb-3">Add this TXT record to your DNS provider:</p>
              <div className="flex gap-2">
                <code className="flex-1 mono text-sm bg-black/30 rounded px-3 py-2 break-all">
                  {site.verificationRecord || 'canopy-verify=xxxxxxxxxx'}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(site.verificationRecord);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 mr-2" />}
                  {copied ? 'Copied' : 'Copy'}
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                DNS changes can take up to 48 hours to propagate. We'll check automatically.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div>
              <p className="font-medium text-white text-sm">Tracking Script</p>
              <p className="text-xs text-slate-500 mt-0.5">Add this to your site's {'<head>'}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                navigator.clipboard.writeText(
                  `<script\n  src="${process.env.NEXT_PUBLIC_CANOPY_URL}/p.js"\n  data-site-id="${site.id}"\n  async\n></script>`
                );
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4 mr-2" />}
              {copied ? 'Copied' : 'Copy Script'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Site */}
      <Card className="border-red-500/20 bg-red-500/[0.04]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-red-400">Danger Zone</h3>
              <p className="text-sm text-slate-500 mt-1">
                Permanently delete this site and all its analytics data. This action cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Site
                </Button>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}