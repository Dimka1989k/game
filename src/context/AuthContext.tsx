import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { supabase } from "../supabaseClient";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
  session: Session | null | undefined;
  signUpNewUser: (
    email: string,
    password: string,
    username: string
  ) => Promise<{ success: boolean; error?: string }>;
  signInUser: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  const signUpNewUser = async (
    email: string,
    password: string,
    username: string
  ) => {
    try {
      const {  error } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password,
        options: {
          data: {
            username,
            display_name: username, 
          },
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: unknown) {
      if (err instanceof Error) {
        return { success: false, error: err.message };
      }
      return { success: false, error: "Unexpected error" };
    }
  };

  const signInUser = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.toLowerCase(),
      password,
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
    });

    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{ session, signUpNewUser, signInUser, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function UserAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx)
    throw new Error("UserAuth must be used inside <AuthContextProvider>");
  return ctx;
}
