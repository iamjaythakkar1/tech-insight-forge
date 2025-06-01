
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Menu, X, PenTool, User, LogIn, LogOut, Settings } from "lucide-react";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, isAdmin, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-slate-800 dark:text-white">
            <PenTool className="h-6 w-6 text-blue-600" />
            TechInsight Forge
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
              Home
            </Link>
            <Link to="/categories" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
              Categories
            </Link>
            <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
              About
            </Link>
            <Link to="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
              Contact
            </Link>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            {user ? (
              <div className="flex items-center gap-2">
                {isAdmin && (
                  <Button asChild variant="outline">
                    <Link to="/dashboard">
                      <Settings className="h-4 w-4 mr-2" />
                      Dashboard
                    </Link>
                  </Button>
                )}
                <Button onClick={handleSignOut} variant="outline">
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Button asChild variant="outline">
                <Link to="/auth">
                  <LogIn className="h-4 w-4 mr-2" />
                  Login
                </Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-col gap-4 pt-4">
              <Link to="/" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Home
              </Link>
              <Link to="/categories" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Categories
              </Link>
              <Link to="/about" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-slate-600 dark:text-slate-300 hover:text-blue-600 transition-colors">
                Contact
              </Link>
              {user ? (
                <div className="flex flex-col gap-2">
                  {isAdmin && (
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/dashboard">
                        <Settings className="h-4 w-4 mr-2" />
                        Dashboard
                      </Link>
                    </Button>
                  )}
                  <Button onClick={handleSignOut} variant="outline" className="w-full justify-start">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              ) : (
                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Link>
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
