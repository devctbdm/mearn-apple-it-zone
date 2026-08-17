'use client'
import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  Pencil,
  Trash2,
  MoreHorizontal,
  Search,
  Plus,
  Package,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Star,
  StarOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { toast } from "sonner";
import { productApi, categoryApi } from "@/lib/api";
import { SiteHeader } from "@/components/site-header";

type Status = "active" | "draft" | "out_of_stock";

type BackendProduct = {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  discountPrice?: number;
  costPrice?: number;
  category: string;
  categories?: string[];
  stock: number;
  status: Status;
  featured: boolean;
  specifications?: Record<string, any>;
  images?: string[];
  averageRating?: number;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

type Product = {
  _id: string;
  name: string;
  category: string;
  categories?: string[];
  price: number;
  costPrice?: number;
  stock: number;
  status: Status;
  featured: boolean;
  description: string;
  specifications: Record<string, any>;
  images: string[];
  createdAt: string;
};

type Category = { _id: string; name: string };

const PAGE_SIZE = 8;

type StatusFilter = Status | "all";

const statusLabels: Record<Status, string> = {
  active: "Active",
  draft: "Draft",
  out_of_stock: "Out of stock",
};

function statusBadgeVariant(s: Status) {
  switch (s) {
    case "active":
      return "default" as const;
    case "draft":
      return "secondary" as const;
    case "out_of_stock":
      return "destructive" as const;
  }
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [featuredFilter, setFeaturedFilter] = useState<"all" | "featured" | "not_featured">("all");
  const [page, setPage] = useState(1);
  const router = useRouter();

  const [viewProduct, setViewProduct] = useState<Product | null>(null);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      const { data } = await productApi.getAll({ limit: 1000 });
      if (data.success) {
        setProducts(
          data.products.map((p: BackendProduct) => ({
            _id: p._id,
            name: p.name,
            category: p.category,
            categories: p.categories || (p.category ? [p.category] : []),
            price: p.price,
            costPrice: p.costPrice || 0,
            stock: p.stock,
            status: p.status,
            featured: p.featured,
            description: p.description || "",
            specifications: typeof p.specifications === "string" ? JSON.parse(p.specifications) : p.specifications || {},
            images: p.images || [],
            createdAt: p.createdAt,
          })),
        );
      }
    } catch {
      toast.error("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data } = await categoryApi.getAll();
      if (data.success) setCategories(data.categories);
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const stats = useMemo(() => {
    const total = products.length;
    const active = products.filter((p) => p.status === "active").length;
    const outOfStock = products.filter((p) => p.status === "out_of_stock" || p.stock === 0).length;
    const lowStock = products.filter((p) => p.stock > 0 && p.stock <= 10).length;
    const featured = products.filter((p) => p.featured).length;
    return { total, active, outOfStock, lowStock, featured };
  }, [products]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return products.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (categoryFilter !== "all" && !(p.categories || [p.category]).includes(categoryFilter)) return false;
      if (featuredFilter === "featured" && !p.featured) return false;
      if (featuredFilter === "not_featured" && p.featured) return false;
      if (!q) return true;
      return (
        p._id.toLowerCase().includes(q) ||
        p.name.toLowerCase().includes(q) ||
        (p.categories || [p.category]).some((c) => c.toLowerCase().includes(q))
      );
    });
  }, [products, query, statusFilter, categoryFilter, featuredFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paged = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  async function confirmDelete() {
    if (!deleteProduct) return;
    try {
      const { data } = await productApi.delete(deleteProduct._id);
      if (data.success) {
        setProducts((prev) => prev.filter((p) => p._id !== deleteProduct._id));
        toast.success(`Deleted ${deleteProduct.name}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete product");
    } finally {
      setDeleteProduct(null);
    }
  }

  async function toggleFeatured(p: Product) {
    const fd = new FormData();
    fd.append("featured", String(!p.featured));
    try {
      const { data } = await productApi.update(p._id, fd);
      if (data.success) {
        setProducts((prev) =>
          prev.map((x) => (x._id === p._id ? { ...x, featured: !x.featured } : x)),
        );
        toast.success(`${p.name} ${!p.featured ? "marked as featured" : "removed from featured"}`);
      }
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Loading products...</p>
      </div>
    );
  }

  return (
    <>
    <SiteHeader />
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="text-sm text-muted-foreground">Manage your store catalog.</p>
        </div>
        <Link href="/admin/products/new">
          <Button>
            <Plus /> Add product
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Products" value={stats.total} icon={<Package className="h-4 w-4 text-muted-foreground" />} />
        <StatCard label="Active" value={stats.active} icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />} />
        <StatCard label="Featured" value={stats.featured} icon={<Star className="h-4 w-4 text-amber-500" />} />
        <StatCard label="Low Stock" value={stats.lowStock} icon={<AlertTriangle className="h-4 w-4 text-amber-600" />} />
        <StatCard label="Out of Stock" value={stats.outOfStock} icon={<XCircle className="h-4 w-4 text-destructive" />} />
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search by name or category"
                className="pl-8"
              />
            </div>
            <Select
              value={categoryFilter}
              onValueChange={(v) => { setCategoryFilter(v || "all"); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c._id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={statusFilter}
              onValueChange={(v) => { setStatusFilter(v as StatusFilter); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="out_of_stock">Out of stock</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={featuredFilter}
              onValueChange={(v) => { setFeaturedFilter(v as "all" | "featured" | "not_featured"); setPage(1); }}
            >
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Featured" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="featured">Featured only</SelectItem>
                <SelectItem value="not_featured">Not featured</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Profit</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Featured</TableHead>
                  <TableHead className="w-15" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {paged.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                      No products found.
                    </TableCell>
                  </TableRow>
                ) : (
                  paged.map((p) => (
                    <TableRow key={p._id}>
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => toggleFeatured(p)}
                          aria-label={p.featured ? "Unmark featured" : "Mark as featured"}
                          className="text-amber-500 hover:text-amber-600"
                        >
                          {p.featured ? (
                            <Star className="h-4 w-4 fill-current" />
                          ) : (
                            <Star className="h-4 w-4 text-muted-foreground" />
                          )}
                        </button>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {p.images?.[0] && (
                            <img
                              src={p.images[0]}
                              alt={p.name}
                              className="h-8 w-8 rounded-md object-cover border"
                            />
                          )}
                          <div>
                            <span className="font-medium">{p.name}</span>
                            {p.featured && (
                              <Badge variant="secondary" className="ml-2 gap-1">
                                <Star className="h-3 w-3 fill-amber-500 text-amber-500" /> Featured
                              </Badge>
                            )}
                            <div className="text-xs text-muted-foreground">{p._id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{(p.categories || [p.category]).join(", ")}</TableCell>
                      <TableCell className="text-right">${p.price.toFixed(2)}</TableCell>
                      <TableCell className="text-right">
                        <span
                          className={
                            (p.costPrice || 0) > 0 && p.price - (p.costPrice || 0) < 0
                              ? "font-medium text-destructive"
                              : (p.costPrice || 0) > 0
                                ? "font-medium text-emerald-600"
                                : "text-muted-foreground"
                          }
                        >
                          {(p.costPrice || 0) > 0
                            ? `${p.price - (p.costPrice || 0) > 0 ? "+" : ""}$${(p.price - (p.costPrice || 0)).toFixed(2)}`
                            : "—"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">{p.stock}</TableCell>
                      <TableCell>
                        <Badge variant={statusBadgeVariant(p.status)}>{statusLabels[p.status]}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Switch
                          checked={p.featured}
                          onCheckedChange={() => toggleFeatured(p)}
                          aria-label="Toggle featured"
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger className="inline-flex items-center justify-center rounded-md hover:bg-accent h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => setViewProduct(p)}>
                              <Eye /> View details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => router.push(`/admin/products/edits?id=${p._id}`)}>
                              <Pencil /> Edit product
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => toggleFeatured(p)}>
                              {p.featured ? <><StarOff /> Unmark featured</> : <><Star /> Mark as featured</>}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => setDeleteProduct(p)}
                            >
                              <Trash2 /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-muted-foreground">
              Showing {paged.length} of {filtered.length} products
            </p>
            <Pagination className="mx-0 justify-end">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.max(1, p - 1)); }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }).map((_, i) => (
                  <PaginationItem key={i}>
                    <PaginationLink
                      href="#"
                      isActive={i + 1 === currentPage}
                      onClick={(e) => { e.preventDefault(); setPage(i + 1); }}
                    >
                      {i + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => { e.preventDefault(); setPage((p) => Math.min(totalPages, p + 1)); }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>

      {/* View */}
      <Dialog open={!!viewProduct} onOpenChange={(o) => !o && setViewProduct(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{viewProduct?.name}</DialogTitle>
            <DialogDescription>{viewProduct?._id}</DialogDescription>
          </DialogHeader>
          {viewProduct && (
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <Info label="Category" value={(viewProduct.categories || [viewProduct.category]).join(", ")} />
                <Info label="Status" value={statusLabels[viewProduct.status]} />
                <Info label="Price" value={`$${viewProduct.price.toFixed(2)}`} />
                <Info label="Buy Price" value={`$${(viewProduct.costPrice || 0).toFixed(2)}`} />
                <Info
                  label="Profit"
                  value={`${viewProduct.price - (viewProduct.costPrice || 0) >= 0 ? "+" : ""}$${(viewProduct.price - (viewProduct.costPrice || 0)).toFixed(2)}`}
                />
                <Info label="Stock" value={String(viewProduct.stock)} />
                <Info label="Created" value={new Date(viewProduct.createdAt).toLocaleDateString()} />
                <Info label="Featured" value={viewProduct.featured ? "Yes" : "No"} />
              </div>
              {viewProduct.description && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Summary</div>
                  <p>{viewProduct.description}</p>
                </div>
              )}
              {viewProduct.images && viewProduct.images.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Images</div>
                  <div className="flex gap-2 overflow-x-auto">
                    {viewProduct.images.map((url, i) => (
                      <img key={i} src={url} alt="" className="h-24 w-24 rounded-md border object-cover" />
                    ))}
                  </div>
                </div>
              )}
              {viewProduct.specifications && Object.keys(viewProduct.specifications).length > 0 && (
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Specifications</div>
                  <div className="rounded-md border divide-y">
                    {renderSpecs(viewProduct.specifications).map((section, i) => (
                      <div key={i} className="px-3 py-2">
                        <div className="font-medium text-sm mb-1">{section.label}</div>
                        <div className="ml-2 space-y-0.5">
                          {section.items.map((item, j) => (
                            <div key={j} className="grid grid-cols-3 gap-2 text-xs">
                              <span className="text-muted-foreground">{item.label}</span>
                              <span className="col-span-2 whitespace-pre-line">{item.value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                    {renderSpecs(viewProduct.specifications).length === 0 && (
                      <div className="px-3 py-2 text-xs text-muted-foreground">No specifications</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setViewProduct(null)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit */}
      {/* NOTE: Editing is done on /admin/products/edits?id=xxx */}

      {/* Delete */}
      <AlertDialog open={!!deleteProduct} onOpenChange={(o) => !o && setDeleteProduct(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete product?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently remove <span className="font-medium">{deleteProduct?.name}</span> from the catalog.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
    </>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</span>
          {icon}
        </div>
        <div className="mt-2 text-2xl font-semibold">{value}</div>
      </CardContent>
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="font-medium">{value}</div>
    </div>
  );
}

function renderSpecs(specs: Record<string, any>): { label: string; items: { label: string; value: string }[] }[] {
  // new structured format
  if (specs._keySpecs || specs._keyFeatures || specs._specGroups) {
    const sections: { label: string; items: { label: string; value: string }[] }[] = [];
    if (specs._keySpecs && Object.keys(specs._keySpecs).length > 0) {
      sections.push({
        label: "Key Specifications",
        items: Object.entries(specs._keySpecs).map(([k, v]) => ({ label: k, value: String(v) })),
      });
    }
    if (specs._keyFeatures && Object.keys(specs._keyFeatures).length > 0) {
      sections.push({
        label: "Key Features",
        items: Object.entries(specs._keyFeatures).map(([k, v]) => ({ label: k, value: String(v) })),
      });
    }
    if (specs._specGroups && Object.keys(specs._specGroups).length > 0) {
      for (const [groupName, fields] of Object.entries(specs._specGroups)) {
        if (typeof fields === "object" && fields !== null) {
          sections.push({
            label: groupName,
            items: Object.entries(fields).map(([k, v]) => ({ label: k, value: String(v) })),
          });
        }
      }
    }
    return sections;
  }

  // legacy flat format
  const flatItems: { label: string; value: string }[] = [];
  const sections: { label: string; items: { label: string; value: string }[] }[] = [];
  for (const [key, val] of Object.entries(specs)) {
    if (typeof val === "object" && val !== null) {
      sections.push({
        label: key,
        items: Object.entries(val).map(([k, v]) => ({ label: k, value: String(v) })),
      });
    } else {
      flatItems.push({ label: key, value: String(val) });
    }
  }
  if (flatItems.length > 0) sections.unshift({ label: "Specifications", items: flatItems });
  return sections;
}
