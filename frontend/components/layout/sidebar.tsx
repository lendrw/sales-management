"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  Package,
  Users,
  ShoppingCart,
  User,
  LogOut,
  Store,
  Menu,
  X,
} from "lucide-react";

const links = [
  { href: "/products", label: "Products", icon: Package },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/orders", label: "Orders", icon: ShoppingCart },
  { href: "/profile", label: "Profile", icon: User },
];

function SidebarContent({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="w-60 bg-slate-900 text-white flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
        <Link href="/products" onClick={onClose} className="flex items-center gap-2.5 w-fit">
          <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Store size={16} className="text-white" />
          </div>
          <span className="font-semibold text-sm tracking-tight">API Vendas</span>
        </Link>
        {onClose && (
          <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors md:hidden">
            <X size={18} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={onClose}
              className={[
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-150",
                active
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800",
              ].join(" ")}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-slate-800">
        <div className="flex items-center gap-3 px-3 py-2 rounded-lg">
          <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-medium text-slate-300 shrink-0">
            {user?.name?.charAt(0).toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-200 truncate">{user?.name}</p>
            <p className="text-xs text-slate-500 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="mt-1 w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-500 hover:text-red-400 hover:bg-slate-800 transition-colors"
        >
          <LogOut size={13} />
          Sign out
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // Mount before animating in, unmount after animating out
  useEffect(() => {
    if (open) {
      setVisible(true);
    } else {
      const t = setTimeout(() => setVisible(false), 300);
      return () => clearTimeout(t);
    }
  }, [open]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex min-h-screen shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile topbar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-40 h-14 bg-slate-900 flex items-center justify-between px-4 gap-3 border-b border-slate-800">
        <button
          onClick={() => setOpen(true)}
          className="text-slate-400 hover:text-white transition-colors"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <Link href="/products" className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-emerald-500 flex items-center justify-center">
            <Store size={14} className="text-white" />
          </div>
          <span className="font-semibold text-sm text-white tracking-tight">API Vendas</span>
        </Link>
      </header>

      {/* Mobile drawer */}
      {visible && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div
            onClick={() => setOpen(false)}
            style={{ transition: "opacity 300ms ease", opacity: open ? 1 : 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          {/* Panel */}
          <div
            style={{
              transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
              transform: open ? "translateX(0)" : "translateX(-100%)",
            }}
            className="relative h-full shadow-2xl"
          >
            <SidebarContent onClose={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  );
}
