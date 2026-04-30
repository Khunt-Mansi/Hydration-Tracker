import { useState } from "react";
import { Droplets, Lock, UserRound, UserPlus } from "lucide-react";
import { signInWithUsername, signUpWithUsername } from "../services/authService";

export default function AuthPage({ onAuthSuccess }) {
  const [mode, setMode] = useState("signup");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      if (mode === "signup") {
        await signUpWithUsername(username.trim(), password);
        setMessage("Account created. Now login with the same username and password.");
        setMode("login");
        setPassword("");
        return;
      }

      await signInWithUsername(username.trim(), password);
      await onAuthSuccess();
    } catch (error) {
      const msg = error?.message || "Unable to continue.";
      if (msg.toLowerCase().includes("already registered") || msg.toLowerCase().includes("already been registered")) {
        setMessage("This username is already created. Please login instead.");
        setMode("login");
      } else if (msg.toLowerCase().includes("connect to supabase")) {
        setMessage(msg);
      } else {
        setMessage(mode === "signup" ? "Unable to create account. Try another username or password." : "Invalid username or password.");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-card compact-auth-card">
        <div className="auth-visual clean-auth-visual">
          <div className="auth-top-row center-auth-brand">
            <div className="hero-orb"><Droplets size={50} /></div>
          </div>
          <h1>Drashti’s Hydration</h1>
          <p className="auth-tagline">A cute daily water tracker made for healthy streaks.</p>
        </div>

        <form className="login-panel" onSubmit={handleSubmit}>
          <div>
            <p className="eyebrow">{mode === "signup" ? "Create your tracker" : "Welcome back"}</p>
            <h2>{mode === "signup" ? "Sign up" : "Login"}</h2>
          </div>

          <div className="auth-tabs" role="tablist" aria-label="Auth mode">
            <button
              type="button"
              className={mode === "signup" ? "active" : ""}
              onClick={() => { setMode("signup"); setMessage(""); }}
            >
              Sign up
            </button>
            <button
              type="button"
              className={mode === "login" ? "active" : ""}
              onClick={() => { setMode("login"); setMessage(""); }}
            >
              Login
            </button>
          </div>

          <label className="field">
            <span>Username</span>
            <div className="input-wrap">
              <UserRound size={18} />
              <input
                type="text"
                placeholder="Choose username"
                autoComplete="username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
            </div>
          </label>

          <label className="field">
            <span>Password</span>
            <div className="input-wrap">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Enter password"
                autoComplete={mode === "signup" ? "new-password" : "current-password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={6}
                required
              />
            </div>
          </label>

          {message && <div className={`form-message ${message.includes("created") ? "success-message" : "error-message"}`}>{message}</div>}

          <button className="primary-button" type="submit" disabled={busy}>
            {busy ? "Please wait..." : mode === "signup" ? <><UserPlus size={18} /> Sign up</> : "Login"}
          </button>

          <p className="auth-switch-text">
            {mode === "signup" ? "Already signed up?" : "New here?"}{" "}
            <button
              type="button"
              onClick={() => { setMode(mode === "signup" ? "login" : "signup"); setMessage(""); }}
            >
              {mode === "signup" ? "Login" : "Create account"}
            </button>
          </p>
        </form>
      </section>
    </main>
  );
}
