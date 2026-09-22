'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Separator } from '@/components/ui/Separator';
import { Check, CreditCard, Lock, ArrowUpRight, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn, formatNumber } from '@/lib/utils';

interface Subscription {
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export function SettingsBilling({ 
  subscription 
}: { 
  subscription: Subscription | null 
}) {
  const { toast } = useToast();

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: '/month',
      features: [
        'Up to 10,000 events/month',
        '1 site',
        '7-day data retention',
        'Community support',
        'Basic analytics',
      ],
      limits: { events: 10000, sites: 1, retention: 7, team: 1 },
      cta: 'Current',
      popular: false,
    },
    {
      id: 'pro',
      name: 'Pro',
      price: 19,
      period: '/month',
      features: [
        'Up to 1,000,000 events/month',
        '10 sites',
        '1-year data retention',
        'Email support',
        'Custom domains',
        'Export data (CSV/JSON)',
        'Advanced analytics',
      ],
      limits: { events: 1000000, sites: 10, retention: 365, team: 5 },
      cta: 'Upgrade',
      popular: true,
    },
    {
      id: 'team',
      name: 'Team',
      price: 49,
      period: '/month',
      features: [
        'Up to 5,000,000 events/month',
        '50 sites',
        'Unlimited data retention',
        'Priority support',
        'Custom domains',
        'Export data (CSV/JSON)',
        'Advanced analytics',
        'Team collaboration (10 seats)',
        'SSO (SAML/OIDC)',
      ],
      limits: { events: 5000000, sites: 50, retention: -1, team: 10 },
      cta: 'Upgrade',
      popular: false,
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: null,
      period: '/month',
      features: [
        'Unlimited events',
        'Unlimited sites',
        'Unlimited data retention',
        'Dedicated support',
        'Custom SLA',
        'On-premise option',
        'Advanced security',
        'Audit logs',
        'Custom integrations',
      ],
      limits: { events: -1, sites: -1, retention: -1, team: -1 },
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'success' | 'default' | 'secondary' | 'destructive'> = {
      active: 'success',
      trialing: 'default',
      past_due: 'destructive',
      canceled: 'secondary',
    };
    return variants[status] || 'secondary';
  };

  const handleUpgrade = (planId: string) => {
    toast({
      title: 'Redirecting to billing...',
      description: 'You\'ll be taken to our secure payment portal.',
    });
    // In production: redirect to Stripe checkout or similar
    // window.location.href = `/api/billing/checkout?plan=${planId}`;
  };

  const handleManageBilling = () => {
    toast({
      title: 'Opening billing portal...',
      description: 'You\'ll be redirected to manage your subscription.',
    });
    // window.location.href = '/api/billing/portal';
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl font-semibold text-white">Billing</h1>
        <p className="text-zinc-500 mt-1">Manage your subscription and billing details</p>
      </div>

      {/* Current Plan */}
      <Card className={subscription ? 'border-emerald-500/30 bg-emerald-500/5' : ''}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Current Plan</CardTitle>
              <CardDescription>
                {subscription 
                  ? `${subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan`
                  : 'No active subscription'}
              </CardDescription>
            </div>
            {subscription && (
              <Badge variant={getStatusBadge(subscription.status)}>
                {subscription.status.charAt(0).toUpperCase() + subscription.status.slice(1).replace('_', ' ')}
              </Badge>
            )}
          </div>
        </CardHeader>
        {subscription && (
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Status</p>
                <p className="mt-1 font-medium text-white capitalize">{subscription.status.replace('_', ' ')}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Renews</p>
                <p className="mt-1 font-medium text-white">{new Date(subscription.currentPeriodEnd).toLocaleDateString()}</p>
              </div>
              <div className="rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Auto-renew</p>
                <p className="mt-1 font-medium text-white">{subscription.cancelAtPeriodEnd ? 'Cancels at period end' : 'Enabled'}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center justify-end gap-2">
              <Button variant="outline" onClick={handleManageBilling}>
                <Lock className="h-4 w-4 mr-2" />
                Manage Billing
              </Button>
              {subscription.cancelAtPeriodEnd && (
                <Button variant="outline" onClick={() => toast({ title: 'Feature coming soon' })}>
                  Resume Subscription
                </Button>
              )}
              {!subscription.cancelAtPeriodEnd && subscription.status !== 'canceled' && (
                <Button variant="destructive" onClick={() => toast({ title: 'Feature coming soon' })}>
                  Cancel Subscription
                </Button>
              )}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Plans Comparison */}
      <div>
        <h2 className="text-lg font-semibold text-white mb-4">Choose Your Plan</h2>
        <div className="grid gap-6 lg:grid-cols-4">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={cn(
                'relative flex flex-col',
                plan.id === subscription?.plan && 'border-emerald-500/50 bg-emerald-500/5',
                plan.popular && 'border-amber-500/50 bg-amber-500/5'
              )}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge variant="default" className="bg-amber-500/20 text-amber-400 border-amber-500/30">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline justify-center gap-1">
                    {plan.price !== null ? (
                      <>
                        <span className="text-4xl font-bold text-white">${plan.price}</span>
                        <span className="text-zinc-500">{plan.period}</span>
                      </>
                    ) : (
                      <span className="text-2xl font-semibold text-white">Custom</span>
                    )}
                  </div>
                  {plan.id === subscription?.plan ? (
                    <Badge variant="success" className="mt-2">Current Plan</Badge>
                  ) : (
                    <Button
                      className="mt-4 w-full"
                      variant={plan.popular ? 'default' : 'outline'}
                      onClick={() => handleUpgrade(plan.id)}
                      disabled={plan.id === subscription?.plan}
                    >
                      {plan.cta}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <ul className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-zinc-400">
                      <Check className="h-4 w-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Separator className="my-4" />
                <div className="space-y-2 text-xs text-zinc-500">
                  <div className="flex justify-between">
                    <span>Events/month</span>
                    <span className="text-white font-mono">
                      {plan.limits.events === -1 ? 'Unlimited' : formatNumber(plan.limits.events)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Sites</span>
                    <span className="text-white font-mono">
                      {plan.limits.sites === -1 ? 'Unlimited' : plan.limits.sites}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Retention</span>
                    <span className="text-white font-mono">
                      {plan.limits.retention === -1 ? 'Unlimited' : `${plan.limits.retention} days`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Team seats</span>
                    <span className="text-white font-mono">
                      {plan.limits.team === -1 ? 'Unlimited' : plan.limits.team}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Billing History */}
      <Card>
        <CardHeader>
          <CardTitle>Billing History</CardTitle>
          <CardDescription>View your past invoices and receipts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <p className="text-center text-zinc-500 py-8">No billing history yet</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}