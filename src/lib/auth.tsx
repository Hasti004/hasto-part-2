import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "./supabase";

type AuthState = {
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
    phone: string
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthState>({
  session: null,
  isAdmin: false,
  loading: true,
  signIn: async () => ({ error: "not ready" }),
  signUp: async () => ({ error: "not ready" }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Look up the role for the signed-in user.
  const refreshRole = async (s: Session | null) => {
    if (!s) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", s.user.id)
      .maybeSingle();
    setIsAdmin(data?.role === "admin");
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!active) return;
      setSession(data.session);
      await refreshRole(data.session);
      setLoading(false);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      void refreshRole(s);
    });
    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signIn: AuthState["signIn"] = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return { error: error.message };
    await refreshRole(data.session);
    return { error: null };
  };

  const signUp: AuthState["signUp"] = async (email, password, fullName, phone) => {
    const { error: rpcError } = await supabase.rpc("customer_signup", {
      p_email: email,
      p_password: password,
      p_full_name: fullName || undefined,
      p_phone: phone || undefined,
    });
    if (rpcError) return { error: rpcError.message };
    return signIn(email, password);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ session, isAdmin, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
