import { Link } from "react-router";
import "../Login/SignIn.styles.css";

import iconRocket from "../../assets/rocket.svg";
import enterIcon from "../../assets/enter-icon.svg";

import { useSignUp } from "../hooks/useSignUp";

export default function SignUp() {
  const {
    email,
    username,
    password,
    error,
    loading,
    setEmail,
    setUsername,
    setPassword,
    handleSignUp,
  } = useSignUp();

  return (
    <div className="container">
      <form onSubmit={handleSignUp} className="form">
        <div className="form-img">
          <img src={iconRocket} alt="rocket" width="64" height="64" />
        </div>

        <div className="container-input">
          <h1 className="form-text">Rocket Casino</h1>
          <p className="form-text-small">Welcome back!</p>

          <label className="label">Username</label>
          <input
            className="input"
            type="text"
            placeholder="Enter username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <label className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {error && <p className="error-text">{error}</p>}

          <button className="btn-login" disabled={loading}>
            <img src={enterIcon} alt="enter" width="16" height="16" />
            <p className="text-btn">{loading ? "Loading..." : "Register"}</p>
          </button>
        </div>

        <div className="container-link">
          <Link to="/signin" className="text-link">
            Already have an account? Login
          </Link>
        </div>

        <div className="line"></div>
        <p className="text-bottom">Your account data is stored locally in your browser</p>
      </form>
    </div>
  );
}
