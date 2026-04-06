"use client";

import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { productsApi } from "@/lib/api/products";
import type { Product } from "@/types/product";
import PageHeader from "@/components/ui/page-header";
import Table from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import ConfirmDialog from "@/components/ui/confirm-dialog";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  price: z.number().positive("Invalid price"),
  quantity: z.coerce.number().int().min(0, "Invalid quantity"),
});

type FormData = z.infer<typeof schema>;

function formatCurrency(cents: number) {
  return (cents / 100).toLocaleString("en-US", { style: "currency", currency: "USD" });
}

export default function ProductsPage() {
  const [data, setData] = useState<{ items: Product[]; last_page: number } | null>(null);
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [priceCents, setPriceCents] = useState(0);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  async function load() {
    const res = await productsApi.list({ page, filter: filter || undefined });
    setData(res);
  }

  useEffect(() => { load(); }, [page, filter]);

  function openCreate() {
    setEditing(null);
    setPriceCents(0);
    reset({ name: "", price: 0, quantity: 0 });
    setModalOpen(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    const cents = Math.round(Number(product.price) * 100);
    setPriceCents(cents);
    reset({ name: product.name, price: Number(product.price), quantity: product.quantity });
    setModalOpen(true);
  }

  async function onSubmit(formData: FormData) {
    if (editing) {
      await productsApi.update(editing.id, formData);
    } else {
      await productsApi.create(formData);
    }
    setModalOpen(false);
    load();
  }

  async function handleDelete() {
    if (!deletingId) return;
    await productsApi.remove(deletingId);
    setDeletingId(null);
    load();
  }

  const columns = [
    { key: "name", label: "Name" },
    { key: "price", label: "Price", render: (p: Product) => `$${Number(p.price).toFixed(2)}` },
    { key: "quantity", label: "Stock" },
    {
      key: "actions", label: "",
      render: (p: Product) => (
        <div className="flex gap-2">
          <button onClick={() => openEdit(p)} className="text-blue-600 hover:underline text-xs">Edit</button>
          <button onClick={() => setDeletingId(p.id)} className="text-red-500 hover:underline text-xs">Delete</button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Products"
        action={
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + New product
          </button>
        }
      />
      <div className="mb-4">
        <input
          placeholder="Search product..."
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(1); }}
          className="border rounded-lg px-3 py-2 text-sm w-72 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <Table columns={columns} data={data?.items ?? []} keyExtractor={(p) => p.id} />
      <Pagination current={page} last={data?.last_page ?? 1} onChange={setPage} />

      <ConfirmDialog
        open={!!deletingId}
        title="Delete product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setDeletingId(null)}
      />

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit product" : "New product"}>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input {...register("name")} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price</label>
            <Controller
              name="price"
              control={control}
              render={({ field }) => (
                <div className="relative">
                  <input
                    inputMode="numeric"
                    value={formatCurrency(priceCents)}
                    onFocus={(e) => {
                      const len = e.target.value.length;
                      e.target.setSelectionRange(len, len);
                    }}
                    onClick={(e) => {
                      const len = e.target.value.length;
                      e.target.setSelectionRange(len, len);
                    }}
                    onKeyDown={(e) => {
                      const el = e.currentTarget;
                      const len = el.value.length;
                      setTimeout(() => el.setSelectionRange(len, len), 0);
                    }}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, "");
                      const cents = parseInt(digits || "0", 10);
                      setPriceCents(cents);
                      field.onChange(cents / 100);
                    }}
                    className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Stock</label>
            <input {...register("quantity")} type="number" min="0" className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Saving..." : "Save"}
          </button>
        </form>
      </Modal>
    </>
  );
}
