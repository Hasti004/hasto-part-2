import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function AdminLogin() {
  const { signIn, session, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Already signed in as admin — skip the form.
  if (session && isAdmin) {
    navigate("/admin", { replace: true });
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await signIn(email.trim(), password);
    setBusy(false);
    if (error) {
      setError(error);
      return;
    }
    navigate("/admin", { replace: true });
  };

  return (
    <div className="flex min-h-[100svh] items-center justify-center bg-[#f4f1ec] px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-3xl italic text-ink">hasto</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-ink/40">
            admin panel
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="space-y-4 rounded-2xl border border-ink/10 bg-paper p-7 shadow-soft"
        >
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/55">
              Email
            </label>
            <input
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-[11px] uppercase tracking-[0.14em] text-ink/55">
              Password
            </label>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ink py-3 text-[12px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {busy ? "signing in…" : "sign in"}
          </button>
        </form>
      </div>
    </div>
  );
}
