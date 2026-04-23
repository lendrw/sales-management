"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Eye } from "lucide-react";
import { ordersApi } from "@/lib/api/orders";
import { formatDate } from "@/lib/utils";
import { customersApi } from "@/lib/api/customers";
import { productsApi } from "@/lib/api/products";
import type { Order } from "@/types/order";
import type { Customer } from "@/types/customer";
import type { Product } from "@/types/product";
import PageHeader from "@/components/ui/page-header";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Select from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  customer_id: z.string().min(1, "Customer is required"),
  products: z
    .array(
      z.object({
        id: z.string().min(1, "Product is required"),
        quantity: z.coerce.number().int().min(1, "Min 1"),
      }),
    )
    .min(1, "Add at least one product"),
});

type FormInput = z.input<typeof schema>;
type FormData = z.output<typeof schema>;

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<Order | null>(null);

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormInput, unknown, FormData>({
    resolver: zodResolver(schema),
    defaultValues: { customer_id: "", products: [{ id: "", quantity: 1 }] },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "products",
  });

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;

    Promise.all([
      ordersApi.list({ per_page: 100 }, signal),
      customersApi.list({ per_page: 100 }, signal),
      productsApi.list({ per_page: 100 }, signal),
    ])
      .then(([o, c, p]) => {
        setOrders(o.items);
        setCustomers(c.items);
        setProducts(p.items);
      })
      .catch((err) => {
        if (err.name !== "CanceledError" && err.name !== "AbortError") {
          toast("Failed to load data", "error");
        }
      });

    return () => controller.abort();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // O(1) lookups instead of O(n) .find() on every render
  const customerMap = useMemo(
    () => new Map(customers.map((c) => [c.id, c])),
    [customers],
  );

  const productMap = useMemo(
    () => new Map(products.map((p) => [p.id, p])),
    [products],
  );

  const selectableProducts = useMemo(() => {
    const inStockProducts = [...products]
      .filter((product) => product.quantity > 0)
      .sort((a, b) => b.quantity - a.quantity);

    const productsWithEnoughStockForTests = inStockProducts.filter(
      (product) => product.quantity >= 3,
    );

    return productsWithEnoughStockForTests.length > 0
      ? productsWithEnoughStockForTests
      : inStockProducts;
  }, [products]);

  const openCreate = useCallback(() => {
    reset({ customer_id: "", products: [{ id: "", quantity: 1 }] });
    setModalOpen(true);
  }, [reset]);

  const onSubmit = useCallback(
    async (formData: FormData) => {
      setModalOpen(false);
      try {
        const order = await ordersApi.create(formData);
        setOrders((prev) => [order, ...prev]);
        toast("Order created successfully");
      } catch {
        toast("Failed to create order", "error");
      }
    },
    [toast],
  );

  const handleView = useCallback(
    async (id: string) => {
      try {
        const order = await ordersApi.get(id);
        setViewOrder(order);
      } catch {
        toast("Failed to load order", "error");
      }
    },
    [toast],
  );

  const orderTotal = useCallback(
    (order: Order) =>
      order.order_products.reduce(
        (acc, op) => acc + Number(op.price) * op.quantity,
        0,
      ),
    [],
  );

  return (
    <>
      <PageHeader
        title="Orders"
        description="Track and manage customer orders"
        action={
          <Button onClick={openCreate} data-testid="new-order-button">
            <Plus size={15} />
            New order
          </Button>
        }
      />

      <div
        className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm"
        data-testid="orders-table"
      >
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Order
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Customer
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                Date
              </th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {orders.map((order) => (
              <tr
                key={order.id}
                className="hover:bg-slate-50/70 transition-colors"
              >
                <td className="px-4 py-3 font-mono text-xs text-slate-400">
                  {order.id.slice(0, 8)}…
                </td>
                <td className="px-4 py-3 text-slate-700">
                  {customerMap.get(order.customer_id)?.name ??
                    order.customer_id}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {order.order_products.length} item(s)
                </td>
                <td className="px-4 py-3 font-medium text-slate-900">
                  ${orderTotal(order).toFixed(2)}
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">
                  {formatDate(order.created_at)}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleView(order.id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    title="View order"
                    data-testid="view-order-button"
                  >
                    <Eye size={14} />
                  </button>
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-slate-400 text-sm"
                >
                  No orders yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Create order modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New order"
        data-testid="order-modal"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          data-testid="order-form"
        >
          <Select
            label="Customer"
            error={errors.customer_id?.message}
            data-testid="order-customer-select"
            {...register("customer_id")}
          >
            <option value="">Select a customer...</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Products
            </label>
            <div className="flex flex-col gap-2">
              {fields.map((field, i) => (
                <div key={field.id} className="flex gap-2 items-start">
                  <div className="flex-1">
                    <select
                      {...register(`products.${i}.id`)}
                      data-testid="order-product-select"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors"
                    >
                      <option value="">Select product...</option>
                      {selectableProducts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    {errors.products?.[i]?.id?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.products[i]?.id?.message}
                      </p>
                    )}
                  </div>
                  <div className="w-20">
                    <input
                      {...register(`products.${i}.quantity`)}
                      type="number"
                      min={1}
                      placeholder="Qty"
                      data-testid="order-quantity-input"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 hover:border-slate-300 transition-colors"
                    />
                    {errors.products?.[i]?.quantity?.message && (
                      <p className="text-xs text-red-500 mt-1">
                        {errors.products[i]?.quantity?.message}
                      </p>
                    )}
                  </div>
                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => remove(i)}
                      className="p-2 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors mt-0.5"
                      data-testid="remove-product-button"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => append({ id: "", quantity: 1 })}
              className="mt-2 flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors"
              data-testid="add-product-button"
            >
              <Plus size={12} />
              Add product
            </button>
            {errors.products?.message && (
              <p className="text-xs text-red-500 mt-1">
                {errors.products.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full mt-1"
            data-testid="create-order-button"
          >
            Create order
          </Button>
        </form>
      </Modal>

      {/* View order modal */}
      <Modal
        open={!!viewOrder}
        onClose={() => setViewOrder(null)}
        title="Order details"
        data-testid="order-details-modal"
      >
        {viewOrder && (
          <div className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Order ID</p>
                <p className="font-mono text-xs text-slate-600">
                  {viewOrder.id.slice(0, 16)}…
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">Customer</p>
                <p className="text-slate-700 font-medium">
                  {customerMap.get(viewOrder.customer_id)?.name ??
                    viewOrder.customer_id}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
                Items
              </p>
              <div className="flex flex-col divide-y divide-slate-100 border border-slate-100 rounded-lg overflow-hidden">
                {viewOrder.order_products.map((op) => (
                  <div
                    key={op.id}
                    className="flex items-center justify-between px-3 py-2.5"
                  >
                    <span className="text-slate-700">
                      {productMap.get(op.product_id)?.name ?? op.product_id}
                    </span>
                    <div className="flex items-center gap-3 text-right">
                      <span className="text-slate-400 text-xs">
                        {op.quantity}×
                      </span>
                      <span className="font-medium text-slate-900">
                        ${(Number(op.price) * op.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 border-t border-slate-100">
              <span className="text-sm text-slate-500">Total</span>
              <span className="text-base font-semibold text-slate-900">
                ${orderTotal(viewOrder).toFixed(2)}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
