import { useState } from "react";
import { useNavigate } from "react-router";
import { UserAuth } from "../../context/AuthContext";

export function useSignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { signInUser } = UserAuth();
  const navigate = useNavigate();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Please enter email and password");
      setTimeout(() => setError(null), 3000);
      return;
    }

    const result = await signInUser(email, password);

    if (!result.success) {
      setError(result.error || "Login failed");
      setTimeout(() => setError(null), 3000);
      return;
    }

    navigate("/dashboard");
  };

  return {
    email,
    password,
    error,
    setEmail,
    setPassword,
    handleSignIn,
  };
}
