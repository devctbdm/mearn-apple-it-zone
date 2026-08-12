'use client';

import { useEffect, useState } from 'react';
import {
  MessageSquare,
  Send,
  Settings as SettingsIcon,
  History,
  Wallet,
  RefreshCw,
  Phone,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  KeyRound,
  Megaphone,
  PenLine,
  Power,
  BadgeDollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { toast } from 'sonner';
import { smsApi, type SmsLog, type SmsSettings } from '@/lib/api';

const EST_COST_PER_SMS = 0.25;

const formatTaka = (n: number | string) => {
  const num = Number(n);
  return Number.isFinite(num) ? `৳${num.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '—';
};

function statusColor(status: 'sent' | 'failed') {
  return status === 'sent'
    ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800'
    : 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800';
}

export default function SmsPage() {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<SmsSettings>({
    apiKey: '',
    senderId: '',
    signature: '',
    enabled: false,
  });
  const [balance, setBalance] = useState<string | number | null>(null);
  const [balanceLoading, setBalanceLoading] = useState(false);
  const [logs, setLogs] = useState<SmsLog[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  // Send tab state
  const [numbers, setNumbers] = useState('');
  const [message, setMessage] = useState('');
  const [senderOverride, setSenderOverride] = useState('');
  const [sending, setSending] = useState(false);

  // Settings tab state
  const [apiKey, setApiKey] = useState('');
  const [senderId, setSenderId] = useState('');
  const [signature, setSignature] = useState('');
  const [enabled, setEnabled] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await smsApi.getSettings();
        if (data.success) {
          setSettings(data.settings);
          setApiKey(data.settings.apiKey);
          setSenderId(data.settings.senderId);
          setSignature(data.settings.signature);
          setEnabled(data.settings.enabled);
        }
      } catch {
        // leave defaults
      } finally {
        setLoading(false);
      }
    })();
    fetchLogs(1);
  }, []);

  const fetchLogs = async (p: number) => {
    try {
      const { data } = await smsApi.getLogs({ page: p, limit: 10 });
      if (data.success) {
        setLogs(data.logs);
        setTotalLogs(data.total);
        setPages(data.pages);
      }
    } catch {
      toast.error('Failed to load SMS history');
    }
  };

  const refreshBalance = async (showError = true) => {
    setBalanceLoading(true);
    try {
      const { data } = await smsApi.getBalance();
      if (data.success && data.balance != null) {
        setBalance(data.balance);
      } else {
        if (showError) toast.error('Could not fetch balance');
        setBalance(null);
      }
    } catch {
      if (showError) toast.error('Could not fetch balance. Check your API key.');
      setBalance(null);
    } finally {
      setBalanceLoading(false);
    }
  };

  const messageLength = message.length + (settings.signature ? settings.signature.length + 1 : 0);
  const segments = Math.max(1, Math.ceil(messageLength / 160));

  const handleSend = async () => {
    const normalized = numbers.split(/[\s,;]+/).filter(Boolean).length;
    if (normalized === 0) {
      toast.error('Enter at least one phone number');
      return;
    }
    if (!message.trim()) {
      toast.error('Message cannot be empty');
      return;
    }
    setSending(true);
    try {
      const { data } = await smsApi.send({
        numbers,
        message: message.trim(),
        senderId: senderOverride.trim() || undefined,
      });
      if (data.success) {
        toast.success(`SMS sent to ${data.numbers.length} number${data.numbers.length > 1 ? 's' : ''}`);
        setNumbers('');
        setMessage('');
        setSenderOverride('');
        fetchLogs(1);
        refreshBalance(false);
      } else {
        toast.error(data.providerMessage || 'SMS provider rejected the message');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to send SMS');
    } finally {
      setSending(false);
    }
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const { data } = await smsApi.updateSettings({ apiKey, senderId, signature, enabled });
      if (data.success) {
        setSettings(data.settings);
        toast.success('SMS settings saved');
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const goToPage = (p: number) => {
    setPage(p);
    fetchLogs(p);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">SMS Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Send messages and manage your bulksmsbd.net account.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => refreshBalance()} disabled={balanceLoading}>
          <RefreshCw className={`h-4 w-4 mr-1 ${balanceLoading ? 'animate-spin' : ''}`} />
          Check balance
        </Button>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Balance</CardTitle>
            <div className="p-2 rounded-lg text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30">
              <Wallet className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading || balanceLoading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className="text-2xl font-bold">{balance !== null ? formatTaka(balance) : '—'}</div>
            )}
            <p className="text-xs text-muted-foreground mt-1">bulksmsbd.net account balance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Messages Sent</CardTitle>
            <div className="p-2 rounded-lg text-blue-600 bg-blue-50 dark:bg-blue-950/30">
              <MessageSquare className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? <Skeleton className="h-7 w-16" /> : totalLogs.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">Total SMS in history</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <div className={`p-2 rounded-lg ${settings.enabled ? 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30' : 'text-red-600 bg-red-50 dark:bg-red-950/30'}`}>
              <Power className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-7 w-28" />
            ) : (
              <div className={`text-2xl font-bold ${settings.enabled ? 'text-emerald-600' : 'text-red-600'}`}>
                {settings.enabled ? 'Active' : 'Disabled'}
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Sending {settings.enabled ? 'enabled' : 'disabled'} in settings
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send"><Send className="h-4 w-4 mr-1" /> Send SMS</TabsTrigger>
          <TabsTrigger value="settings"><SettingsIcon className="h-4 w-4 mr-1" /> Settings</TabsTrigger>
          <TabsTrigger value="history"><History className="h-4 w-4 mr-1" /> History</TabsTrigger>
        </TabsList>

        {/* ---------------- Send SMS ---------------- */}
        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compose Message</CardTitle>
              <CardDescription>
                One number per line or comma separated (e.g. 017xxxxxxxx, 88017xxxxxxxx).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Phone className="h-3.5 w-3.5" /> Phone Numbers
                  </Label>
                  <Textarea
                    rows={4}
                    value={numbers}
                    onChange={(e) => setNumbers(e.target.value)}
                    placeholder={'017xxxxxxxx\n88018xxxxxxxx'}
                    className="min-h-24 resize-none"
                  />
                  <p className="text-xs text-muted-foreground">
                    {numbers.split(/[\s,;]+/).filter(Boolean).length} number(s) detected
                  </p>
                </div>
                <div className="space-y-1.5">
                  <Label className="flex items-center gap-1.5">
                    <Megaphone className="h-3.5 w-3.5" /> Message
                  </Label>
                  <Textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here..."
                    className="min-h-24 resize-none"
                  />
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      {messageLength} chars · {segments} SMS segment{segments > 1 ? 's' : ''}
                    </span>
                    <span className="flex items-center gap-1">
                      <BadgeDollarSign className="h-3.5 w-3.5" />
                      Est. {formatTaka(segments * EST_COST_PER_SMS)} (৳{EST_COST_PER_SMS}/sms)
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="flex items-center gap-1.5">
                  <KeyRound className="h-3.5 w-3.5" /> Sender ID
                </Label>
                <Input
                  value={senderOverride}
                  onChange={(e) => setSenderOverride(e.target.value)}
                  placeholder={settings.senderId || 'Defaults to sender from settings'}
                />
                <p className="text-xs text-muted-foreground">
                  {settings.signature && (
                    <>
                      Signature <span className="font-medium">"{settings.signature}"</span> will be appended
                      automatically.
                    </>
                  )}
                  {!settings.signature && 'Leave empty to use the sender ID saved in settings.'}
                </p>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleSend} disabled={sending || !settings.enabled}>
                  {sending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4 mr-1" /> Send SMS
                    </>
                  )}
                </Button>
              </div>
              {!settings.enabled && (
                <div className="flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/30 dark:text-amber-400">
                  <AlertTriangle className="h-4 w-4" />
                  SMS sending is disabled. Enable it in the Settings tab.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- Settings ---------------- */}
        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>bulksmsbd.net Settings</CardTitle>
              <CardDescription>
                Your API key and sender ID from{' '}
                <a href="https://bulksmsbd.net" target="_blank" rel="noreferrer" className="underline">
                  bulksmsbd.net
                </a>
                .
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label>API Key</Label>
                <Input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Your bulksmsbd.net API key"
                />
                <p className="text-xs text-muted-foreground">
                  Found under API settings in your bulksmsbd.net account.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <Label>Sender ID</Label>
                  <Input
                    value={senderId}
                    onChange={(e) => setSenderId(e.target.value)}
                    placeholder="e.g. 8809612345678 or your mask"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Signature</Label>
                  <Input
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="e.g. Apple IT Zone, Dhaka"
                  />
                  <p className="text-xs text-muted-foreground">Appended to every message automatically.</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-2">
                    <Power className="h-4 w-4" /> Enable SMS sending
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Turn off to block all sends from the dashboard.
                  </p>
                </div>
                <Switch checked={enabled} onCheckedChange={setEnabled} />
              </div>
              <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => refreshBalance()} disabled={balanceLoading}>
                  <Wallet className="h-4 w-4 mr-1" /> Check balance
                </Button>
                <Button onClick={handleSaveSettings} disabled={savingSettings}>
                  {savingSettings ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <PenLine className="h-4 w-4 mr-1" /> Save settings
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ---------------- History ---------------- */}
        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Send History</CardTitle>
                <CardDescription>Recent SMS messages ({totalLogs} total)</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => fetchLogs(page)}>
                <RefreshCw className="h-4 w-4" /> Refresh
              </Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-10 w-full" />
                  ))}
                </div>
              ) : logs.length === 0 ? (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No SMS sent yet.
                </p>
              ) : (
                <>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Message</TableHead>
                          <TableHead className="text-center">Segments</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {logs.map((log) => (
                          <TableRow key={log._id}>
                            <TableCell className="whitespace-nowrap text-muted-foreground">
                              {new Date(log.createdAt).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </TableCell>
                            <TableCell className="font-medium">
                              {log.to.map((n) => `0${n.slice(-10)}`).join(', ')}
                            </TableCell>
                            <TableCell className="max-w-64">
                              <p className="truncate" title={log.message}>{log.message}</p>
                              {log.providerMessage && log.status === 'failed' && (
                                <p className="text-xs text-destructive truncate">{log.providerMessage}</p>
                              )}
                            </TableCell>
                            <TableCell className="text-center">{log.segments}</TableCell>
                            <TableCell>
                              <Badge variant="outline" className={statusColor(log.status)}>
                                {log.status === 'sent' ? (
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                ) : (
                                  <XCircle className="h-3 w-3 mr-1" />
                                )}
                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>

                  {pages > 1 && (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mt-4">
                      <p className="text-xs text-muted-foreground">
                        Page {page} of {pages}
                      </p>
                      <Pagination className="mx-0 justify-end">
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (page > 1) goToPage(page - 1); }}
                            />
                          </PaginationItem>
                          {Array.from({ length: pages }).map((_, i) => (
                            <PaginationItem key={i}>
                              <PaginationLink
                                href="#"
                                isActive={i + 1 === page}
                                onClick={(e) => { e.preventDefault(); goToPage(i + 1); }}
                              >
                                {i + 1}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          <PaginationItem>
                            <PaginationNext
                              href="#"
                              onClick={(e) => { e.preventDefault(); if (page < pages) goToPage(page + 1); }}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
