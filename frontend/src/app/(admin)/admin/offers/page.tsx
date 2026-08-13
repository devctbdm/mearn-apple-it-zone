'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Pencil, Trash2, Loader2, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { offerApi, type Offer } from '@/lib/api';
import { toast } from 'sonner';

function formatDate(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function AdminOffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    offerApi
      .getAll()
      .then(({ data }) => {
        if (data.success) setOffers(data.offers);
      })
      .catch(() => toast.error('Failed to load offers'))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(offer: Offer) {
    if (!window.confirm(`Delete offer "${offer.title}"? This cannot be undone.`)) return;
    setDeletingId(offer._id);
    try {
      const { data } = await offerApi.delete(offer._id);
      if (data.success) {
        toast.success('Offer deleted');
        setOffers((prev) => prev.filter((o) => o._id !== offer._id));
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to delete offer');
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Tag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Offers</h1>
            <p className="text-sm text-muted-foreground">
              Create and manage promotional offers shown to customers.
            </p>
          </div>
        </div>
        <Button nativeButton={false} render={<Link href="/admin/offers/new" />}>
          <Plus className="h-4 w-4" /> Add offer
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center gap-2 p-10 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading offers…
            </div>
          ) : offers.length === 0 ? (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No offers yet. Click “Add offer” to create your first one.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                    <th className="px-4 py-3 font-medium">Image</th>
                    <th className="px-4 py-3 font-medium">Title</th>
                    <th className="px-4 py-3 font-medium">Period</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {offers.map((offer) => (
                    <tr key={offer._id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="h-12 w-20 overflow-hidden rounded-md border bg-muted/30">
                          {offer.image ? (
                            <img src={offer.image} alt={offer.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Tag className="h-4 w-4" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{offer.title}</div>
                        <div className="line-clamp-1 text-xs text-muted-foreground">
                          {offer.shortDescription || 'No short description'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(offer.startDate)} – {formatDate(offer.endDate)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={offer.active ? 'default' : 'secondary'}>
                          {offer.active ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="outline" size="sm" nativeButton={false} render={<Link href={`/admin/offers/edit/${offer._id}`} />}>
                            <Pencil className="h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(offer)}
                            disabled={deletingId === offer._id}
                          >
                            {deletingId === offer._id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
