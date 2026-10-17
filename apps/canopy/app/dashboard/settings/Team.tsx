'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/Dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { Plus, Mail, User, Shield, Loader2, MoreHorizontal, Send, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

const inviteSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['owner', 'admin', 'member']),
});

type InviteFormData = z.infer<typeof inviteSchema>;

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

const getInitials = (name: string) =>
  name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

const roleColors: Record<string, 'success' | 'default' | 'secondary'> = {
  owner: 'success',
  admin: 'default',
  member: 'secondary',
};

export function SettingsTeam({
  members = [],
  invitations = [],
  siteId,
}: {
  members: TeamMember[];
  invitations: Invitation[];
  siteId: string;
}) {
  const { toast } = useToast();
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [inviting, setInviting] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');

  const form = useForm<InviteFormData>({
    resolver: zodResolver(inviteSchema),
    defaultValues: {
      email: '',
      role: 'member',
    },
  });

  const onInviteSubmit = async (data: InviteFormData) => {
    setInviting(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/invitations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        toast({ title: 'Invitation sent', description: `Invitation sent to ${data.email}` });
        setInviteDialogOpen(false);
        form.reset();
      } else {
        throw new Error('Failed to send invitation');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to send invitation', variant: 'destructive' });
    } finally {
      setInviting(false);
    }
  };

  const handleRemove = async () => {
    if (!selectedMember) return;
    setRemoving(true);
    try {
      const res = await fetch(`/api/sites/${siteId}/members/${selectedMember.userId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Member removed', description: `${selectedMember.name} has been removed from the site.` });
        setDeleteDialogOpen(false);
      } else {
        throw new Error('Failed to remove member');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to remove member', variant: 'destructive' });
    } finally {
      setRemoving(false);
    }
  };

  const handleResendInvite = async (invitation: Invitation) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/invitations/${invitation.id}/resend`, {
        method: 'POST',
      });
      if (res.ok) {
        toast({ title: 'Invitation resent', description: `Invitation resent to ${invitation.email}` });
      } else {
        throw new Error('Failed to resend');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to resend invitation', variant: 'destructive' });
    }
  };

  const handleCancelInvite = async (invitation: Invitation) => {
    try {
      const res = await fetch(`/api/sites/${siteId}/invitations/${invitation.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast({ title: 'Invitation cancelled', description: `Invitation to ${invitation.email} has been cancelled.` });
      } else {
        throw new Error('Failed to cancel');
      }
    } catch (e) {
      toast({ title: 'Error', description: 'Failed to cancel invitation', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-white">Team Members</h2>
          <p className="text-slate-500 text-sm mt-1">Manage who has access to this site</p>
        </div>
        <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Invite Team Member</DialogTitle>
              <DialogDescription>
                Enter their email and select a role. They'll receive an invitation to join this site.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={form.handleSubmit(onInviteSubmit)}>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-400 text-sm">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="colleague@example.com"
                    className="bg-white/[0.03] border-white/[0.08] h-10"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role" className="text-slate-400 text-sm">Role</Label>
                  <Select {...form.register('role')}>
                    <SelectTrigger className="bg-white/[0.03] border-white/[0.08] h-10">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="owner">Owner (full access)</SelectItem>
                      <SelectItem value="admin">Admin (manage site & team)</SelectItem>
                      <SelectItem value="member">Member (view analytics)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setInviteDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={inviting}>
                  {inviting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    'Send Invitation'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="space-y-4">
        <TabsList className="bg-white/[0.03] border border-white/[0.06] p-1">
          <TabsTrigger value="members" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">
            Members ({members.length})
          </TabsTrigger>
          <TabsTrigger value="invitations" className="data-[state=active]:bg-white/[0.08] data-[state=active]:text-white text-slate-400">
            Invitations ({invitations.filter((i) => i.status === 'pending').length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card className="border-white/[0.06] bg-white/[0.015]">
            <CardContent className="pt-0">
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-500">No team members yet</p>
                  <Button className="mt-4" onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Your First Member
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06]">
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-slate-500 font-medium">Joined</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id} className="border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                        <TableCell className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {member.image ? (
                              <AvatarImage src={member.image} alt={member.name} />
                            ) : (
                              <AvatarFallback name={member.name} />
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium text-white text-sm">{member.name}</p>
                            <p className="text-xs text-slate-500 mono">{member.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={roleColors[member.role] || 'secondary'}>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-slate-500 mono text-xs">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {member.role !== 'owner' && (
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
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
        </TabsContent>

        <TabsContent value="invitations">
          <Card className="border-white/[0.06] bg-white/[0.015]">
            <CardContent className="pt-0">
              {invitations.filter((i) => i.status === 'pending').length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-slate-500 mb-4" />
                  <p className="text-slate-500">No pending invitations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/[0.06]">
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-24 text-slate-500 font-medium">Sent</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations
                      .filter((i) => i.status === 'pending')
                      .map((invite) => (
                        <TableRow key={invite.id} className="border-white/[0.04] hover:bg-white/[0.03] transition-colors">
                          <TableCell className="font-mono text-sm">{invite.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{invite.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{invite.status}</Badge>
                          </TableCell>
                          <TableCell className="text-slate-500 mono text-xs">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-slate-500 hover:text-white">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="ghost" size="sm" className="text-red-400 hover:text-red-400 hover:bg-red-500/10">
            <Trash2 className="h-4 w-4 mr-2" />
            Remove Member
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove team member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{selectedMember?.name}</strong> from this site. They will lose access to all analytics data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Type member name to confirm"
              onChange={(e) => setDeleteConfirm(e.target.value)}
            />
          </div>
          <AlertDialogAction
            onClick={handleRemove}
            disabled={removing || deleteConfirm !== selectedMember?.name}
            className="bg-red-500 hover:bg-red-600"
          >
            {removing ? 'Removing...' : 'Remove Member'}
          </AlertDialogAction>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}