import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import logo from "../assets/zdotapps.png";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const { signIn, register, status, user } = useAuth();

  const [mode, setMode] = useState("login"); // "login" | "register"
  const [passwordVisible, setPasswordVisible] = useState(false);

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirm, setRegConfirm] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (status === "ready" && user) {
      navigate("/landing", { replace: true });
    }
  }, [navigate, status, user]);

  function switchMode(newMode) {
    setMode(newMode);
    setErrorMessage("");
    setInfoMessage("");
  }

  async function onLoginSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage("");
    setSubmitting(true);

    try {
      await signIn({ username, password });
      navigate("/landing");
    } catch (err) {
      setErrorMessage(err?.message || "Login failed");
    } finally {
      setSubmitting(false);
    }
  }

  async function onRegisterSubmit(e) {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage("");
    setInfoMessage("");

    if (!regName.trim()) {
      setErrorMessage("Name is required.");
      return;
    }
    if (!regEmail.trim() && !regPhone.trim()) {
      setErrorMessage("Email or phone number is required.");
      return;
    }
    if (regPassword.length < 4) {
      setErrorMessage("Password must be at least 4 characters.");
      return;
    }
    if (regPassword !== regConfirm) {
      setErrorMessage("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      await register({
        name: regName.trim(),
        email: regEmail.trim(),
        phone: regPhone.trim(),
        password: regPassword,
      });
      navigate("/landing");
    } catch (err) {
      setErrorMessage(err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login-page-wrapper">
      <div className="glass-panel">
        <div className="glass-content">
          <div className="logo">
            <img src={logo} alt="ZDrive" height="120" />
          </div>

          {/* Tab switcher */}
          <div className="auth-tabs">
            <button
              type="button"
              className={`auth-tab ${mode === "login" ? "active" : ""}`}
              onClick={() => switchMode("login")}
            >
              Login
            </button>
            <button
              type="button"
              className={`auth-tab ${mode === "register" ? "active" : ""}`}
              onClick={() => switchMode("register")}
            >
              Register
            </button>
          </div>

          {errorMessage ? (
            <div className="text-danger mb-2">{errorMessage}</div>
          ) : null}

          {infoMessage ? (
            <div className="text-success mb-2">{infoMessage}</div>
          ) : null}

          {/* ====== LOGIN FORM ====== */}
          {mode === "login" && (
            <form id="loginForm" onSubmit={onLoginSubmit}>
              <div className="field">
                <label>Email or Phone</label>
                <input
                  type="text"
                  name="username"
                  autoComplete="username"
                  placeholder="Enter email or phone"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage("");
                  }}
                />
              </div>

              <div className="field password">
                <label>Password</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <i
                  className={`bi ${passwordVisible ? "bi-eye-slash" : "bi-eye"} password-eye`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPasswordVisible((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setPasswordVisible((v) => !v);
                  }}
                />
              </div>

              <button className="login-btn" type="submit" disabled={submitting}>
                {submitting ? "Logging in..." : "Login"}
              </button>
            </form>
          )}

          {/* ====== REGISTER FORM ====== */}
          {mode === "register" && (
            <form id="registerForm" onSubmit={onRegisterSubmit}>
              <div className="field">
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Enter your name"
                  value={regName}
                  onChange={(e) => {
                    setRegName(e.target.value);
                    setErrorMessage("");
                  }}
                />
              </div>

              <div className="field">
                <label>Email</label>
                <input
                  type="email"
                  placeholder="Enter email"
                  autoComplete="email"
                  value={regEmail}
                  onChange={(e) => {
                    setRegEmail(e.target.value);
                    setErrorMessage("");
                  }}
                />
              </div>

              <div className="field">
                <label>Phone Number</label>
                <input
                  type="tel"
                  placeholder="Enter phone number"
                  autoComplete="tel"
                  value={regPhone}
                  onChange={(e) => {
                    setRegPhone(e.target.value);
                    setErrorMessage("");
                  }}
                />
              </div>

              <div className="field password">
                <label>Password</label>
                <input
                  type={passwordVisible ? "text" : "password"}
                  placeholder="Create a password"
                  autoComplete="new-password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                />
                <i
                  className={`bi ${passwordVisible ? "bi-eye-slash" : "bi-eye"} password-eye`}
                  role="button"
                  tabIndex={0}
                  onClick={() => setPasswordVisible((v) => !v)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setPasswordVisible((v) => !v);
                  }}
                />
              </div>

              <div className="field">
                <label>Confirm Password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  autoComplete="new-password"
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                />
              </div>

              <button className="login-btn" type="submit" disabled={submitting}>
                {submitting ? "Registering..." : "Register"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
