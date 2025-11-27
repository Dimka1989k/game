import { useState, useEffect } from "react";
import { supabase } from "../../supabaseClient";
import iconRocket from "../../assets/rocket.svg";
import { Link } from "react-router";

import "../Login/SignIn.styles.css"

export default function UpdatePassword() {
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState("");
   const [error, setError] = useState<string | null>(null);
 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setMessage("Invalid or expired link.");
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

      if (!newPassword.trim()) {
        setError("Please enter new password");
        setTimeout(() => setError(null), 3000);
        return;
      }

    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage("Password updated successfully. You can log in now.");
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-img">
          <img src={iconRocket} alt="rocket" width="64px" height="64px" />
        </div>

        <div className="container-input">
          <h1 className="form-text">New password</h1>
          <input
            className="input"
            type="password"
            placeholder="New password"
            onChange={(e) => setNewPassword(e.target.value)}
          />
          {error && <p className="error-text">{error}</p>}
          <button type="submit" className="btn-login">
            <p className="text-btn">Update</p>
          </button>
          <div className="container-link-login">
            <Link to="/signin">
              <p className="btn-to-login">
                Already have a new password? Login
              </p>
            </Link>
          </div>
        </div>
        {message && <p className="text-reset">{message}</p>}
      </form>
    </div>
  );
}
