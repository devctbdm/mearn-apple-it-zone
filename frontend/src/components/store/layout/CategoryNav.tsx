'use client';
import React, { useEffect, useState } from 'react';
import { ChevronDownIcon, ChevronRightIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import {
  Menubar,
  MenubarContent,
  MenubarGroup,
  MenubarItem,
  MenubarMenu,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from '@/components/ui/menubar';

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

import { MenuIcon } from 'lucide-react';

import { categoryApi } from '@/lib/api';

type TreeCategory = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  active?: boolean;
  children: TreeCategory[];
};

function buildTree(
  categories: {
    _id: string;
    name: string;
    slug: string;
    parentId: string | null;
    active: boolean;
    sortOrder: number;
  }[]
): TreeCategory[] {
  const map = new Map<string, TreeCategory>();
  const roots: TreeCategory[] = [];

  for (const cat of categories.filter((c) => c.active !== false)) {
    map.set(cat._id, {
      id: cat._id,
      name: cat.name,
      slug: cat.slug,
      parentId: cat.parentId,
      children: [],
    });
  }

  for (const cat of categories.filter((c) => c.active !== false)) {
    const node = map.get(cat._id)!;
    if (cat.parentId && map.has(cat.parentId)) {
      map.get(cat.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  }

  return roots;
}

export const CategoryNav = () => {
  const router = useRouter();

  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set()
  );
  const [categories, setCategories] = useState<TreeCategory[]>([]);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    categoryApi
      .getAll()
      .then(({ data }) => {
        if (data.success) {
          setCategories(buildTree(data.categories));
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const renderCategory = (cat: TreeCategory, depth = 0) => {
    if (cat.active === false) return null;

    if (depth === 0) {
      return (
        <MenubarMenu key={cat.id}>
          <MenubarTrigger>{cat.name}</MenubarTrigger>
          <MenubarContent>
            {cat.children.length > 0 ? (
              cat.children.map((child) => renderCategory(child, depth + 1))
            ) : (
              <MenubarItem onClick={() => router.push(`/products/${cat.slug}`)}>
                View all {cat.name}
              </MenubarItem>
            )}
          </MenubarContent>
        </MenubarMenu>
      );
    } else {
      if (cat.children.length > 0) {
        return (
          <MenubarSub key={cat.id}>
            <MenubarSubTrigger>{cat.name}</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarGroup>
                {cat.children.map((child) => renderCategory(child, depth + 1))}
              </MenubarGroup>
            </MenubarSubContent>
          </MenubarSub>
        );
      } else {
        return (
          <MenubarItem
            key={cat.id}
            onClick={() => router.push(`/products/${cat.slug}`)}
          >
            {cat.name}
          </MenubarItem>
        );
      }
    }
  };

  const renderMobileCategory = (cat: TreeCategory, depth = 0) => {
    if (cat.active === false) return null;

    const paddingLeft = depth * 16;
    const isExpanded = expandedCategories.has(cat.id);
    const hasChildren = cat.children.length > 0;

    if (hasChildren) {
      return (
        <div key={cat.id}>
          <div
            className="flex items-center justify-between py-2 cursor-pointer hover:bg-gray-100 rounded"
            style={{ paddingLeft }}
          >
            <span
              className="font-medium flex-1"
              onClick={() => router.push(`/products/${cat.slug}`)}
            >
              {cat.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(cat.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDownIcon className="h-4 w-4" />
              ) : (
                <ChevronRightIcon className="h-4 w-4" />
              )}
            </button>
          </div>
          {isExpanded && (
            <div className="flex flex-col">
              {cat.children.map((child) =>
                renderMobileCategory(child, depth + 1)
              )}
            </div>
          )}
        </div>
      );
    } else {
      return (
        <div
          key={cat.id}
          className="py-2 hover:bg-gray-100 rounded cursor-pointer"
          style={{ paddingLeft }}
          onClick={() => router.push(`/products/${cat.slug}`)}
        >
          {cat.name}
        </div>
      );
    }
  };

  return (
    <div
      className={`sticky top-16 z-40 border-b border-gray-200 bg-background/95 py-2 backdrop-blur transition-all duration-300 lg:top-20 ${
        scrolled ? 'shadow-xl' : 'shadow-lg'
      }`}
    >
      {/* Desktop Menu */}
      <div className="hidden lg:block">
        <Menubar className="w-full max-w-7xl mx-auto border-0 rounded-none shadow-none">
          {categories.map((cat) => renderCategory(cat))}
        </Menubar>
      </div>

      {/* Mobile Menu */}
      <div className="lg:hidden px-4">
        <Sheet>
          <SheetTrigger>
            <MenuIcon className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="w-80 overflow-y-auto px-4">
            <SheetHeader>
              <SheetTitle>Categories</SheetTitle>
            </SheetHeader>
            <div className="mt-4 flex flex-col gap-2">
              {categories.map((cat) => renderMobileCategory(cat, 0))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
};
