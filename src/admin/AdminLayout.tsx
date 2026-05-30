import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  Upload,
  LogOut,
  Store,
  Receipt,
  ShoppingCart,
  Users,
} from "lucide-react";
import { useAuth } from "../lib/auth";
import { cn } from "../lib/cn";

const nav = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, end: true },
  { to: "/admin/orders", label: "Orders", icon: Receipt, end: false },
  { to: "/admin/products", label: "Products", icon: Package, end: false },
  { to: "/admin/import", label: "CSV import", icon: Upload, end: false },
  { to: "/admin/carts", label: "Carts", icon: ShoppingCart, end: false },
  { to: "/admin/visitors", label: "Visitors", icon: Users, end: false },
];

export function AdminLayout() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <div className="min-h-[100svh] bg-[#f4f1ec] text-ink">
      <div className="mx-auto flex min-h-[100svh] max-w-[1500px]">
        {/* sidebar */}
        <aside className="sticky top-0 hidden h-[100svh] w-60 shrink-0 flex-col border-r border-ink/10 bg-paper px-5 py-7 md:flex">
          <div className="px-2">
            <p className="font-serif text-xl italic text-ink">hasto</p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.22em] text-ink/40">
              admin
            </p>
          </div>

          <nav className="mt-10 flex flex-1 flex-col gap-1">
            {nav.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] tracking-[0.02em] transition-colors",
                    isActive
                      ? "bg-ink text-paper"
                      : "text-ink/65 hover:bg-ink/5 hover:text-ink"
                  )
                }
              >
                <Icon size={17} strokeWidth={1.7} />
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-auto space-y-1 border-t border-ink/10 pt-4">
            <a
              href="/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <Store size={17} strokeWidth={1.7} />
              View store
            </a>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-[13px] text-ink/65 transition-colors hover:bg-ink/5 hover:text-ink"
            >
              <LogOut size={17} strokeWidth={1.7} />
              Sign out
            </button>
            <p className="px-3 pt-3 text-[10px] text-ink/35">{session?.user.email}</p>
          </div>
        </aside>

        {/* main */}
        <main className="min-w-0 flex-1">
          {/* mobile top bar */}
          <div className="flex items-center justify-between border-b border-ink/10 bg-paper px-5 py-3 md:hidden">
            <span className="font-serif text-lg italic">hasto admin</span>
            <button
              onClick={handleSignOut}
              className="text-[12px] uppercase tracking-[0.14em] text-ink/60"
            >
              sign out
            </button>
          </div>
          {/* mobile nav */}
          <div className="flex gap-2 overflow-x-auto border-b border-ink/10 bg-paper px-5 py-2 md:hidden">
            {nav.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "whitespace-nowrap rounded-full px-3 py-1.5 text-[12px]",
                    isActive ? "bg-ink text-paper" : "bg-ink/5 text-ink/65"
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </div>

          <div className="px-5 py-8 md:px-10 md:py-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
