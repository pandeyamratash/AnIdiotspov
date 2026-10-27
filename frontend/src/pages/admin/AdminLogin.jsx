
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Feather,
  LockKeyhole,
  Eye,
  EyeOff,
  UserRound,
  Mail,
  AtSign,
  UserPlus,
  LogIn,
} from "lucide-react";

import {
  getRegistrationStatus,
  registerAdmin,
  loginAdmin,
} from "../../api/auth";

import "../../styles/login.css";

export default function AdminLogin() {
  const navigate = useNavigate();

  const [mode, setMode] = useState("login");
  const [registrationOpen, setRegistrationOpen] = useState(false);
  const [checkingRegistration, setCheckingRegistration] = useState(true);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkRegistration() {
      try {
        const result = await getRegistrationStatus();

        if (!cancelled) {
          setRegistrationOpen(result.registration_open === true);
        }
      } catch {
        if (!cancelled) {
          setRegistrationOpen(false);
        }
      } finally {
        if (!cancelled) {
          setCheckingRegistration(false);
        }
      }
    }

    checkRegistration();

    return () => {
      cancelled = true;
    };
  }, []);

  function changeMode(nextMode) {
    setMode(nextMode);
    setError("");
    setSuccess("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  }

  async function handleLogin(event) {
    event.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      await loginAdmin(username.trim(), password);
      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to log in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!registrationOpen) {
      setError("Account creation is closed. An administrator account already exists.");
      return;
    }

    if (password.length < 12) {
      setError("Your password must contain at least 12 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Your passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await registerAdmin({
        full_name: fullName.trim(),
        username: username.trim(),
        email: email.trim().toLowerCase(),
        password,
      });

      // Registration creates the first account. Log in through the API
      // rather than trusting a frontend-only authentication flag.
      await loginAdmin(username.trim(), password);

      setSuccess("Your account has been created. Opening your writing desk...");

      navigate("/admin", { replace: true });
    } catch (err) {
      setError(err.message || "Unable to create your account.");
      setRegistrationOpen(false);
      // Refresh the server's registration state after a failed attempt.
      try {
        const result = await getRegistrationStatus();
        setRegistrationOpen(result.registration_open === true);
      } catch {
        // Keep the form's error visible if the server cannot be reached.
      }
    } finally {
      setLoading(false);
    }
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

          <h1>{mode === "login" ? "Welcome back." : "A space of your own."}</h1>

          <p className="login-description">
            {mode === "login"
              ? "A quiet space for your thoughts, stories, and everything worth putting into words."
              : "Create your administrator account and begin filling this space with stories."}
          </p>

          <div className="login-mode-switch" role="group" aria-label="Account options">
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => changeMode("login")}
            >
              <LogIn size={16} />
              Login
            </button>

            <button
              type="button"
              className={mode === "register" ? "active" : ""}
              onClick={() => changeMode("register")}
              disabled={checkingRegistration || !registrationOpen}
              title={
                !registrationOpen
                  ? "Registration is closed because an account already exists."
                  : "Create your first administrator account"
              }
            >
              <UserPlus size={16} />
              Create account
            </button>
          </div>

          {mode === "login" ? (
            <form className="login-form" onSubmit={handleLogin}>
              <label className="login-field">
                <span>Username or email</span>
                <input
                  type="text"
                  value={username}
                  onChange={(event) => setUsername(event.target.value)}
                  placeholder="Enter your username or email"
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

              {success && (
                <p className="login-success" role="status">
                  {success}
                </p>
              )}

              <button className="login-submit" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Enter your writing desk"}
              </button>
            </form>
          ) : (
            <form className="login-form" onSubmit={handleRegister}>
              <label className="login-field">
                <span>Full name</span>
                <div className="login-password-wrapper">
                  <UserRound size={16} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(event) => setFullName(event.target.value)}
                    placeholder="Your full name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={120}
                    required
                  />
                </div>
              </label>

              <label className="login-field">
                <span>Username</span>
                <div className="login-password-wrapper">
                  <AtSign size={16} />
                  <input
                    type="text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    placeholder="Choose a username"
                    autoComplete="username"
                    pattern="[a-zA-Z0-9_.\-]{3,40}"
                    title="Use 3–40 letters, numbers, dots, underscores, or hyphens."
                    minLength={3}
                    maxLength={40}
                    required
                  />
                </div>
              </label>

              <label className="login-field">
                <span>Email address</span>
                <div className="login-password-wrapper">
                  <Mail size={16} />
                  <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    maxLength={254}
                    required
                  />
                </div>
              </label>

              <label className="login-field">
                <span>Password</span>
                <div className="login-password-wrapper">
                  <LockKeyhole size={16} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="At least 12 characters"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
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

              <label className="login-field">
                <span>Confirm password</span>
                <div className="login-password-wrapper">
                  <LockKeyhole size={16} />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(event) => setConfirmPassword(event.target.value)}
                    placeholder="Enter your password again"
                    autoComplete="new-password"
                    minLength={12}
                    maxLength={128}
                    required
                  />
                  <button
                    type="button"
                    className="login-toggle-password"
                    onClick={() =>
                      setShowConfirmPassword((previous) => !previous)
                    }
                    aria-label={
                      showConfirmPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </label>

              {error && (
                <p className="login-error" role="alert">
                  {error}
                </p>
              )}

              {success && (
                <p className="login-success" role="status">
                  {success}
                </p>
              )}

              <p className="login-registration-note">
                This is a one-time setup. Once your first administrator
                account is created, public registration closes automatically.
              </p>

              <button
                className="login-submit"
                type="submit"
                disabled={loading || checkingRegistration || !registrationOpen}
              >
                {loading
                  ? "Creating account..."
                  : "Create your account"}
              </button>

              {!checkingRegistration && !registrationOpen && (
                <p className="login-error" role="status">
                  An account already exists, so registration is closed.
                  Please log in instead.
                </p>
              )}

              <button
                className="login-switch-back"
                type="button"
                onClick={() => changeMode("login")}
              >
                Already have an account? Log in
              </button>
            </form>
          )}

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