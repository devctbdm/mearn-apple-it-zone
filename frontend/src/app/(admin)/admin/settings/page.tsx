'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Store,
  CreditCard,
  Truck,
  Bell,
  Users,
  ShieldCheck,
  Save,
  Upload,
  AlertTriangle,
  ShieldAlert,
  ShieldBan,
  Smartphone,
  KeyRound,
  CheckCircle2,
  X,
  Pencil,
  Settings2,
  FlaskConical,
} from 'lucide-react';
import {
  teamApi,
  authApi,
  storeApi,
  paymentSettingsApi,
  type TeamMember,
  type Session,
  type PaymentGateway,
} from '@/lib/api';
import { toast } from 'sonner';
import { SiteHeader } from '@/components/site-header';

type ShippingZone = {
  id: string;
  name: string;
  regions: string;
  rate: string;
  cost: string;
};

const shippingZones: ShippingZone[] = [
  {
    id: '1',
    name: 'North America',
    regions: 'USA, Canada, Mexico',
    rate: 'Flat Rate',
    cost: '$5.00',
  },
  {
    id: '2',
    name: 'Europe',
    regions: 'UK, DE, FR, IT, ES',
    rate: 'Weight Based',
    cost: 'Varies',
  },
  {
    id: '3',
    name: 'Asia Pacific',
    regions: 'JP, AU, SG, KR',
    rate: 'Flat Rate',
    cost: '$12.00',
  },
  {
    id: '4',
    name: 'Rest of World',
    regions: 'All other countries',
    rate: 'Flat Rate',
    cost: '$25.00',
  },
];

const userColors = [
  'bg-blue-500',
  'bg-green-500',
  'bg-orange-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-red-500',
  'bg-teal-500',
  'bg-indigo-500',
  'bg-rose-500',
  'bg-cyan-500',
];

const getInitials = (name: string) =>
  name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    storeName: '',
    storeUrl: '',
    email: '',
    phone: '',
    description: '',
  });

  const [isDirty, setIsDirty] = useState(false);

  const markDirty = () => {
    if (!isDirty) setIsDirty(true);
  };

  // Business details state
  const [businessDetails, setBusinessDetails] = useState({
    currency: 'bdt',
    timezone: 'gmt+6',
    address: '',
  });

  // Payment preferences state
  const [paymentPreferences, setPaymentPreferences] = useState({
    platformFee: '2.5',
    taxRate: '8.25',
    minPayout: '25.00',
  });

  // Push notifications state
  const [pushNotifications, setPushNotifications] = useState({
    browserPush: true,
    mobilePush: false,
  });

  // Notification toggles state
  const [notifications, setNotifications] = useState({
    orders: true,
    marketing: false,
    security: true,
    stock: true,
    newsletter: false,
  });

  const toggleNotification = (key: keyof typeof notifications) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Team management state
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    email: '',
    role: 'Viewer' as TeamMember['role'],
  });

  const fetchTeam = useCallback(async () => {
    try {
      const { data } = await teamApi.getAll();
      if (data.success) setTeamMembers(data.members);
    } catch {
      toast.error('Failed to load team members');
    }
  }, []);

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);

  const fetchSessions = useCallback(async () => {
    try {
      const { data } = await authApi.getSessions();
      if (data.success) setSessions(data.sessions);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const fetchGateways = useCallback(async () => {
    try {
      const { data } = await paymentSettingsApi.getAll();
      if (data.success) setGateways(data.gateways);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    fetchGateways();
  }, [fetchGateways]);

  const handleToggleGateway = async (gateway: PaymentGateway) => {
    try {
      await paymentSettingsApi.update(gateway._id, {
        enabled: !gateway.enabled,
      });
      setGateways((prev) =>
        prev.map((g) =>
          g._id === gateway._id ? { ...g, enabled: !g.enabled } : g
        )
      );
      toast.success(
        `${gateway.name} ${gateway.enabled ? 'disabled' : 'enabled'}`
      );
    } catch {
      toast.error('Failed to update gateway');
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await authApi.revokeSession(id);
      setSessions((prev) => prev.filter((s) => s._id !== id));
      toast.success('Session revoked');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to revoke session');
    }
  };

  const handleAddMember = async () => {
    try {
      const { data } = await teamApi.create(newMemberForm);
      if (data.success) {
        setTeamMembers((prev) => [...prev, data.member]);
        toast.success(`Team member ${data.member.name} added`);
      }
    } catch {
      toast.error('Failed to add team member');
    }
    setNewMemberForm({ name: '', email: '', role: 'Viewer' });
    setAddDialogOpen(false);
  };

  const [editForm, setEditForm] = useState<{
    memberId: string;
    role: TeamMember['role'];
    status: TeamMember['status'];
  } | null>(null);

  const handleSaveEdit = async () => {
    if (!editForm) return;
    try {
      await teamApi.update(editForm.memberId, {
        role: editForm.role,
        status: editForm.status,
      });
      setTeamMembers((prev) =>
        prev.map((m) =>
          m._id === editForm.memberId
            ? { ...m, role: editForm.role, status: editForm.status }
            : m
        )
      );
      toast.success('Team member updated');
      setEditForm(null);
    } catch {
      toast.error('Failed to update team member');
    }
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await teamApi.delete(id);
      setTeamMembers((prev) => prev.filter((m) => m._id !== id));
      toast.success('Team member removed');
    } catch {
      toast.error('Failed to remove team member');
    }
  };

  // Password strength state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [changingPassword, setChangingPassword] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [gateways, setGateways] = useState<PaymentGateway[]>([]);

  const [editingGateway, setEditingGateway] = useState<PaymentGateway | null>(
    null
  );
  const [gatewayForm, setGatewayForm] = useState({
    enabled: false,
    label: '',
    description: '',
    sandbox: false,
    storeId: '',
    storePassword: '',
    isLocalhost: false,
    appKey: '',
    appSecret: '',
    username: '',
    password: '',
  });
  const [savingGateway, setSavingGateway] = useState(false);

  const openGatewayEditor = (gateway: PaymentGateway) => {
    const cfg = gateway.config || {};
    setEditingGateway(gateway);
    setGatewayForm({
      enabled: !!gateway.enabled,
      label: cfg.label || gateway.name,
      description: cfg.description || '',
      sandbox: cfg.sandbox === undefined ? true : !!cfg.sandbox,
      storeId: cfg.storeId || '',
      storePassword: cfg.storePassword || '',
      isLocalhost: !!cfg.isLocalhost,
      appKey: cfg.appKey || '',
      appSecret: cfg.appSecret || '',
      username: cfg.username || '',
      password: cfg.password || '',
    });
  };

  const handleSaveGateway = async () => {
    if (!editingGateway) return;
    const isSSL = editingGateway.name === 'SSLCommerz';
    const isBKash = editingGateway.name === 'bKash';

    if (isSSL && gatewayForm.enabled && !gatewayForm.storeId) {
      toast.error('Store ID is required when SSLCommerz is enabled');
      return;
    }
    if (isSSL && gatewayForm.enabled && !gatewayForm.storePassword) {
      toast.error('Store Password is required when SSLCommerz is enabled');
      return;
    }
    if (isBKash && gatewayForm.enabled && !gatewayForm.appKey) {
      toast.error('App Key is required when bKash is enabled');
      return;
    }
    if (isBKash && gatewayForm.enabled && !gatewayForm.appSecret) {
      toast.error('App Secret is required when bKash is enabled');
      return;
    }
    if (isBKash && gatewayForm.enabled && !gatewayForm.username) {
      toast.error('Username is required when bKash is enabled');
      return;
    }
    if (isBKash && gatewayForm.enabled && !gatewayForm.password) {
      toast.error('Password is required when bKash is enabled');
      return;
    }

    setSavingGateway(true);
    try {
      const config: Record<string, any> = {
        ...(editingGateway.config || {}),
        label: gatewayForm.label,
        description: gatewayForm.description,
      };
      if (isSSL) {
        config.sandbox = gatewayForm.sandbox;
        config.storeId = gatewayForm.storeId;
        config.storePassword = gatewayForm.storePassword;
        config.isLocalhost = gatewayForm.isLocalhost;
      }
      if (isBKash) {
        config.appKey = gatewayForm.appKey;
        config.appSecret = gatewayForm.appSecret;
        config.username = gatewayForm.username;
        config.password = gatewayForm.password;
      }
      const { data } = await paymentSettingsApi.update(editingGateway._id, {
        enabled: gatewayForm.enabled,
        config,
      });
      if (data.success) {
        setGateways((prev) =>
          prev.map((g) =>
            g._id === editingGateway._id
              ? { ...g, enabled: data.gateway.enabled, config: data.gateway.config }
              : g
          )
        );
        toast.success(`${editingGateway.name} settings updated`);
        setEditingGateway(null);
      }
    } catch {
      toast.error('Failed to update gateway settings');
    } finally {
      setSavingGateway(false);
    }
  };

  const getPasswordStrength = (pw: string) => {
    let score = 0;
    if (pw.length > 5) score++;
    if (pw.length > 8) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const passwordStrength = getPasswordStrength(newPassword);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    try {
      setChangingPassword(true);
      await authApi.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.message || 'Failed to update password';
      toast.error(msg);
    } finally {
      setChangingPassword(false);
    }
  };

  const fetchStoreSettings = useCallback(async () => {
    try {
      const { data } = await storeApi.get();
      if (data.success) {
        setProfileForm({
          storeName: data.settings.storeName || '',
          storeUrl: data.settings.storeUrl || '',
          email: data.settings.email || '',
          phone: data.settings.phone || '',
          description: data.settings.description || '',
        });
        setBusinessDetails({
          currency: data.settings.currency || 'bdt',
          timezone: data.settings.timezone || 'gmt+6',
          address: data.settings.address || '',
        });
        setIsDirty(false);
      }
    } catch {
      toast.error('Failed to load store settings');
    }
  }, []);

  useEffect(() => {
    fetchStoreSettings();
  }, [fetchStoreSettings]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await storeApi.update({ ...profileForm, ...businessDetails });
      toast.success('Settings saved');
      setIsDirty(false);
    } catch {
      toast.error('Failed to save settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <SiteHeader
        title="Settings"
        description="Manage your store preferences and configuration"
      />
      <div className=" bg-card sticky top-0 z-30">
        <Button
          onClick={handleSave}
          disabled={!isDirty || isSaving}
          className="gap-2 mx-4 my-4"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      <div className="px-4 py-2">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8">
            <TabsTrigger value="profile" className="gap-2">
              <Store className="h-4 w-4" />
              <span className="hidden sm:inline">Profile</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-2">
              <CreditCard className="h-4 w-4" />
              <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>

            <TabsTrigger value="notifications" className="gap-2">
              <Bell className="h-4 w-4" />
              <span className="hidden sm:inline">Alerts</span>
            </TabsTrigger>
            <TabsTrigger value="team" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Team</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="gap-2">
              <ShieldCheck className="h-4 w-4" />
              <span className="hidden sm:inline">Security</span>
            </TabsTrigger>
          </TabsList>

          {/* ==================== STORE PROFILE TAB ==================== */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Store Profile</CardTitle>
                <CardDescription>
                  Update your store details, branding, and contact information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="storeName">Store Name</Label>
                    <Input
                      id="storeName"
                      value={profileForm.storeName}
                      onChange={(e) => {
                        markDirty();
                        setProfileForm((prev) => ({
                          ...prev,
                          storeName: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeUrl">Store URL</Label>
                    <Input
                      id="storeUrl"
                      value={profileForm.storeUrl}
                      onChange={(e) => {
                        markDirty();
                        setProfileForm((prev) => ({
                          ...prev,
                          storeUrl: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Contact Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => {
                        markDirty();
                        setProfileForm((prev) => ({
                          ...prev,
                          email: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileForm.phone}
                      onChange={(e) => {
                        markDirty();
                        setProfileForm((prev) => ({
                          ...prev,
                          phone: e.target.value,
                        }));
                      }}
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Store Description</Label>
                    <Textarea
                      id="description"
                      rows={3}
                      value={profileForm.description}
                      onChange={(e) => {
                        markDirty();
                        setProfileForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Business Details</CardTitle>
                <CardDescription>
                  Address, timezone, and currency settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Default Currency</Label>
                    <Select
                      value={businessDetails.currency}
                      onValueChange={(val) => {
                        markDirty();
                        setBusinessDetails((prev) => ({
                          ...prev,
                          currency: val || 'BDT',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="w-60">
                        <SelectItem value="BDT">
                          BDT (৳) — Bangladeshi Taka
                        </SelectItem>
                        <SelectItem value="USD">USD ($) — US Dollar</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select
                      value={businessDetails.timezone}
                      onValueChange={(val) => {
                        markDirty();
                        setBusinessDetails((prev) => ({
                          ...prev,
                          timezone: val || 'gmt+6',
                        }));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gmt+6">
                          GMT+06:00 (Bangladesh)
                        </SelectItem>
                        <SelectItem value="gmt+0">GMT+00:00 (UTC)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Business Address</Label>
                    <Textarea
                      id="address"
                      rows={2}
                      value={businessDetails.address}
                      onChange={(e) => {
                        markDirty();
                        setBusinessDetails((prev) => ({
                          ...prev,
                          address: e.target.value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== PAYMENTS TAB ==================== */}
          <TabsContent value="payments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Payment Gateways</CardTitle>
                <CardDescription>
                  Connect and manage payment providers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {gateways.map((gateway) => {
                  const isBKash = gateway.name === 'bKash';
                  const isSSL = gateway.name === 'SSLCommerz';
                  const cfg = gateway.config || {};
                  return (
                    <div
                      key={gateway._id}
                      className="flex items-center justify-between p-4 rounded-lg border hover:border-primary/50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                          {isBKash ? (
                            <Smartphone className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <CreditCard className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                        <div>
                          <div className="font-medium">
                            {cfg.label || gateway.name}
                            {isSSL && cfg.sandbox && (
                              <Badge
                                variant="secondary"
                                className="ml-2 gap-1 text-[10px]"
                              >
                                <FlaskConical className="h-3 w-3" />
                                Sandbox
                              </Badge>
                            )}
                          </div>
                          {cfg.description ? (
                            <div className="text-sm text-muted-foreground line-clamp-1 max-w-sm">
                              {cfg.description}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground">
                              {gateway.enabled ? 'Connected' : 'Setup Required'}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className={`w-2 h-2 rounded-full ${gateway.enabled ? 'bg-green-500' : 'bg-gray-400'}`}
                          />
                          <span className="text-sm text-muted-foreground">
                            {gateway.enabled ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openGatewayEditor(gateway)}
                        >
                          <Pencil className="h-3.5 w-3.5 mr-1" />
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleGateway(gateway)}
                        >
                          {gateway.enabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Gateway Edit Dialog */}
            <Dialog
              open={!!editingGateway}
              onOpenChange={(o) => {
                if (!o) setEditingGateway(null);
              }}
            >
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    <Settings2 className="h-4 w-4" />
                    Configure {editingGateway?.name}
                  </DialogTitle>
                  <DialogDescription>
                    Customize this payment gateway and its connection settings.
                  </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-2">
                  <div className="flex items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <div className="text-sm font-medium">Status</div>
                      <div className="text-xs text-muted-foreground">
                        {gatewayForm.enabled
                          ? 'This gateway is active and accepting payments.'
                          : 'This gateway is disabled.'}
                      </div>
                    </div>
                    <Switch
                      checked={gatewayForm.enabled}
                      onCheckedChange={(checked) =>
                        setGatewayForm((prev) => ({ ...prev, enabled: checked }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gatewayLabel">Label</Label>
                    <Input
                      id="gatewayLabel"
                      placeholder={editingGateway?.name || 'Gateway label'}
                      value={gatewayForm.label}
                      onChange={(e) =>
                        setGatewayForm((prev) => ({
                          ...prev,
                          label: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gatewayDescription">Description</Label>
                    <Textarea
                      id="gatewayDescription"
                      rows={2}
                      placeholder="Short description shown to customers"
                      value={gatewayForm.description}
                      onChange={(e) =>
                        setGatewayForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {editingGateway?.name === 'SSLCommerz' && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                          <div className="text-sm font-medium">
                            Sandbox / Test Mode
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Use test credentials and sandbox payment page.
                          </div>
                        </div>
                        <Checkbox
                          checked={gatewayForm.sandbox}
                          onCheckedChange={(checked) =>
                            setGatewayForm((prev) => ({
                              ...prev,
                              sandbox: !!checked,
                            }))
                          }
                        />
                      </div>

                      {gatewayForm.enabled && (
                        <>
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gatewayStoreId">
                                Store ID <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="gatewayStoreId"
                                placeholder="SSLCommerz store ID"
                                value={gatewayForm.storeId}
                                onChange={(e) =>
                                  setGatewayForm((prev) => ({
                                    ...prev,
                                    storeId: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gatewayStorePassword">
                                Store Password{' '}
                                <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="gatewayStorePassword"
                                type="password"
                                placeholder="SSLCommerz store password"
                                value={gatewayForm.storePassword}
                                onChange={(e) =>
                                  setGatewayForm((prev) => ({
                                    ...prev,
                                    storePassword: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>

                          <div className="flex items-center justify-between rounded-lg border p-3">
                            <div className="space-y-0.5">
                              <div className="text-sm font-medium">
                                Is Localhost?
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Check if running on localhost for local testing.
                              </div>
                            </div>
                            <Checkbox
                              checked={gatewayForm.isLocalhost}
                              onCheckedChange={(checked) =>
                                setGatewayForm((prev) => ({
                                  ...prev,
                                  isLocalhost: !!checked,
                                }))
                              }
                            />
                          </div>
                        </>
                      )}

                      {!gatewayForm.enabled && (
                        <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-3">
                          Credentials are hidden because this gateway is
                          disabled. Enable it to configure the Store ID and
                          Store Password.
                        </p>
                      )}
                    </>
                  )}

                  {editingGateway?.name === 'bKash' && (
                    <>
                      {gatewayForm.enabled ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 gap-4">
                            <div className="space-y-2">
                              <Label htmlFor="gatewayAppKey">
                                App Key <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="gatewayAppKey"
                                placeholder="bKash app key"
                                value={gatewayForm.appKey}
                                onChange={(e) =>
                                  setGatewayForm((prev) => ({
                                    ...prev,
                                    appKey: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gatewayAppSecret">
                                App Secret <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="gatewayAppSecret"
                                type="password"
                                placeholder="bKash app secret"
                                value={gatewayForm.appSecret}
                                onChange={(e) =>
                                  setGatewayForm((prev) => ({
                                    ...prev,
                                    appSecret: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gatewayUsername">
                                Username <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="gatewayUsername"
                                placeholder="bKash merchant username"
                                value={gatewayForm.username}
                                onChange={(e) =>
                                  setGatewayForm((prev) => ({
                                    ...prev,
                                    username: e.target.value,
                                  }))
                                }
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="gatewayPassword">
                                Password <span className="text-destructive">*</span>
                              </Label>
                              <Input
                                id="gatewayPassword"
                                type="password"
                                placeholder="bKash merchant password"
                                value={gatewayForm.password}
                                onChange={(e) =>
                                  setGatewayForm((prev) => ({
                                    ...prev,
                                    password: e.target.value,
                                  }))
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground rounded-lg border border-dashed p-3">
                          Credentials are hidden because this gateway is
                          disabled. Enable it to configure the bKash
                          credentials.
                        </p>
                      )}
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setEditingGateway(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveGateway}
                    disabled={savingGateway}
                  >
                    {savingGateway ? 'Saving...' : 'Save Settings'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Card>
              <CardHeader>
                <CardTitle>Transaction Preferences</CardTitle>
                <CardDescription>
                  Adjust fees, taxes, and payout settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="platformFee">Platform Fee (%)</Label>
                    <Input
                      id="platformFee"
                      type="number"
                      value={paymentPreferences.platformFee}
                      onChange={(e) =>
                        setPaymentPreferences((prev) => ({
                          ...prev,
                          platformFee: e.target.value,
                        }))
                      }
                      step="0.1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="taxRate">Tax Rate (%)</Label>
                    <Input
                      id="taxRate"
                      type="number"
                      value={paymentPreferences.taxRate}
                      onChange={(e) =>
                        setPaymentPreferences((prev) => ({
                          ...prev,
                          taxRate: e.target.value,
                        }))
                      }
                      step="0.01"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="minPayout">Minimum Payout (USD)</Label>
                    <Input
                      id="minPayout"
                      type="number"
                      value={paymentPreferences.minPayout}
                      onChange={(e) =>
                        setPaymentPreferences((prev) => ({
                          ...prev,
                          minPayout: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== NOTIFICATIONS TAB ==================== */}
          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Email Notifications</CardTitle>
                <CardDescription>
                  Choose which events trigger an email alert
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  {
                    key: 'orders' as const,
                    title: 'New Orders',
                    description: 'Get notified when a customer places an order',
                  },
                  {
                    key: 'marketing' as const,
                    title: 'Marketing Emails',
                    description: 'Receive promotional campaign updates',
                  },
                  {
                    key: 'security' as const,
                    title: 'Security Alerts',
                    description:
                      'Critical alerts for logins and password changes',
                  },
                  {
                    key: 'stock' as const,
                    title: 'Low Stock Warnings',
                    description: 'Alert when inventory is below threshold',
                  },
                  {
                    key: 'newsletter' as const,
                    title: 'Newsletter Subscriptions',
                    description: 'Daily digest of new subscriber signups',
                  },
                ].map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between py-2"
                  >
                    <div className="space-y-0.5">
                      <div className="font-medium">{item.title}</div>
                      <div className="text-sm text-muted-foreground">
                        {item.description}
                      </div>
                    </div>
                    <Switch
                      checked={notifications[item.key]}
                      onCheckedChange={() => toggleNotification(item.key)}
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Push Notifications</CardTitle>
                <CardDescription>
                  Browser and mobile push notification settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Browser Push</div>
                    <div className="text-sm text-muted-foreground">
                      Show desktop notifications for new orders
                    </div>
                  </div>
                  <Switch
                    checked={pushNotifications.browserPush}
                    onCheckedChange={(checked) =>
                      setPushNotifications((prev) => ({
                        ...prev,
                        browserPush: checked,
                      }))
                    }
                  />
                </div>
                <Separator className="my-4" />
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium">Mobile Push</div>
                    <div className="text-sm text-muted-foreground">
                      Send notifications to connected mobile devices
                    </div>
                  </div>
                  <Switch
                    checked={pushNotifications.mobilePush}
                    onCheckedChange={(checked) =>
                      setPushNotifications((prev) => ({
                        ...prev,
                        mobilePush: checked,
                      }))
                    }
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== TEAM TAB ==================== */}
          <TabsContent value="team" className="space-y-6">
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage access and roles for your team
                  </CardDescription>
                </div>
                <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
                  <DialogTrigger
                    render={
                      <Button className="gap-2 self-start">
                        <Users className="h-4 w-4" />
                        Add Member
                      </Button>
                    }
                  />
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Add New Member</DialogTitle>
                      <DialogDescription>
                        Invite a new team member by email and assign their role
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="newMemberName">Full Name</Label>
                        <Input
                          id="newMemberName"
                          placeholder="John Doe"
                          value={newMemberForm.name}
                          onChange={(e) =>
                            setNewMemberForm((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newMemberEmail">Email Address</Label>
                        <Input
                          id="newMemberEmail"
                          type="email"
                          placeholder="john@pixelperfect.store"
                          value={newMemberForm.email}
                          onChange={(e) =>
                            setNewMemberForm((prev) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="newMemberRole">Role</Label>
                        <Select
                          value={newMemberForm.role}
                          onValueChange={(val) =>
                            setNewMemberForm((prev) => ({
                              ...prev,
                              role: val as TeamMember['role'],
                            }))
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Admin">Admin</SelectItem>
                            <SelectItem value="Manager">Manager</SelectItem>
                            <SelectItem value="Team">Team</SelectItem>
                            <SelectItem value="Viewer">Viewer</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        variant="outline"
                        onClick={() => setAddDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={handleAddMember}
                        disabled={!newMemberForm.name || !newMemberForm.email}
                      >
                        Add Member
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {teamMembers.map((member, idx) => {
                    const initials = getInitials(member.name);
                    const color = userColors[idx % userColors.length];
                    return (
                      <div
                        key={member._id}
                        className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-10 h-10 rounded-full ${color} flex items-center justify-center text-white font-semibold text-xs`}
                          >
                            {initials}
                          </div>
                          <div>
                            <div className="font-medium">{member.name}</div>
                            <div className="text-sm text-muted-foreground">
                              {member.email}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge
                            variant={
                              member.role === 'Admin'
                                ? 'default'
                                : member.role === 'Manager'
                                  ? 'secondary'
                                  : member.role === 'Team'
                                    ? 'secondary'
                                    : 'outline'
                            }
                          >
                            {member.role}
                          </Badge>
                          <div className="flex items-center gap-1.5">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                member.status === 'Active'
                                  ? 'bg-green-500'
                                  : member.status === 'Pending'
                                    ? 'bg-yellow-500'
                                    : 'bg-gray-400'
                              }`}
                            />
                            <span className="text-sm text-muted-foreground hidden sm:inline">
                              {member.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            {/* Edit Dialog */}
                            <Dialog
                              open={editForm?.memberId === member._id}
                              onOpenChange={(o) => {
                                if (o)
                                  setEditForm({
                                    memberId: member._id,
                                    role: member.role,
                                    status: member.status,
                                  });
                                else setEditForm(null);
                              }}
                            >
                              <DialogTrigger
                                render={
                                  <Button variant="ghost" size="sm">
                                    Edit
                                  </Button>
                                }
                              />
                              <DialogContent className="sm:max-w-md">
                                <DialogHeader>
                                  <DialogTitle>Edit Member</DialogTitle>
                                  <DialogDescription>
                                    Update role and status for {member.name}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                  <div className="flex items-center gap-4">
                                    <div
                                      className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold`}
                                    >
                                      {initials}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {member.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                  <Separator />
                                  <div className="space-y-2">
                                    <Label>Role</Label>
                                    <Select
                                      value={editForm?.role || member.role}
                                      onValueChange={(val) =>
                                        setEditForm((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                role: val as TeamMember['role'],
                                              }
                                            : null
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Admin">
                                          Admin
                                        </SelectItem>
                                        <SelectItem value="Manager">
                                          Manager
                                        </SelectItem>
                                        <SelectItem value="Team">
                                          Team
                                        </SelectItem>
                                        <SelectItem value="Viewer">
                                          Viewer
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  <div className="space-y-2">
                                    <Label>Status</Label>
                                    <Select
                                      value={editForm?.status || member.status}
                                      onValueChange={(val) =>
                                        setEditForm((prev) =>
                                          prev
                                            ? {
                                                ...prev,
                                                status:
                                                  val as TeamMember['status'],
                                              }
                                            : null
                                        )
                                      }
                                    >
                                      <SelectTrigger>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="Active">
                                          Active
                                        </SelectItem>
                                        <SelectItem value="Pending">
                                          Pending
                                        </SelectItem>
                                        <SelectItem value="Inactive">
                                          Inactive
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    variant="outline"
                                    onClick={() => setEditForm(null)}
                                  >
                                    Cancel
                                  </Button>
                                  <Button onClick={handleSaveEdit}>
                                    Save Changes
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>

                            {/* Delete Dialog */}
                            {member.role !== 'Admin' && (
                              <Dialog>
                                <DialogTrigger
                                  render={
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="text-destructive hover:text-destructive"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  }
                                />
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>
                                      Remove Team Member
                                    </DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to remove{' '}
                                      {member.name}? This action cannot be
                                      undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex items-center gap-4 py-4">
                                    <div
                                      className={`w-12 h-12 rounded-full ${color} flex items-center justify-center text-white font-bold`}
                                    >
                                      {initials}
                                    </div>
                                    <div>
                                      <p className="font-medium">
                                        {member.name}
                                      </p>
                                      <p className="text-sm text-muted-foreground">
                                        {member.email}
                                      </p>
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button variant="outline">Cancel</Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() =>
                                        handleDeleteMember(member._id)
                                      }
                                    >
                                      Remove Member
                                    </Button>
                                  </DialogFooter>
                                </DialogContent>
                              </Dialog>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ==================== SECURITY TAB ==================== */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
                <CardDescription>Update your account password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <div className="space-y-1 pt-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            i <= passwordStrength ? 'bg-green-500' : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      {passwordStrength < 3 ? (
                        <>
                          <AlertTriangle className="h-3 w-3 text-yellow-500" />
                          Use 8+ characters, numbers & symbols
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3 w-3 text-green-500" />
                          Strong password
                        </>
                      )}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                <Button
                  onClick={handleChangePassword}
                  disabled={changingPassword}
                >
                  {changingPassword ? 'Updating...' : 'Update Password'}
                </Button>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <ShieldAlert className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">
                      Two-Factor Authentication
                    </CardTitle>
                    <CardDescription>
                      Add an extra layer of security
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="gap-2">
                    <KeyRound className="h-4 w-4" />
                    Enable 2FA
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-base">Login Sessions</CardTitle>
                    <CardDescription>
                      Manage your active devices
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {sessions.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      No active sessions
                    </p>
                  ) : (
                    sessions.map((session) => (
                      <div
                        key={session._id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted"
                      >
                        <div className="flex items-center gap-3">
                          {session.isCurrent ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                          ) : (
                            <ShieldBan className="h-4 w-4 text-muted-foreground" />
                          )}
                          <div>
                            <div className="text-sm font-medium">
                              {session.browser} on {session.os} —{' '}
                              {session.device}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {session.isCurrent
                                ? 'Current session'
                                : new Date(session.lastActive).toLocaleString()}
                            </div>
                          </div>
                        </div>
                        {session.isCurrent ? (
                          <Badge variant="secondary">Active</Badge>
                        ) : (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleRevokeSession(session._id)}
                          >
                            Revoke
                          </Button>
                        )}
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
