import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { UserAuth } from "../../context/AuthContext";
import "../Login/SignIn.styles.css";

import iconRocket from "../../assets/rocket.svg";
import enterIcon from "../../assets/enter-icon.svg";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { signUpNewUser } = UserAuth();

  const handleSignUp = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);


    if (!username.trim() || !email.trim() || !password.trim()) {
      setError("Please enter username, email and password");
      setTimeout(() => setError(null), 3000);
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

  return (
    <div className="container">
      <form onSubmit={handleSignUp} className="form">
        <div className="form-img">
          <img src={iconRocket} alt="rocket" width="64px" height="64px" />
        </div>

        <div className="container-input">
          <h1 className="form-text">Rocket Casino</h1>
          <p className="form-text-small">Welcome back!</p>

          <label className="label">Username</label>
          <input
            className="input"
            type="text"
            placeholder="Enter username"
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button className="btn-login" disabled={loading}>
            <img src={enterIcon} alt="enterIcon" width="16px" height="16px" />
            <p className="text-btn">Register</p>
          </button>
        </div>

        <div className="container-link">
          <Link to="/signin" className="text-link">
            Already have an account? Login
          </Link>
        </div>

        <div className="line"></div>

        <p className="text-bottom">
          Your account data is stored locally in your browser
        </p>
      </form>
    </div>
  );
}
