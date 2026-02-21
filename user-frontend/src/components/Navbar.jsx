import { useState } from "react";
import { NavLink } from "react-router-dom";
import { logout } from "../auth/authService";

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <header className="border-b border-solid border-slate-200 bg-white sticky top-0 z-40">
      <div className="flex items-center justify-between px-4 sm:px-6 md:px-10 py-3 sm:py-4">
        <div className="flex items-center gap-3 text-primary">
          <div className="w-7 h-7 sm:w-8 sm:h-8">
            <svg
              fill="none"
              viewBox="0 0 48 48"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                clipRule="evenodd"
                d="M12.0799 24L4 19.2479L9.95537 8.75216L18.04 13.4961L18.0446 4H29.9554L29.96 13.4961L38.0446 8.75216L44 19.2479L35.92 24L44 28.7521L38.0446 39.2479L29.96 34.5039L29.9554 44H18.0446L18.04 34.5039L9.95537 39.2479L4 28.7521L12.0799 24Z"
                fill="currentColor"
                fillRule="evenodd"
              ></path>
            </svg>
          </div>
          <div>
            <h1 className="text-primary text-base sm:text-lg font-bold tracking-tight">
              Bus Pass Portal
            </h1>
            <p className="text-slate-500 text-xs hidden sm:block">User Dashboard</p>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden sm:flex items-center gap-4">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-700 hover:text-primary'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            className={({ isActive }) =>
              `text-sm font-semibold ${isActive ? 'text-primary border-b-2 border-primary pb-1' : 'text-slate-700 hover:text-primary'}`
            }
          >
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span>Logout</span>
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="sm:hidden flex items-center justify-center w-10 h-10 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors"
        >
          <span className="material-symbols-outlined text-2xl">
            {menuOpen ? 'close' : 'menu'}
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="sm:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2">
          <NavLink
            to="/dashboard"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/profile"
            onClick={() => setMenuOpen(false)}
            className={({ isActive }) =>
              `block px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors ${isActive ? 'bg-primary/10 text-primary' : 'text-slate-700 hover:bg-slate-100'}`
            }
          >
            Profile
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors"
          >
            <span>Logout</span>
            <span className="material-symbols-outlined text-lg">logout</span>
          </button>
        </div>
      )}
    </header>
  );
};

export default Navbar;
