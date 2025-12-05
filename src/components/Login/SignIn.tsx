import { Link } from "react-router";
import "./SignIn.styles.css";

import iconRocket from "../../assets/rocket.svg";
import enterIcon from "../../assets/enter-icon.svg";

import { useSignIn } from "../hooks/useSignIn";

export default function SignIn() {
  const {
    email,
    password,
    error,
    setEmail,
    setPassword,
    handleSignIn,
  } = useSignIn();

  return (
    <div className="container">
      <form onSubmit={handleSignIn} className="form">
        <div className="form-img">
          <img src={iconRocket} alt="rocket" width="64" height="64" />
        </div>

        <div className="container-input">
          <h1 className="form-text">Rocket Casino</h1>
          <p className="form-text-small">Welcome back!</p>
          <label htmlFor="email" className="label">Email</label>
          <input
            className="input"
            type="email"
            placeholder="Enter email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label htmlFor="password" className="label">Password</label>
          <input
            className="input"
            type="password"
            placeholder="Enter password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Link to="/reset" className="text-forgot">Forgot password?</Link>

          {error && <p className="error-text">{error}</p>}

          <button className="btn-login">
            <img src={enterIcon} alt="enter" width="16" height="16" />
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
