import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabaseClient";

const AuthContext = createContext();

const ADMIN_EMAILS = ["mugendievans10@gmail.com", "tranquil@gmail.com"];

function formatUser(authUser) {
  if (!authUser) return null;

  const email = authUser.email?.trim().toLowerCase();

  return {
    id: authUser.id,
    email,
    name:
      authUser.user_metadata?.full_name ||
      authUser.user_metadata?.name ||
      email?.split("@")[0] ||
      "Beauty User",
    avatar: authUser.user_metadata?.avatar_url || null,
    isAdmin: ADMIN_EMAILS.includes(email),
  };
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function initAuth() {
      try {
        const code = new URLSearchParams(window.location.search).get("code");

        if (code) {
          await supabase.auth.exchangeCodeForSession(code);

          window.history.replaceState(
            {},
            document.title,
            window.location.pathname
          );
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session error:", error.message);
        }

        if (!mounted) return;

        setSession(data.session);
        setUser(formatUser(data.session?.user));
      } catch (error) {
        console.error("Auth init error:", error.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initAuth();

    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setUser(formatUser(newSession?.user));
      setLoading(false);
    });

    return () => {
      mounted = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const loginWithGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        loginWithGoogle,
        logout,
        isAdmin: Boolean(user?.isAdmin),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}