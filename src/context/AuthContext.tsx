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
  updateUsername: (
    newName: string
  ) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthContextProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null | undefined>(undefined);

  const signUpNewUser = async (email: string, password: string, username: string) => {
    
    try {
      const { data, error } = await supabase.auth.signUp({
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

      const user = data.user;
   
      if (user) {
        await supabase.from("profiles").insert({
          id: user.id,
          username,
          balance: 1000, 
          total_wagered: 0,
          total_won: 0,
          games_played: 0,
        });
      }

      return { success: true };
    } catch (_err: unknown) {
      const message = _err instanceof Error ? _err.message : "Unexpected error";

      return { success: false, error: message };
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


 const updateUsername = async (newName: string) => {
   const { data, error } = await supabase.auth.updateUser({
     data: {
       display_name: newName,
     },
   });

   console.log("UPDATE:", data, error);

   if (error) return { success: false, error: error.message };   
   await supabase.auth.refreshSession();

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
      value={{ session, signUpNewUser, signInUser, signOut, updateUsername }}
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
