'use client';

import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OfferForm } from '@/components/admin/offers/OfferForm';
import { useRouter } from 'next/navigation';

export default function NewOfferPage() {
  const router = useRouter();
  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Add Offer</h1>
          <p className="text-sm text-muted-foreground">
            Create a new promotional offer.
          </p>
        </div>
      </div>
      <Card>
        <CardContent className="p-6">
          <OfferForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
