import { useState, type FormEvent } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../lib/auth";
import { cn } from "../../lib/cn";

const inputCls =
  "w-full rounded-lg border border-ink/15 bg-white px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-ink/40";

export function CustomerAuth() {
  const { signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const { state } = useLocation();
  const redirectTo = (state as { from?: string } | null)?.from || "/account";

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [f, setF] = useState({ name: "", email: "", phone: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const set = (k: keyof typeof f, v: string) => setF((c) => ({ ...c, [k]: v }));

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    const res =
      mode === "login"
        ? await signIn(f.email.trim(), f.password)
        : await signUp(f.email.trim(), f.password, f.name.trim(), f.phone.trim());
    setBusy(false);
    if (res.error) return setError(res.error);
    navigate(redirectTo, { replace: true });
  };

  return (
    <main className="flex min-h-[100svh] items-center justify-center bg-paper px-6 pt-24 text-ink">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-serif text-3xl italic">hasto</p>
          <p className="mt-1 text-[10px] uppercase tracking-[0.24em] text-ink/40">
            {mode === "login" ? "welcome back" : "create your account"}
          </p>
        </div>

        {/* toggle */}
        <div className="mb-6 grid grid-cols-2 rounded-full border border-ink/10 p-1 text-[12px] uppercase tracking-[0.12em]">
          {(["login", "signup"] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                setError(null);
              }}
              className={cn(
                "rounded-full py-2 transition",
                mode === m ? "bg-ink text-paper" : "text-ink/50"
              )}
            >
              {m === "login" ? "sign in" : "sign up"}
            </button>
          ))}
        </div>

        <form onSubmit={submit} className="space-y-3.5">
          {mode === "signup" && (
            <>
              <input required placeholder="Full name" value={f.name} onChange={(e) => set("name", e.target.value)} className={inputCls} />
              <input placeholder="Phone (optional)" value={f.phone} onChange={(e) => set("phone", e.target.value)} className={inputCls} />
            </>
          )}
          <input required type="email" autoComplete="email" placeholder="Email" value={f.email} onChange={(e) => set("email", e.target.value)} className={inputCls} />
          <input
            required
            type="password"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            placeholder={mode === "login" ? "Password" : "Password (8+ characters)"}
            value={f.password}
            onChange={(e) => set("password", e.target.value)}
            className={inputCls}
          />

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-[12px] text-red-700">{error}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-full bg-ink py-3 text-[12px] uppercase tracking-[0.16em] text-paper transition hover:bg-ink/90 disabled:opacity-50"
          >
            {busy ? "please wait…" : mode === "login" ? "sign in" : "create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-[11px] lowercase tracking-[0.06em] text-ink/40">
          <Link to="/" className="underline underline-offset-2">
            continue shopping
          </Link>
        </p>
      </div>
    </main>
  );
}
