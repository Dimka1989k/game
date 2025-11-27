import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { UserAuth } from "../../context/AuthContext";
import "./SignIn.styles.css";

import iconRocket from "../../assets/rocket.svg";
import enterIcon from "../../assets/enter-icon.svg"

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const { signInUser } = UserAuth();

  const handleSignIn = async (e: FormEvent) => {
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

  return (
    <div className="container">
      <form onSubmit={handleSignIn} className="form">
        <div className="form-img">
          <img src={iconRocket} alt="rocket" width="64px" height="64px" />
        </div>

        <div className="container-input">
          <h1 className="form-text">Rocket Casino</h1>
          <p className="form-text-small">Welcome back!</p>
          <label htmlFor="email" className="label">
            Email
          </label>
          <input
            className="input"
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="password" className="label">
            Password
          </label>
          <input
            className="input"
            type="password"
            placeholder="Enter password"
            onChange={(e) => setPassword(e.target.value)}
          />
         
            <Link to="/reset" className="text-forgot">
              Forgot password?
            </Link>
        
          {error && <p className="error-text">{error}</p>}
          <button className="btn-login">
            <img src={enterIcon} alt="enterIcon" width="16px" height="16px" />
            <p className="text-btn">Login</p>
          </button>
        </div>
        <div className="container-link">
          <Link to="/signup" className="text-link">
            Don't have an account? Register
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
