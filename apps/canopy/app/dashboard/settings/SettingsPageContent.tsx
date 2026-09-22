'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Separator } from '@/components/ui/Separator';
import { cn } from '@/lib/utils';
import { Settings, Users, CreditCard, Globe, Shield } from 'lucide-react';
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

export function SettingsPage({ 
  site, 
  members = [], 
  invitations = [], 
  subscription = null,
  customDomains = []
}: { 
  site: SiteData;
  members?: TeamMember[];
  invitations?: Invitation[];
  subscription?: Subscription | null;
  customDomains?: CustomDomain[];
}) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'general');

  const tabs = [
    { id: 'general', label: 'General', icon: Settings },
    { id: 'team', label: 'Team', icon: Users },
    { id: 'billing', label: 'Billing', icon: CreditCard },
    { id: 'domain', label: 'Domains', icon: Globe },
  ];

  return (
    <div className="min-h-screen bg-[#050507] text-zinc-100">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Site Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="size-12 rounded-xl bg-white text-zinc-900 grid place-items-center font-semibold text-[18px]">
              {site.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">{site.name}</h1>
              <p className="text-zinc-500 mono text-sm">{site.domain}</p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className={cn(
                'px-2 py-1 rounded-full text-xs font-medium',
                site.verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
              )}>
                {site.verified ? 'Verified' : 'Unverified'}
              </span>
            </div>
          </div>
        </div>

        <Separator className="mb-8 border-white/10" />

        {/* Settings Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            {tabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center justify-center gap-2">
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="general">
            <SettingsGeneral site={site} />
          </TabsContent>

          <TabsContent value="team">
            <SettingsTeam 
              siteId={site.id} 
              members={members} 
              invitations={invitations} 
            />
          </TabsContent>

          <TabsContent value="billing">
            <SettingsBilling subscription={subscription} />
          </TabsContent>

          <TabsContent value="domain">
            <SettingsDomain 
              siteId={site.id} 
              customDomains={customDomains} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}