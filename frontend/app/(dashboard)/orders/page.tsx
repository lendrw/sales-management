"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ordersApi } from "@/lib/api/orders";
import { formatDate } from "@/lib/utils";
import { customersApi } from "@/lib/api/customers";
import { productsApi } from "@/lib/api/products";
import type { Order } from "@/types/order";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import PageHeader from "@/components/ui/page-header";
import Modal from "@/components/ui/modal";

const schema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  products: z.array(
    z.object({
      id: z.string().min(1, "Product is required"),
      quantity: z.coerce.number().int().min(1, "Minimum 1"),
    })
  ).min(1, "Add at least one product"),
});

type FormData = z.infer<typeof schema>;

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const { register, handleSubmit, control, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { customer_id: "", products: [{ id: "", quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({ control, name: "products" });

  useEffect(() => {
    customersApi.list({ per_page: 100 }).then((r) => setCustomers(r.items));
    productsApi.list({ per_page: 100 }).then((r) => setProducts(r.items));
  }, []);

  function openCreate() {
    reset({ customer_id: "", products: [{ id: "", quantity: 1 }] });
    setModalOpen(true);
  }

  async function onSubmit(formData: FormData) {
    const order = await ordersApi.create(formData);
    setOrders((prev) => [order, ...prev]);
    setModalOpen(false);
  }

  async function handleView(id: string) {
    const order = await ordersApi.get(id);
    setViewOrder(order);
  }

  return (
    <>
      <PageHeader
        title="Orders"
        action={
          <button onClick={openCreate} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
            + New order
          </button>
        }
      />

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-4 py-3 text-left font-medium text-gray-600">ID</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Customer</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Items</th>
              <th className="px-4 py-3 text-left font-medium text-gray-600">Created at</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500 text-xs font-mono">{order.id.slice(0, 8)}...</td>
                <td className="px-4 py-3">{customers.find((c) => c.id === order.customer_id)?.name ?? order.customer_id}</td>
                <td className="px-4 py-3">{order.order_products.length}</td>
                <td className="px-4 py-3">{formatDate(order.created_at)}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleView(order.id)} className="text-blue-600 hover:underline text-xs">View</button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">No orders yet</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New order">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Customer</label>
            <select {...register("customer_id")} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option value="">Select...</option>
              {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            {errors.customer_id && <p className="text-red-500 text-xs mt-1">{errors.customer_id.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Products</label>
            <div className="flex flex-col gap-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <select {...register(`products.${i}.id`)} className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Select...</option>
                    {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                  <input {...register(`products.${i}.quantity`)} type="number" min={1} placeholder="Qty" className="w-20 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  {fields.length > 1 && (
                    <button type="button" onClick={() => remove(i)} className="text-red-500 text-lg leading-none mt-1">&times;</button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={() => append({ id: "", quantity: 1 })} className="mt-2 text-blue-600 text-xs hover:underline">
              + Add product
            </button>
            {errors.products && <p className="text-red-500 text-xs mt-1">{errors.products.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
            {isSubmitting ? "Creating..." : "Create order"}
          </button>
        </form>
      </Modal>

      <Modal open={!!viewOrder} onClose={() => setViewOrder(null)} title="Order details">
        {viewOrder && (
          <div className="text-sm flex flex-col gap-2">
            <p><span className="font-medium">ID:</span> {viewOrder.id}</p>
            <p><span className="font-medium">Customer:</span> {customers.find((c) => c.id === viewOrder.customer_id)?.name ?? viewOrder.customer_id}</p>
            <p className="font-medium mt-2">Products:</p>
            <ul className="flex flex-col gap-1">
              {viewOrder.order_products.map((op) => (
                <li key={op.id} className="flex justify-between border-b pb-1">
                  <span>{products.find((p) => p.id === op.product_id)?.name ?? op.product_id}</span>
                  <span className="text-gray-500">{op.quantity}x — ${Number(op.price).toFixed(2)}</span>
                </li>
              ))}
            </ul>
            <p className="font-medium text-right mt-1">
              Total: ${viewOrder.order_products.reduce((acc, op) => acc + Number(op.price) * op.quantity, 0).toFixed(2)}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
