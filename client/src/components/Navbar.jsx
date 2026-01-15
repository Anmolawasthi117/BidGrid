import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutUser } from "../store/slices/authSlice";
import { motion } from "framer-motion";
import { Menu, X, LayoutDashboard, Users, LogOut, User } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

function Navbar() {
  const { pathname } = useLocation();
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Don't show navbar on landing page - it has its own integrated navigation
  const isLandingPage = pathname === "/";
  
  if (isLandingPage && !user) {
    return (
      <nav className="absolute top-0 left-0 right-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl font-bold text-slate-900">
            Bid<span className="text-emerald-500">Grid</span>
          </Link>
          <div className="flex gap-4 items-center">
            <Link to="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <motion.nav 
      className="bg-white/95 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-slate-100"
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link to={user ? "/dashboard" : "/"} className="text-2xl font-bold text-slate-900">
          Bid<span className="text-emerald-500">Grid</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex gap-6 items-center">
          {user ? (
            <>
              <Link
                to="/dashboard"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === "/dashboard" 
                    ? "text-emerald-600" 
                    : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <Link
                to="/vendors"
                className={`flex items-center gap-2 text-sm font-medium transition-colors ${
                  pathname === "/vendors" 
                    ? "text-emerald-600" 
                    : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                <Users className="w-4 h-4" />
                My Vendors
              </Link>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-emerald-600" />
                  </div>
                  <span className="font-medium">{user.username || user.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => dispatch(logoutUser())}
                  className="text-slate-500 hover:text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <>
              <Link
                to="/about"
                className={`text-sm font-medium transition-colors ${
                  pathname === "/about" 
                    ? "text-emerald-600" 
                    : "text-slate-600 hover:text-emerald-600"
                }`}
              >
                About
              </Link>
              <Link to="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-6 h-6 text-slate-600" />
          ) : (
            <Menu className="w-6 h-6 text-slate-600" />
          )}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          className="md:hidden border-t border-slate-100 bg-white py-4 px-6"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex flex-col gap-4">
            {user ? (
              <>
                <Link
                  to="/dashboard"
                  className="flex items-center gap-2 text-sm font-medium text-slate-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Link>
                <Link
                  to="/vendors"
                  className="flex items-center gap-2 text-sm font-medium text-slate-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Users className="w-4 h-4" />
                  My Vendors
                </Link>
                <button
                  onClick={() => {
                    dispatch(logoutUser());
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-2 text-sm font-medium text-red-600"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/about"
                  className="text-sm font-medium text-slate-600"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="ghost" className="w-full">Sign In</Button>
                </Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
}

export default Navbar;
