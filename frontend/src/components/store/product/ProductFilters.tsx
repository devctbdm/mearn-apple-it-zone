// src/components/store/product/ProductFilters.tsx
'use client';

import { useMemo, useState } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Slider } from '@/components/ui/slider';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/types/product';
import {
  buildFacetGroups,
  getPriceRange,
  type FacetGroup,
  type FilterState,
} from '@/lib/specFilters';

interface ProductFiltersProps {
  products: Product[];
  filters: FilterState;
  onChange: (filters: FilterState) => void;
}

function FacetSection({
  group,
  selected,
  onToggle,
  defaultOpen,
}: {
  group: FacetGroup;
  selected: string[];
  onToggle: (value: string) => void;
  defaultOpen: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-gray-100 py-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left">
        <span className="text-sm font-semibold text-gray-900">{group.label}</span>
        <ChevronDown
          className={cn(
            'size-4 shrink-0 text-gray-400 transition-transform',
            open && 'rotate-180'
          )}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2">
        {group.values.map((option) => {
          const checked = selected.includes(option.value);
          return (
            <label
              key={option.value}
              className="group flex cursor-pointer items-center gap-2.5 text-sm text-gray-700"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => onToggle(option.value)}
                className="shrink-0"
              />
              <span className="flex-1 wrap-break-word text-gray-700 group-hover:text-gray-900">
                {option.value}
              </span>
              <span className="text-xs text-gray-400">({option.count})</span>
            </label>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

function PriceSection({
  min,
  max,
  value,
  onValueChange,
}: {
  min: number;
  max: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-gray-100 py-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left">
        <span className="text-sm font-semibold text-gray-900">Price</span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3">
        <Slider
          value={value}
          min={min}
          max={max}
          step={1}
          onValueChange={(next) => {
            const arr = Array.isArray(next) ? next : [min, max];
            onValueChange([arr[0], arr[1]]);
          }}
        />
        <div className="mt-2 flex items-center justify-between text-sm text-gray-600">
          <span>${min}</span>
          <span className="font-medium text-gray-900">
            ${value[0]} – ${value[1]}
          </span>
          <span>${max}</span>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

function AvailabilitySection({
  filters,
  onToggle,
}: {
  filters: FilterState;
  onToggle: (value: 'in' | 'out') => void;
}) {
  const [open, setOpen] = useState(true);
  return (
    <Collapsible open={open} onOpenChange={setOpen} className="border-b border-gray-100 py-4">
      <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 text-left">
        <span className="text-sm font-semibold text-gray-900">Availability</span>
        <ChevronDown
          className={cn('size-4 shrink-0 text-gray-400 transition-transform', open && 'rotate-180')}
        />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-2">
        <label className="group flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
          <Checkbox
            checked={filters.availability.includes('in')}
            onCheckedChange={() => onToggle('in')}
            className="shrink-0"
          />
          <span className="flex-1 group-hover:text-gray-900">In Stock</span>
        </label>
        <label className="group flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
          <Checkbox
            checked={filters.availability.includes('out')}
            onCheckedChange={() => onToggle('out')}
            className="shrink-0"
          />
          <span className="flex-1 group-hover:text-gray-900">Out of Stock</span>
        </label>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function ProductFilters({ products, filters, onChange }: ProductFiltersProps) {
  const facets = useMemo(() => buildFacetGroups(products), [products]);
  const priceRange = useMemo(() => getPriceRange(products), [products]);

  const min = priceRange[0];
  const max = Math.max(priceRange[1], min + 1);

  const priceValue: [number, number] = filters.price ?? [min, max];

  const toggleSpec = (key: string, value: string) => {
    const current = filters.specs[key] ?? [];
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    const specs = { ...filters.specs };
    if (next.length > 0) {
      specs[key] = next;
    } else {
      delete specs[key];
    }
    onChange({ ...filters, specs });
  };

  const toggleAvailability = (value: 'in' | 'out') => {
    const current = filters.availability;
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    onChange({ ...filters, availability: next });
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-2 flex items-center justify-between border-b border-gray-100 pb-3">
        <h2 className="text-base font-semibold text-gray-900">Filters</h2>
        <button
          type="button"
          onClick={() => onChange({ price: null, availability: [], specs: {} })}
          className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
        >
          Clear all
        </button>
      </div>

      <PriceSection
        min={min}
        max={max}
        value={priceValue}
        onValueChange={(value) => {
          const [a, b] = value;
          onChange({ ...filters, price: [Math.min(a, b), Math.max(a, b)] });
        }}
      />

      <AvailabilitySection
        filters={filters}
        onToggle={toggleAvailability}
      />

      {facets.map((group) => (
        <FacetSection
          key={group.key}
          group={group}
          selected={filters.specs[group.key] ?? []}
          onToggle={(value) => toggleSpec(group.key, value)}
          defaultOpen
        />
      ))}

      {facets.length === 0 && (
        <p className="py-4 text-sm text-gray-400">No filters available for this category yet.</p>
      )}
    </div>
  );
}
