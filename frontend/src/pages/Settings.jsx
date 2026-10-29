import { Moon, Sun, Monitor, CheckCircle2, ShieldCheck, Palette } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  return <main className="page-container settings-page">
    <div className="page-heading"><span className="eyebrow">PERSONALIZE YOUR SPACE</span><h1>Settings</h1><p>Make StudyFlow feel right for you. Your theme preference is saved on this device.</p></div>
    <section className="settings-card settings-profile">
      <div className="settings-section-title"><span className="settings-section-icon"><ShieldCheck size={21}/></span><div><h2>Account information</h2><p>Your profile and access level</p></div></div>
      {user ? <div className="settings-list"><div><span>Full name</span><strong>{user.name}</strong></div><div><span>Email address</span><strong>{user.email}</strong></div><div><span>Account role</span><strong><span className="role-pill">{user.role}</span></strong></div></div> : <div className="guest-panel"><p>You are browsing as a guest. Sign in to access your personalized dashboard and role-based tools.</p><Link className="primary-button" to="/login">Sign in to StudyFlow</Link></div>}
    </section>
    <section className="settings-card theme-settings">
      <div className="settings-section-title"><span className="settings-section-icon"><Palette size={21}/></span><div><h2>Appearance</h2><p>Choose how StudyFlow looks across every page</p></div></div>
      <div className="theme-options" role="radiogroup" aria-label="Choose theme">
        <button type="button" className={`theme-option ${theme === "light" ? "selected" : ""}`} onClick={() => setTheme("light")} role="radio" aria-checked={theme === "light"}>
          <span className="theme-preview light-preview"><Sun size={24}/><span/><span/><span/></span><span className="theme-option-label"><strong>Light</strong><small>Bright, clean, and clear</small></span>{theme === "light" && <CheckCircle2 className="theme-check" size={19}/>}
        </button>
        <button type="button" className={`theme-option ${theme === "dark" ? "selected" : ""}`} onClick={() => setTheme("dark")} role="radio" aria-checked={theme === "dark"}>
          <span className="theme-preview dark-preview"><Moon size={24}/><span/><span/><span/></span><span className="theme-option-label"><strong>Dark</strong><small>Easy on the eyes at night</small></span>{theme === "dark" && <CheckCircle2 className="theme-check" size={19}/>}
        </button>
        <button type="button" className={`theme-option ${theme === "system" ? "selected" : ""}`} onClick={() => setTheme("system")} role="radio" aria-checked={theme === "system"}>
          <span className="theme-preview system-preview"><Monitor size={24}/><span/><span/><span/></span><span className="theme-option-label"><strong>System</strong><small>Follow your device setting</small></span>{theme === "system" && <CheckCircle2 className="theme-check" size={19}/>}
        </button>
      </div>
      <p className="settings-footnote">Your selection is saved automatically and applies to the dashboard, courses, study materials, login, and settings pages.</p>
    </section>
  </main>;
}
