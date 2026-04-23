"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Search } from "lucide-react";
import { customersApi } from "@/lib/api/customers";
import { formatDate } from "@/lib/utils";
import type { Customer } from "@/types/customer";
import PageHeader from "@/components/ui/page-header";
import Table from "@/components/ui/table";
import Pagination from "@/components/ui/pagination";
import Modal from "@/components/ui/modal";
import Button from "@/components/ui/button";
import Input from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
});

type FormData = z.infer<typeof schema>;

export default function CustomersPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [data, setData] = useState<{
    items: Customer[];
    last_page: number;
  } | null>(null);
  const [page, setPage] = useState(() => {
    const rawPage = Number(searchParams.get("page") ?? "1");
    return Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;
  });
  const [filter, setFilter] = useState("");
  const debouncedFilter = useDebounce(filter, 350);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const load = useCallback(
    (signal?: AbortSignal) => {
      setLoading(true);
      customersApi
        .list({ page, filter: debouncedFilter || undefined }, signal)
        .then((res) => setData(res))
        .catch((err) => {
          if (err.name !== "CanceledError" && err.name !== "AbortError") {
            toast("Failed to load customers", "error");
          }
        })
        .finally(() => setLoading(false));
    },
    [page, debouncedFilter], // eslint-disable-line react-hooks/exhaustive-deps
  );

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
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
    [pathname, router, searchParams],
  );

  const openCreate = useCallback(() => {
    reset({ name: "", email: "" });
    setModalOpen(true);
  }, [reset]);

  const onSubmit = useCallback(
    async (formData: FormData) => {
      try {
        await customersApi.create(formData);
        toast("Customer created successfully");
        setModalOpen(false);
        load();
      } catch (err: any) {
        const message =
          err.response?.data?.message ?? "Failed to create customer";
        setError("email", { message });
      }
    },
    [load, toast, setError],
  );

  // Stable columns definition
  const columns = useMemo(
    () => [
      { key: "name", label: "Name" },
      {
        key: "email",
        label: "Email",
        render: (c: Customer) => (
          <span className="text-slate-500">{c.email}</span>
        ),
      },
      {
        key: "created_at",
        label: "Created at",
        render: (c: Customer) => (
          <span className="text-slate-400 text-xs">
            {formatDate(c.created_at)}
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <>
      <PageHeader
        title="Customers"
        description="Manage your customer base"
        action={
          <Button onClick={openCreate} data-testid="new-customer-button">
            <Plus size={15} />
            New customer
          </Button>
        }
      />

      <div className="mb-4 relative w-full md:w-72">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          placeholder="Search customers..."
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
        keyExtractor={(c) => c.id}
        loading={loading}
        data-testid="customers-table"
      />
      <Pagination
        current={page}
        last={data?.last_page ?? 1}
        onChange={updatePage}
      />

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="New customer"
        data-testid="customer-modal"
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          data-testid="customer-form"
        >
          <Input
            label="Name"
            placeholder="John Doe"
            error={errors.name?.message}
            data-testid="customer-name-input"
            {...register("name")}
          />
          <Input
            label="Email"
            type="email"
            placeholder="john@example.com"
            error={errors.email?.message}
            data-testid="customer-email-input"
            {...register("email")}
          />
          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full mt-1"
            data-testid="create-customer-button"
          >
            Create customer
          </Button>
        </form>
      </Modal>
    </>
  );
}
