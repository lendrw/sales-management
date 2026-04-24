"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/product";
import PageHeader from "@/components/ui/page-header";
import Table from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import Badge from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Invalid price"),
  quantity: z.coerce.number().int().min(0, "Invalid quantity"),
});

type FormData = z.infer<typeof schema>;

// Stable formatter — created once, not on every render
const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

function formatCurrency(cents: number) {
  return currencyFormatter.format(cents / 100);
}

export default function ProductsPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [data, setData] = useState<{ items: Product[]; last_page: number } | null>(null);
  const [page, setPage] = useState(() => {
    const rawPage = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  });
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebounce(filter, 350);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [priceCents, setPriceCents] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      price: 0,
      quantity: 0,
    },
  });

  // Stable load with AbortController to prevent race conditions and stale state updates
  const load = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true);
      productsApi
        .list({ page, filter: debouncedFilter || undefined }, signal)
        .then((res) => setData(res))
        .catch((err) => {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            toast("Failed to load products", "error");
          }
        })
        .finally(() => setLoading(false));
    },
    [page, debouncedFilter] // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort(); // cancel on unmount or dep change
  }, [load]);

  useEffect(() => {
    const rawPage = Number(searchParams.get("page") ?? "1");
    const nextPage = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
    setPage((currentPage) => (currentPage === nextPage ? currentPage : nextPage));
  }, [searchParams]);

  const updatePage = useCallback(
    (nextPage: number) => {
      setPage(nextPage);
      const params = new URLSearchParams(searchParams.toString());
      if (nextPage <= 1) {
        params.delete("page");
      } else {
        params.set("page", String(nextPage));
      }
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname);
    },
    [pathname, router, searchParams]
  );

  const openCreate = useCallback(() => {
    setEditing(null);
    setPriceCents(0);
    reset({ name: "", price: 0, quantity: 0 });
    setModalOpen(true);
  }, [reset]);

  const openEdit = useCallback(
    (product: Product) => {
      setEditing(product);
      const cents = Math.round(Number(product.price) * 100);
      setPriceCents(cents);
      reset({ name: product.name, price: Number(product.price), quantity: product.quantity });
      setModalOpen(true);
    },
    [reset]
  );

  const onSubmit = useCallback(
    async (formData: FormData) => {
      try {
        if (editing) {
          await productsApi.update(editing.id, formData);
          toast("Product updated successfully");
        } else {
          await productsApi.create(formData);
          toast("Product created successfully");
        }
        setModalOpen(false);
        load();
      } catch {
        toast("Failed to save product", "error");
      }
    },
    [editing, load, toast]
  );

  const handleDelete = useCallback(async () => {
    if (!deletingId) return;
    try {
      await productsApi.remove(deletingId);
      toast("Product deleted");
      setDeletingId(null);
      load();
    } catch {
      toast("Failed to delete product", "error");
    }
  }, [deletingId, load, toast]);

  // Stable columns — only recreated when callbacks change
  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      {
        key: "price",
        label: "Price",
        render: (p: Product) => (
          <span className="font-medium text-slate-900">${Number(p.price).toFixed(2)}</span>
        ),
      },
      {
        key: "quantity",
        label: "Stock",
        render: (p: Product) => (
          <Badge variant={p.quantity > 10 ? "green" : p.quantity > 0 ? "yellow" : "red"}>
            {p.quantity} units
          </Badge>
        ),
      },
      {
        key: "actions",
        label: "",
        align: "right" as const,
        render: (p: Product) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => openEdit(p)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Edit"
              data-testid="edit-product-button"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={() => setDeletingId(p.id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
              title="Delete"
              data-testid="delete-product-button"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ),
      },
    ],
    [openEdit]
  );

  return (
    <>
      <PageHeader
        title="Products"
        description="Manage your product catalog"
        action={
          <Button onClick={openCreate} data-testid="new-product-button">
            <Plus size={15} />
            New product
          </Button>
        }
      />

      <div className="mb-4 relative w-full md:w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          placeholder="Search products..."
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            updatePage(1);
          }}
          data-testid="search-input"
          className="w-full border border-slate-200 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-300 transition-colors"
        />
      </div>

      <Table
        columns={columns}
        data={data?.items ?? []}
        keyExtractor={(p) => p.id}
        loading={loading}
        data-testid="products-table"
      />
      <Pagination current={page} last={data?.last_page ?? 1} onChange={updatePage} />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
        data-testid="confirm-dialog"
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit product" : "New product"} data-testid="product-modal">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" data-testid="product-form">
          <Input label="Name" error={errors.name?.message} data-testid="product-name-input" {...register("name")} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-slate-700">Price</label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <input
                  inputMode="numeric"
                  value={formatCurrency(priceCents)}
                  onFocus={(e) => {
                    const l = e.target.value.length;
                    e.target.setSelectionRange(l, l);
                  }}
                  onClick={(e) => {
                    const l = e.target.value.length;
                    e.target.setSelectionRange(l, l);
                  }}
                  onKeyDown={(e) => {
                    const el = e.currentTarget;
                    const l = el.value.length;
                    setTimeout(() => el.setSelectionRange(l, l), 0);
                  }}
                  onChange={(e) => {
                    const digits = e.target.value.replace(/\D/g, "");
                    const cents = parseInt(digits || "0", 10);
                    setPriceCents(cents);
                    field.onChange(cents / 100);
                  }}
                  data-testid="product-price-input"
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-slate-300 transition-colors"
                />
              )}
            />
            {errors.price && <p className="text-xs text-red-500">{errors.price.message}</p>}
          </div>
          <Input label="Stock" type="number" min="0" error={errors.quantity?.message} data-testid="product-stock-input" {...register("quantity")} />
          <Button type="submit" loading={isSubmitting} className="w-full mt-1" data-testid="save-product-button">
            {editing ? "Save changes" : "Create product"}
          </Button>
        </form>
      </Modal>
    </>
  );
}
