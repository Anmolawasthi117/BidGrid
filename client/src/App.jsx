import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import About from "./pages/About";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import VendorsPage from "./pages/VendorsPage";
import CreateRFPPage from "./pages/CreateRFPPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { checkAuth } from "./store/slices/authSlice";

function App() {
  const dispatch = useDispatch();
  const { checkingAuth } = useSelector((state) => state.auth);

  // Check auth status on app load
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  // Show loading while checking auth
  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/about" element={<About />} />
        
        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/vendors"
          element={
            <ProtectedRoute>
              <VendorsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rfps/create"
          element={
            <ProtectedRoute>
              <CreateRFPPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

export default App;


