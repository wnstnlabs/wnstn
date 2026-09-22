'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/Table';
import { Badge } from '@/components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/Avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/DropdownMenu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger, DialogFooter } from '@/components/ui/Dialog';
import { AlertDialog, AlertDialogTrigger, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '@/components/ui/AlertDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Plus, Mail, User, Shield, Loader2, Trash2, MoreHorizontal, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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

export function SettingsTeam({ 
  members = [], 
  invitations = [], 
  siteId 
}: { 
  members: TeamMember[]; 
  invitations: Invitation[]; 
  siteId: string 
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

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Team</h1>
          <p className="text-zinc-500 mt-1">Manage who has access to this site</p>
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
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...form.register('email')}
                    placeholder="colleague@example.com"
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-red-400">{form.formState.errors.email.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <Select {...form.register('role')}>
                    <SelectTrigger>
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
                  {inviting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Sending...</> : 'Send Invitation'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="members" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="members">Members ({members.length})</TabsTrigger>
          <TabsTrigger value="invitations">Invitations ({invitations.filter(i => i.status === 'pending').length})</TabsTrigger>
        </TabsList>

        <TabsContent value="members">
          <Card>
            <CardContent className="pt-0">
              {members.length === 0 ? (
                <div className="text-center py-12">
                  <User className="h-12 w-12 mx-auto text-zinc-500 mb-4" />
                  <p className="text-zinc-500">No team members yet</p>
                  <Button className="mt-4" onClick={() => setInviteDialogOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Invite Your First Member
                  </Button>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Member</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Joined</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {members.map((member) => (
                      <TableRow key={member.id}>
                        <TableCell className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            {member.image ? (
                              <AvatarImage src={member.image} alt={member.name} />
                            ) : (
                              <AvatarFallback name={member.name} />
                            )}
                          </Avatar>
                          <div>
                            <p className="font-medium text-white">{member.name}</p>
                            <p className="text-xs text-zinc-500 mono">{member.email}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            member.role === 'owner' ? 'success' :
                            member.role === 'admin' ? 'default' : 'secondary'
                          }>
                            {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={member.status === 'active' ? 'success' : 'secondary'}>
                            {member.status.charAt(0).toUpperCase() + member.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-500 mono text-xs">
                          {new Date(member.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {member.role !== 'owner' && (
                                <>
                                  <DropdownMenuItem>
                                    <Select
                                      defaultValue={member.role}
                                      onValueChange={(v) => {
                                        // handle role change
                                      }}
                                    >
                                      <SelectTrigger className="w-36">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="admin">Make Admin</SelectItem>
                                        <SelectItem value="member">Make Member</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedMember(member);
                                      setDeleteDialogOpen(true);
                                    }}
                                    className="text-red-400 focus:text-red-400"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Remove
                                  </DropdownMenuItem>
                                </>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will remove <strong>{selectedMember?.name}</strong> from this site. They will lose access to all analytics data.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogAction onClick={handleRemove} disabled={removing}>
                {removing ? 'Removing...' : 'Remove Member'}
              </AlertDialogAction>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
            </AlertDialogContent>
            </AlertDialog>
        </TabsContent>

        <TabsContent value="invitations">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Pending Invitations</CardTitle>
              <Button onClick={() => setInviteDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Invite Member
              </Button>
            </CardHeader>
            <CardContent className="pt-0">
              {invitations.filter(i => i.status === 'pending').length === 0 ? (
                <div className="text-center py-12">
                  <Mail className="h-12 w-12 mx-auto text-zinc-500 mb-4" />
                  <p className="text-zinc-500">No pending invitations</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-12">Sent</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {invitations
                      .filter(i => i.status === 'pending')
                      .map((invite) => (
                        <TableRow key={invite.id}>
                          <TableCell className="font-mono text-sm">{invite.email}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{invite.role}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{invite.status}</Badge>
                          </TableCell>
                          <TableCell className="text-zinc-500 mono text-xs">
                            {new Date(invite.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleResendInvite(invite)}>
                                  <Send className="h-4 w-4 mr-2" />
                                  Resend
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleCancelInvite(invite)}
                                  className="text-red-400 focus:text-red-400"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
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
    </div>
  );
}