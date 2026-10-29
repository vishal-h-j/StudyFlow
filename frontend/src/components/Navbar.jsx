import { Link, NavLink, useNavigate } from "react-router-dom";
import { BookOpen } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function signOut() {
    logout();
    navigate("/");
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="brand"><span className="brand-icon"><BookOpen size={21} /></span>Study<span>Flow</span></Link>
        <nav className="nav-links" aria-label="Main navigation">
          <NavLink to="/dashboard">Dashboard</NavLink>
          <NavLink to="/courses">Courses</NavLink>
          {user ? (
            <>
              <NavLink to="/settings">Settings</NavLink>
              <button className="nav-login" onClick={signOut}>Log out</button>
            </>
          ) : (
            <>
              <NavLink to="/login">Login</NavLink>
              <NavLink to="/settings">Settings</NavLink>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}