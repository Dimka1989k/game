import { useState } from "react";
import { supabase } from "../../supabaseClient";
import iconRocket from "../../assets/rocket.svg";

import "../Login/SignIn.styles.css";

export default function ResetRequest() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


     if (!email.trim()) {
       setError("Please enter email");
       setTimeout(() => setError(null), 3000);
       return;
     }

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update`,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Check your email for the reset link.");
    }
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-img">
          <img src={iconRocket} alt="rocket" width="64px" height="64px" />
        </div>
        <div className="container-input">
          <h1 className="form-text">Reset password</h1>
          <input
            className="input"
            type="email"
            placeholder="Enter email"
            onChange={(e) => setEmail(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-login">
            <p className="text-btn">Reset</p>
          </button>
        </div>
        {message && <p className="text-reset">{message}</p>}
      </form>
    </div>
  );
}
