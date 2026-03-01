import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    navigate("/");
  };

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => setMenuOpen(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        airbnb
      </Link>
      <div className="navbar-search-pill">
        <span className="navbar-search-label">Anywhere</span>
        <span className="navbar-search-divider" />
        <span className="navbar-search-label">Any week</span>
        <span className="navbar-search-divider" />
        <span className="navbar-search-value">Add guests</span>
      </div>
      <div className="navbar-right">
        {user ? (
          <>
            <Link to="/dashboard" className="navbar-link">
              Become a Host
            </Link>
            <div className="navbar-user-wrap">
              <button
                type="button"
                className="navbar-menu-btn"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
                aria-label="Menu"
              >
                <span className="navbar-hamburger">☰</span>
              </button>
              <span className="navbar-username">{user.username}</span>
              <button
                type="button"
                className="navbar-profile-btn"
                aria-label="Profile"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(!menuOpen); }}
              >
                <span className="navbar-avatar">👤</span>
              </button>
              {menuOpen && (
                <div className="navbar-dropdown" onClick={(e) => e.stopPropagation()}>
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
                  <button type="button" onClick={handleLogout}>Log out</button>
                </div>
              )}
            </div>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-link">
              Log in
            </Link>
            <Link
              to="/register"
              className="airbnb-btn airbnb-btn-primary"
              style={{ textDecoration: "none" }}
            >
              Sign up
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
