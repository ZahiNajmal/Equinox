// client/src/components/Navbar.jsx
import { NavLink, useNavigate } from "react-router-dom";
import { ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { useState, useEffect } from "react";
import EquinoxLogo from "./Equinox.png"; // Import the logo

export default function Navbar({ user }) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleEscape = (e) => e.key === "Escape" && setMobileOpen(false);
    if (mobileOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [mobileOpen]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/signin");
  };

  const links = [
    { to: "/", label: "Dashboard" },
    { to: "/prisma", label: "Prisma" },
    { to: "/mentor", label: "Mentor" },
    { to: "/atlas", label: "Atlas" },
    { to: "/insight", label: "Insight" },
    { to: "/codex", label: "Codex" },
    { to: "/sdg", label: "SDG" },
    { to: "/vault", label: "Vault" },
    { to: "/quiz", label: "Quiz" },
  ];

  return (
    <>
      {/* Navbar */}
      <nav
        className={`bg-gradient-to-r from-orange-500 via-purple-600 to-blue-500 text-white shadow-2xl sticky top-0 z-50 transition-all duration-300 ${
          scrolled ? "py-3 shadow-xl" : "py-4"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4">
          {/* Logo and Hamburger */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 active:scale-95"
              aria-label="Toggle navigation"
              aria-expanded={mobileOpen}
            >
              <Bars3Icon className="w-6 h-6" />
            </button>
            <img src={EquinoxLogo} alt="Equinox Logo" style={{ height: "55px"}} />
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-2 lg:gap-3">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `relative px-3 py-2 rounded-lg transition-all duration-200 text-sm lg:text-base font-medium ${
                    isActive
                      ? "bg-white/25 text-white shadow-lg"
                      : "hover:bg-white/15 text-white/90 hover:text-white"
                  }`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </div>

          {/* Desktop Logout Button */}
          <button
            onClick={handleLogout}
            className="hidden md:inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg font-semibold text-sm lg:text-base transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </nav>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300 ${
          mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-gradient-to-b from-orange-500 via-purple-600 to-blue-500 shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <img src={EquinoxLogo} alt="Equinox Logo" className="h-10 w-auto" />
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/50 transition-all duration-200 active:scale-95"
            aria-label="Close navigation"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* User Info */}
        {user && (
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 via-purple-500 to-blue-400 flex items-center justify-center text-lg font-bold">
                {user.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div>
                <p className="font-semibold text-white">{user.username || "User"}</p>
                <p className="text-xs text-white/70">{user.email || ""}</p>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Links */}
        <div className="px-4 py-4 space-y-1 overflow-y-auto max-h-[calc(100vh-250px)]">
          {links.map((l, idx) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `block px-4 py-3 rounded-lg transition-all duration-200 font-medium transform ${
                  isActive
                    ? "bg-white/20 text-white shadow-lg scale-105"
                    : "hover:bg-white/10 text-white/90 hover:text-white hover:translate-x-1"
                }`
              }
              onClick={() => setMobileOpen(false)}
              style={{
                animation: mobileOpen ? `slideIn 0.3s ease-out ${idx * 0.05}s both` : "none",
              }}
            >
              {l.label}
            </NavLink>
          ))}
        </div>

        {/* Logout Button */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gradient-to-t from-black/20">
          <button
            onClick={() => {
              setMobileOpen(false);
              handleLogout();
            }}
            className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 px-4 py-3 rounded-lg font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>
      </div>

      {/* Animation Keyframes */}
      <style>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}