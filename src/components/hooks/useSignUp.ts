import { useState } from "react";
import { useNavigate } from "react-router";
import { UserAuth } from "../../context/AuthContext";

export function useSignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { signUpNewUser } = UserAuth();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please enter username, email and password");
      setTimeout(() => setError(null), 3000);
      setLoading(false);
      return;
    }

    try {
      const result = await signUpNewUser(email, password, username);

      if (result.success) {
        navigate("/dashboard");
      } else {
        setError(result.error || "Registration failed");
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    username,
    password,
    error,
    loading,
    setEmail,
    setUsername,
    setPassword,
    handleSignUp,
  };
}
