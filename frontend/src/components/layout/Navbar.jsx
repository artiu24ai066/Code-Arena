import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../stores/AuthContext.jsx";

function Navbar() {
  const navigate = useNavigate();
  const { isAuthenticated, role, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? "bg-accent-primary/10 text-accent-primary"
        : "text-text-secondary hover:bg-white/5 hover:text-text-primary"
    }`;

  return (
    <nav className="sticky top-0 z-30 border-b border-border-subtle/80 bg-[#0D1117]/95 shadow-lg shadow-black/10 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="group inline-flex items-center gap-3 rounded-xl">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-accent-primary/30 bg-accent-primary/10 font-display text-sm font-bold text-accent-primary transition group-hover:border-accent-primary/60 group-hover:bg-accent-primary/15">
            {"</>"}
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-text-primary transition group-hover:text-accent-primary sm:text-lg">
            Code Arena
          </span>
        </Link>

        <div className="flex flex-wrap items-center gap-1">
          <NavLink to="/" end className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/problems" className={navLinkClass}>
            Problems
          </NavLink>
          {isAuthenticated ? (
            <>
              {role === "admin" ? (
                <NavLink to="/admin" className={navLinkClass}>
                  Admin
                </NavLink>
              ) : null}
              <NavLink to="/submissions" className={navLinkClass}>
                Submissions
              </NavLink>
              <NavLink to="/profile" className={navLinkClass}>
                Profile
              </NavLink>
              <button
                type="button"
                onClick={handleLogout}
                className="ml-1 rounded-lg border border-border-subtle/80 px-3 py-2 text-sm font-medium text-text-secondary transition hover:border-verdict-wrong/50 hover:bg-verdict-wrong/10 hover:text-verdict-wrong"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={navLinkClass}>
                Login
              </NavLink>
              <NavLink
                to="/register"
                className="ml-1 rounded-lg bg-accent-primary px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-accent-primary/20 transition hover:bg-accent-primary-hover"
              >
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

export default Navbar;