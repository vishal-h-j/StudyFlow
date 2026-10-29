
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  Layers3
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (mode === "login") {
        await login(email, password);
      } else {
        await register(name, email, password);
      }

      navigate(location.state?.from || "/dashboard", {
        replace: true
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (err.code === "ERR_NETWORK"
            ? "The StudyFlow API is not reachable. Start the backend with npm run dev from the project root, then check http://localhost:5001/api/health."
            : "Unable to continue. Please check your details and try again.")
      );
    } finally {
      setBusy(false);
    }
  }

  function switchMode() {
    setMode(current => current === "login" ? "register" : "login");
    setError("");
  }

  return (
    <main className="auth-page auth-page-modern">
      <div className="auth-layout">
        <section className="auth-showcase">
          <Link to="/" className="auth-showcase-brand">
            <span className="auth-showcase-logo">
              <BookOpen size={25} />
            </span>
            <span>Study<span className="auth-brand-accent">Flow</span></span>
          </Link>

          <div className="auth-showcase-content">
            <span className="auth-showcase-kicker">
              <Sparkles size={14} />
              YOUR LEARNING JOURNEY STARTS HERE
            </span>

            <h1>
              Learn smarter.
              <br />
              Grow <span>faster.</span>
            </h1>

            <p className="auth-showcase-description">
              One place for your courses, learning resources, and
              academic journey. Get organized and make every study
              session count.
            </p>

            <div className="auth-benefit-list">
              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  <BookOpen size={19} />
                </span>
                <div>
                  <strong>Your courses, organized</strong>
                  <p>Access your learning PDFs in one place.</p>
                </div>
                <CheckCircle2 size={18} className="auth-benefit-check" />
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  <Layers3 size={19} />
                </span>
                <div>
                  <strong>A focused learning space</strong>
                  <p>Keep your academic resources close at hand.</p>
                </div>
                <CheckCircle2 size={18} className="auth-benefit-check" />
              </div>

              <div className="auth-benefit">
                <span className="auth-benefit-icon">
                  <ShieldCheck size={19} />
                </span>
                <div>
                  <strong>Your personal account</strong>
                  <p>Sign in to access your StudyFlow dashboard.</p>
                </div>
                <CheckCircle2 size={18} className="auth-benefit-check" />
              </div>
            </div>
          </div>

          <div className="auth-showcase-bottom">
            <span><GraduationCap size={17} /> Built for your learning journey</span>
            <span>StudyFlow · Learn with purpose</span>
          </div>

          <div className="auth-decoration auth-decoration-one" />
          <div className="auth-decoration auth-decoration-two" />
        </section>

        <section className="auth-form-side">
          <div className="auth-form-top">
            <span className="auth-secure-label">
              <ShieldCheck size={16} />
              Secure student access
            </span>
            <Link to="/" className="auth-home-link">
              Back to home
            </Link>
          </div>

          <div className="auth-form-container">
            <div className="auth-form-heading">
              <span className="auth-form-icon">
                {mode === "login"
                  ? <BookOpen size={25} />
                  : <GraduationCap size={25} />}
              </span>

              <span className="eyebrow">
                {mode === "login" ? "WELCOME BACK" : "JOIN STUDYFLOW"}
              </span>

              <h2>
                {mode === "login"
                  ? "Sign in to StudyFlow"
                  : "Create your account"}
              </h2>

              <p>
                {mode === "login"
                  ? "Pick up where you left off. Your learning space is waiting."
                  : "Create your student account and start exploring your courses."}
              </p>
            </div>

            {error && (
              <div className="error-box" role="alert">
                {error}
              </div>
            )}

            <form className="auth-form" onSubmit={submit}>
              {mode === "register" && (
                <label>
                  Full name
                  <input
                    type="text"
                    value={name}
                    onChange={event => setName(event.target.value)}
                    placeholder="Enter your full name"
                    required
                    autoComplete="name"
                  />
                </label>
              )}

              <label>
                Email address
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  placeholder="you@example.com"
                  required
                  autoComplete="email"
                />
              </label>

              <label>
                Password
                <input
                  type="password"
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  placeholder={
                    mode === "login"
                      ? "Enter your password"
                      : "Create a password"
                  }
                  required
                  minLength={8}
                  autoComplete={
                    mode === "login"
                      ? "current-password"
                      : "new-password"
                  }
                />
              </label>

              {mode === "register" && (
                <p className="field-hint">
                  Use at least 8 characters. New registrations are student accounts.
                </p>
              )}

              <button
                className="primary-button full-button auth-submit-button"
                type="submit"
                disabled={busy}
              >
                {busy
                  ? "Please wait…"
                  : mode === "login"
                    ? "Sign in to your account"
                    : "Create student account"}
                {!busy && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-divider">
              <span />
              <small>YOUR LEARNING SPACE</small>
              <span />
            </div>

            <p className="auth-switch">
              {mode === "login"
                ? "New to StudyFlow?"
                : "Already have an account?"}
              <button type="button" onClick={switchMode}>
                {mode === "login"
                  ? "Create an account"
                  : "Sign in instead"}
              </button>
            </p>

            <div className="auth-form-footer">
              <ShieldCheck size={15} />
              Your learning journey, all in one place.
            </div>
          </div>

          <div className="auth-form-bottom">
            <span>© {new Date().getFullYear()} StudyFlow</span>
            <span>Learn at your own pace.</span>
          </div>
        </section>
      </div>
    </main>
  );
}
