
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Menu, X, Home, Folder, Info, Mail, LayoutDashboard } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  const navigationItems = [
    { name: "Home", path: "/", icon: Home },
    { name: "Categories", path: "/categories", icon: Folder },
    { name: "About", path: "/about", icon: Info },
    { name: "Contact", path: "/contact", icon: Mail },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">TF</span>
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              TechInsight Forge
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.path)
                      ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                      : "text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <ThemeToggle />
            {user && (
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? "text-blue-600 bg-blue-50 dark:bg-blue-900/20"
                        : "text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
              {user && (
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 mt-2">
                  <Link
                    to="/dashboard"
                    className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:bg-slate-50 dark:hover:bg-slate-800"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
