'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import {
  Settings,
  Users,
  CreditCard,
  Globe,
  Shield,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { SettingsGeneral } from './General';
import { SettingsTeam } from './Team';
import { SettingsBilling } from './Billing';
import { SettingsDomain } from './Domain';

interface SiteData {
  id: string;
  domain: string;
  name: string;
  public: boolean;
  verified: boolean;
  verificationRecord: string;
  createdAt: string;
}

interface TeamMember {
  id: string;
  userId: string;
  email: string;
  name: string;
  image?: string;
  role: 'owner' | 'admin' | 'member';
  status: 'active' | 'pending';
  createdAt: string;
}

interface Invitation {
  id: string;
  email: string;
  role: string;
  status: 'pending' | 'accepted' | 'expired';
  createdAt: string;
}

interface Subscription {
  plan: 'free' | 'pro' | 'team' | 'enterprise';
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

interface CustomDomain {
  id: string;
  domain: string;
  verified: boolean;
  sslStatus: 'pending' | 'active' | 'failed';
  cnameTarget: string;
  createdAt: string;
}

const NAV_ITEMS = [
  { id: 'general', label: 'General', icon: Settings, desc: 'Site settings' },
  { id: 'team', label: 'Team', icon: Users, desc: 'Members & access' },
  { id: 'billing', label: 'Billing', icon: CreditCard, desc: 'Subscription' },
  { id: 'domain', label: 'Domains', icon: Globe, desc: 'Custom domains' },
] as const;

type NavId = typeof NAV_ITEMS[number]['id'];

export function SettingsPage({
  site,
  members = [],
  invitations = [],
  subscription = null,
  customDomains = [],
}: {
  site: SiteData;
  members?: TeamMember[];
  invitations?: Invitation[];
  subscription?: Subscription | null;
  customDomains?: CustomDomain[];
}) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<NavId>(
    (searchParams.get('tab') as NavId) || 'general'
  );
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const ActiveIcon = NAV_ITEMS.find((n) => n.id === activeTab)?.icon || Settings;

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0d12]">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="h-8 w-48 bg-white/5 rounded-lg mb-8" />
          <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
            <div className="space-y-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-white/[0.02] rounded-xl" />
              ))}
            </div>
            <div className="h-96 bg-white/[0.02] rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0d12] text-slate-200">
      {/* Top bar */}
      <div className="border-b border-white/[0.06] bg-[#0b0d12]/80 backdrop-blur supports-[backdrop-filter]:bg-[#0b0d12]/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-4">
          <a
            href="/dashboard"
            className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Dashboard
          </a>
          <div className="h-4 w-px bg-white/10" />
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-lg bg-canopy-500/20 grid place-items-center">
              <span className="text-canopy-500 font-semibold text-xs">
                {site.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <span className="text-sm font-medium text-white">{site.name}</span>
            <span
              className={cn(
                'px-2 py-0.5 rounded-full text-xs font-medium',
                site.verified
                  ? 'bg-teal-500/15 text-teal-400'
                  : 'bg-amber-500/15 text-amber-400'
              )}
            >
              {site.verified ? 'Verified' : 'Unverified'}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[220px_1fr]">
          {/* Sidebar */}
          <nav className="space-y-1" aria-label="Settings navigation">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-canopy-500/10 text-canopy-500 border border-canopy-500/20'
                      : 'text-slate-400 hover:text-slate-300 hover:bg-white/[0.03] border border-transparent'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <div className="text-left">
                    <p>{item.label}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  {isActive && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-canopy-500" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Content */}
          <main className="min-h-[60vh]">
            <div className="mb-6">
              <div className="flex items-center gap-3 mb-1">
                <ActiveIcon className="h-5 w-5 text-canopy-500" />
                <h1 className="text-2xl font-semibold tracking-tight text-white">
                  {NAV_ITEMS.find((n) => n.id === activeTab)?.label}
                </h1>
              </div>
              <p className="text-slate-500 text-sm">
                {NAV_ITEMS.find((n) => n.id === activeTab)?.desc}
              </p>
            </div>

            <Card className="border-white/[0.06] bg-white/[0.015] shadow-card">
              <CardContent className="p-6">
                {activeTab === 'general' && <SettingsGeneral site={site} />}
                {activeTab === 'team' && (
                  <SettingsTeam
                    siteId={site.id}
                    members={members}
                    invitations={invitations}
                  />
                )}
                {activeTab === 'billing' && (
                  <SettingsBilling subscription={subscription} />
                )}
                {activeTab === 'domain' && (
                  <SettingsDomain
                    siteId={site.id}
                    customDomains={customDomains}
                  />
                )}
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </div>
  );
}