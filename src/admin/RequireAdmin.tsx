import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth";

/** Gates the admin area: must be signed in AND have role 'admin'. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { session, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center bg-paper">
        <p className="text-[12px] uppercase tracking-[0.2em] text-ink/40">
          loading…
        </p>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />;
  }

  if (!isAdmin) {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <h1 className="font-display text-3xl text-ink">Not authorised</h1>
        <p className="max-w-sm text-sm text-ink/60">
          This account isn’t an administrator. Sign in with an admin account to
          manage the store.
        </p>
        <a
          href="/admin/login"
          className="mt-2 rounded-full bg-ink px-6 py-2.5 text-[12px] uppercase tracking-[0.14em] text-paper"
        >
          back to login
        </a>
      </div>
    );
  }

  return <>{children}</>;
}
