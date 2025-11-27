import { UserAuth } from "../context/AuthContext";
import { Navigate } from "react-router";
import type { ReactNode } from "react";

export default function PrivateRoute({ children }: { children: ReactNode }) {
  const { session } = UserAuth();

  if (session === undefined) return <div>Loading...</div>;

  return session ? <>{children}</> : <Navigate to="/signin" />;
}
