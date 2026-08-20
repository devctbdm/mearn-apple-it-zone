'use client';

import { useEffect, useMemo, useState } from 'react';

import { toast } from 'sonner';
import {
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Link2,
  Loader2,
  PlugZap,
  RefreshCw,
  Save,
  Server,
  Store,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const SANDBOX_URL = 'https://courier-api-sandbox.pathao.com';
const LIVE_URL = 'https://api-hermes.pathao.com';

type Settings = {
  enabled: boolean;
  sandbox: boolean;
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  username: string;
  password: string;
  storeId: string;
  storeName: string;
  senderName: string;
  senderPhone: string;
  senderAddress: string;
  defaultWeight: string;
  defaultItemType: string;
  defaultDeliveryType: string;
  webhookSecret: string;
  webhookUrl: string;
};

const defaultSettings: Settings = {
  enabled: true,
  sandbox: true,
  baseUrl: SANDBOX_URL,
  clientId: '',
  clientSecret: '',
  username: '',
  password: '',
  storeId: '',
  storeName: '',
  senderName: '',
  senderPhone: '',
  senderAddress: '',
  defaultWeight: '0.5',
  defaultItemType: 'Parcel',
  defaultDeliveryType: 'Normal (48-72h)',
  webhookSecret: '',
  webhookUrl: '',
};

function SecretInput({
  id,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        id={id}
        type={show ? 'text' : 'password'}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="pr-20 font-mono text-sm"
      />
      <div className="absolute right-1 top-1 flex gap-1">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? 'Hide value' : 'Show value'}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => {
            navigator.clipboard.writeText(value);
            toast.success('Copied to clipboard');
          }}
          aria-label="Copy value"
        >
          <Copy className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default function PathaoSettingsPage() {
  const [settings, setSettings] = useState<Settings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [connection, setConnection] = useState<
    'unknown' | 'connected' | 'failed'
  >('unknown');

  // The webhook is hit by Pathao's servers, so it must point at the BACKEND
  // (not the frontend origin) and use the internal /api/pathao/webhook path.
  // The admin can override it; fall back to the computed backend URL otherwise.
  const FALLBACK_WEBHOOK_URL = `${
    (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/').replace(
      /\/+$/,
      ''
    )
  }/pathao/webhook`;
  const webhookUrl = settings.webhookUrl || FALLBACK_WEBHOOK_URL;

  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  // Load the live config from the backend (dynamic, not hardcoded).
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await fetch('/api/deliveries/pathao/config', {
          credentials: 'include',
        });
        const data = await res.json();
        if (data.success && data.config) {
          setSettings((prev) => ({ ...prev, ...data.config }));
        }
      } catch {
        // keep defaults if the backend isn't reachable yet
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const envPreview = useMemo(
    () =>
      [
        `PATHAO_BASE_URL=${settings.baseUrl}`,
        `PATHAO_CLIENT_ID=${settings.clientId}`,
        `PATHAO_CLIENT_SECRET=${settings.clientSecret}`,
        `PATHAO_USERNAME=${settings.username}`,
        `PATHAO_PASSWORD=${settings.password}`,
        `PATHAO_STORE_ID=${settings.storeId}`,
        `PATHAO_WEBHOOK_SECRET=${settings.webhookSecret}`,
      ].join('\n'),
    [settings]
  );

  const handleSandboxToggle = (checked: boolean) => {
    setSettings((s) => ({
      ...s,
      sandbox: checked,
      baseUrl: checked ? SANDBOX_URL : LIVE_URL,
    }));
    setConnection('unknown');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch('/api/deliveries/pathao/config', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error('Request failed');
      if (data.config) setSettings((prev) => ({ ...prev, ...data.config }));
      toast.success('Pathao settings saved');
    } catch {
      toast.error('Failed to save Pathao settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setConnection('unknown');
    try {
      // Hit a real Pathao endpoint through the backend to verify credentials.
      const res = await fetch('/api/deliveries/pathao/cities', {
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      const ok = res.ok && Array.isArray(data.cities) && data.cities.length > 0;
      setConnection(ok ? 'connected' : 'failed');
      ok
        ? toast.success('Connected to Pathao — cities fetched')
        : toast.error(data?.message || 'Pathao connection failed');
    } catch {
      setConnection('failed');
      toast.error('Pathao connection failed');
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="mx-auto px-4 py-8 md:py-12">
        <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <PlugZap className="h-5 w-5" />
              </span>
              <Badge variant={settings.sandbox ? 'secondary' : 'default'}>
                {settings.sandbox ? 'Sandbox' : 'Live'}
              </Badge>
              {connection === 'connected' && (
                <Badge className="bg-emerald-600 hover:bg-emerald-600">
                  Connected
                </Badge>
              )}
              {connection === 'failed' && (
                <Badge variant="destructive">Connection failed</Badge>
              )}
            </div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
              Pathao Courier Integration
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Connect your Node.js backend to the Pathao Merchant API for
              automated order booking and tracking.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTest} disabled={testing}>
              {testing ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Test connection
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Save settings
            </Button>
          </div>
        </header>

        <Card className="mb-6">
          <CardContent className="flex flex-wrap items-center justify-between gap-4 py-5">
            <div className="flex items-center gap-3">
              <Switch
                id="enabled"
                checked={settings.enabled}
                onCheckedChange={(v) => set('enabled', v)}
              />
              <div>
                <Label htmlFor="enabled" className="text-sm font-medium">
                  Enable Pathao courier
                </Label>
                <p className="text-xs text-muted-foreground">
                  Show Pathao as a delivery option and allow order booking.
                </p>
              </div>
            </div>
            <Separator
              orientation="vertical"
              className="hidden h-10 md:block"
            />
            <div className="flex items-center gap-3">
              <Switch
                id="sandbox"
                checked={settings.sandbox}
                onCheckedChange={handleSandboxToggle}
              />
              <div>
                <Label htmlFor="sandbox" className="text-sm font-medium">
                  Sandbox mode
                </Label>
                <p className="text-xs text-muted-foreground">
                  Uses the Pathao test API. No real parcels are created.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="credentials">
          <TabsList className="mb-4">
            <TabsTrigger value="credentials">API credentials</TabsTrigger>
            <TabsTrigger value="store">Store & sender</TabsTrigger>
            <TabsTrigger value="defaults">Parcel defaults</TabsTrigger>
            <TabsTrigger value="backend">Backend config</TabsTrigger>
          </TabsList>

          <TabsContent value="credentials">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <KeyRound className="h-4 w-4" /> Merchant API credentials
                </CardTitle>
                <CardDescription>
                  Issued by Pathao when your merchant account is approved. Keep
                  the secret on the server only.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="baseUrl">BASE_URL</Label>
                  <Input
                    id="baseUrl"
                    value={settings.baseUrl}
                    onChange={(e) => set('baseUrl', e.target.value)}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Sandbox: {SANDBOX_URL} · Live: {LIVE_URL}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientId">CLIENT_ID</Label>
                  <Input
                    id="clientId"
                    value={settings.clientId}
                    onChange={(e) => set('clientId', e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clientSecret">CLIENT_SECRET</Label>
                  <SecretInput
                    id="clientSecret"
                    value={settings.clientSecret}
                    onChange={(v) => set('clientSecret', v)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username (email)</Label>
                  <Input
                    id="username"
                    value={settings.username}
                    onChange={(e) => set('username', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <SecretInput
                    id="password"
                    value={settings.password}
                    onChange={(v) => set('password', v)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="webhook">Webhook URL</Label>
                  <p className="text-xs text-muted-foreground">
                    The callback Pathao posts status updates to. Defaults to the
                    backend <code>/api/pathao/webhook</code> — edit it for a
                    custom domain.
                  </p>
                  <div className="flex gap-2">
                    <Input
                      id="webhook"
                      value={settings.webhookUrl}
                      placeholder={FALLBACK_WEBHOOK_URL}
                      onChange={(e) => set('webhookUrl', e.target.value)}
                      className="font-mono text-sm"
                    />
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(webhookUrl);
                        toast.success('Webhook URL copied');
                      }}
                    >
                      <Link2 className="mr-2 h-4 w-4" /> Copy
                    </Button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webhookSecret">Webhook secret</Label>
                  <SecretInput
                    id="webhookSecret"
                    value={settings.webhookSecret}
                    onChange={(v) => set('webhookSecret', v)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="store">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Store className="h-4 w-4" /> Store & pickup sender
                </CardTitle>
                <CardDescription>
                  The Store ID is returned by{' '}
                  <code>/aladdin/api/v1/stores</code> and is required on every
                  order create call.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="storeId">STORE_ID</Label>
                  <Input
                    id="storeId"
                    value={settings.storeId}
                    onChange={(e) => set('storeId', e.target.value)}
                    className="font-mono text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="storeName">Store name</Label>
                  <Input
                    id="storeName"
                    value={settings.storeName}
                    onChange={(e) => set('storeName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderName">Sender name</Label>
                  <Input
                    id="senderName"
                    value={settings.senderName}
                    onChange={(e) => set('senderName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="senderPhone">Sender phone</Label>
                  <Input
                    id="senderPhone"
                    value={settings.senderPhone}
                    onChange={(e) => set('senderPhone', e.target.value)}
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label htmlFor="senderAddress">Pickup address</Label>
                  <Textarea
                    id="senderAddress"
                    rows={3}
                    value={settings.senderAddress}
                    onChange={(e) => set('senderAddress', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="defaults">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Parcel defaults</CardTitle>
                <CardDescription>
                  Applied to every consignment unless overridden on the order.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="weight">Default weight (kg)</Label>
                  <Input
                    id="weight"
                    value={settings.defaultWeight}
                    onChange={(e) => set('defaultWeight', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="itemType">Item type</Label>
                  <Input
                    id="itemType"
                    value={settings.defaultItemType}
                    onChange={(e) => set('defaultItemType', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deliveryType">Delivery type</Label>
                  <Input
                    id="deliveryType"
                    value={settings.defaultDeliveryType}
                    onChange={(e) => set('defaultDeliveryType', e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backend">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Server className="h-4 w-4" /> Node.js environment variables
                  </CardTitle>
                  <CardDescription>
                    Copy into your <code>.env</code> file. Never expose the
                    secret to the browser.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <pre className="overflow-x-auto rounded-lg bg-muted p-4 text-xs leading-6">
                    {envPreview}
                  </pre>
                  <Button
                    variant="outline"
                    className="mt-3"
                    onClick={() => {
                      navigator.clipboard.writeText(envPreview);
                      toast.success('Environment variables copied');
                    }}
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy .env
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">
                    Endpoints used by the backend
                  </CardTitle>
                  <CardDescription>
                    Token is valid ~5 days; cache it and refresh with the
                    refresh token.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  {[
                    ['POST', '/aladdin/api/v1/issue-token', 'Get access token'],
                    ['GET', '/aladdin/api/v1/stores', 'List merchant stores'],
                    ['GET', '/aladdin/api/v1/city-list', 'Cities'],
                    ['GET', '/aladdin/api/v1/cities/:id/zone-list', 'Zones'],
                    ['GET', '/aladdin/api/v1/zones/:id/area-list', 'Areas'],
                    ['POST', '/aladdin/api/v1/orders', 'Create consignment'],
                    [
                      'POST',
                      '/aladdin/api/v1/merchant/price-plan',
                      'Delivery price calculation',
                    ],
                    [
                      'GET',
                      '/aladdin/api/v1/orders/:consignment_id/info',
                      'Track order',
                    ],
                  ].map(([method, path, desc]) => (
                    <div
                      key={path}
                      className="flex flex-wrap items-center gap-3 rounded-md border p-3"
                    >
                      <Badge variant="outline" className="font-mono">
                        {method}
                      </Badge>
                      <code className="font-mono text-xs">{path}</code>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {desc}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
