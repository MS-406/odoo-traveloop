// frontend/src/components/layout/Navbar.tsx
// Global navigation bar — persistent across all protected routes.
import { Link, useLocation } from "react-router-dom";
import { Home, Map, Globe, Compass, Settings, Shield, LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { useAuthStore } from "@/stores/authStore";

export default function Navbar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { to: "/dashboard", label: "Home", icon: Home },
    { to: "/trips", label: "Trips", icon: Map },
    { to: "/cities", label: "Cities", icon: Globe },
    { to: "/activities", label: "Activities", icon: Compass },
  ];

  const isActive = (path: string) => location.pathname === path || (path !== "/dashboard" && location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-surface-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold gradient-text">🌍 Traveloop</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(link.to) ? "bg-primary/10 text-primary" : "text-text-secondary hover:text-text-primary hover:bg-surface"}`}>
                <link.icon className="h-4 w-4" />{link.label}
              </Link>
            ))}
          </div>

          {/* Right side */}
          <div className="hidden md:flex items-center gap-2">
            {user?.is_admin && (
              <Link to="/admin" className={`p-2 rounded-lg transition-colors ${isActive("/admin") ? "text-danger bg-danger/10" : "text-text-muted hover:text-danger hover:bg-danger/5"}`} title="Admin">
                <Shield className="h-4 w-4" />
              </Link>
            )}
            <Link to="/settings" className={`p-2 rounded-lg transition-colors ${isActive("/settings") ? "text-primary bg-primary/10" : "text-text-muted hover:text-text-secondary hover:bg-surface"}`} title="Settings">
              <Settings className="h-4 w-4" />
            </Link>
            <div className="w-px h-6 bg-surface-border mx-1" />
            <span className="text-sm text-text-secondary">{user?.full_name?.split(" ")[0]}</span>
            <button onClick={() => logout()} className="p-2 rounded-lg text-text-muted hover:text-danger hover:bg-danger/5 transition-colors" title="Sign out">
              <LogOut className="h-4 w-4" />
            </button>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden p-2 rounded-lg hover:bg-surface transition-colors">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-surface-border bg-white/95 backdrop-blur-lg">
          <div className="px-4 py-3 space-y-1">
            {links.map((link) => (
              <Link key={link.to} to={link.to} onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive(link.to) ? "bg-primary/10 text-primary" : "text-text-secondary"}`}>
                <link.icon className="h-4 w-4" />{link.label}
              </Link>
            ))}
            <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary"><Settings className="h-4 w-4" />Settings</Link>
            {user?.is_admin && <Link to="/admin" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-danger"><Shield className="h-4 w-4" />Admin</Link>}
            <button onClick={() => { logout(); setMobileOpen(false); }} className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-danger w-full"><LogOut className="h-4 w-4" />Sign Out</button>
          </div>
        </div>
      )}
    </nav>
  );
}
