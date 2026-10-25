
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Feather, LockKeyhole, Eye, EyeOff } from "lucide-react";
import "../../styles/login.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  function handleLogin(event) {
    event.preventDefault();
    setError("");

    // Demo-only login. Replace with server-side authentication
    // before deploying the website publicly.
    const savedUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const savedPassword = import.meta.env.VITE_ADMIN_PASSWORD;

    if (
      !savedUsername ||
      !savedPassword ||
      username === savedUsername && password === savedPassword
    ) {
      if (!savedUsername || !savedPassword) {
        setError(
          "Login is not configured yet. Set your admin credentials in the frontend .env file."
        );
        return;
      }

      sessionStorage.setItem("idiotspov-admin-auth", "true");
      navigate("/admin", { replace: true });
      return;
    }

    setError("Incorrect username or password. Please try again.");
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <Link to="/" className="login-brand">
          An idiots pov
        </Link>

        <Link to="/" className="login-back-link">
          <ArrowLeft size={15} />
          Back to website
        </Link>
      </header>

      <main className="login-main">
        <section className="login-card">
          <div className="login-icon">
            <Feather size={25} strokeWidth={1.5} />
          </div>

          <p className="login-eyebrow">THE WRITER'S DESK</p>

          <h1>Welcome back.</h1>

          <p className="login-description">
            A quiet space for your thoughts, stories, and everything
            worth putting into words.
          </p>

          <form className="login-form" onSubmit={handleLogin}>
            <label className="login-field">
              <span>Username</span>
              <input
                type="text"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Enter your username"
                autoComplete="username"
                required
              />
            </label>

            <label className="login-field">
              <span>Password</span>

              <div className="login-password-wrapper">
                <LockKeyhole size={16} />

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword((previous) => !previous)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </label>

            {error && (
              <p className="login-error" role="alert">
                {error}
              </p>
            )}

            <button className="login-submit" type="submit">
              Enter your writing desk
            </button>
          </form>

          <div className="login-divider">
            <span />
            <Feather size={14} />
            <span />
          </div>

          <p className="login-quote">
            "Some things are better written down."
          </p>
        </section>

        <footer className="login-footer">
          AN IDIOTS POV · MADE OF WORDS, MOMENTS AND MEANING
        </footer>
      </main>
    </div>
  );
}
