import React, { useState, useEffect } from "react";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import PatientDashboard from "./components/PatientDashboard";
import DoctorDashboard from "./components/DoctorDashboard";
import AdminDashboard from "./components/AdminDashboard";
import { Activity, LogOut, Menu, X, User } from "lucide-react";

export default function App() {
  const [currentPage, setCurrentPage] = useState("landing");
  const [user, setUser] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const savedUser = localStorage.getItem("triage_session");
    if (savedUser) {
      const parsed = JSON.parse(savedUser);
      setUser(parsed);
      if (parsed.role === "patient") setCurrentPage("patient");
      else if (parsed.role === "doctor") setCurrentPage("doctor");
      else if (parsed.role === "admin") setCurrentPage("admin");
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("triage_session", JSON.stringify(userData));
    if (userData.role === "patient") setCurrentPage("patient");
    else if (userData.role === "doctor") setCurrentPage("doctor");
    else if (userData.role === "admin") setCurrentPage("admin");
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("triage_session");
    setCurrentPage("landing");
    setMobileMenuOpen(false);
  };

  const navigateTo = (page) => {
    setCurrentPage(page);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-hospital-bg text-hospital-body flex flex-col font-sans">

      {/* Global Navigation Bar */}
    {currentPage !== "landing" && (
      <nav className="bg-white border-b border-hospital-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">

            {/* Left: Logo + Desktop Nav */}
            <div className="flex items-center">
              <div
                onClick={() => navigateTo("landing")}
                className="flex-shrink-0 flex items-center gap-2 cursor-pointer select-none"
              >
                <div className="h-9 w-9 rounded-lg bg-blue-50 text-hospital-primary flex items-center justify-center border border-blue-100">
                  <Activity className="w-5.5 h-5.5 animate-pulse text-hospital-primary" />
                </div>
                <span className="font-extrabold text-lg text-hospital-heading tracking-tight">
                  SmartTriage<span className="text-hospital-accent font-semibold">AI</span>
                </span>
              </div>

              {/* Desktop Nav Items */}
              <div className="hidden md:flex ml-10 space-x-6 h-full items-center">
                <button
                  onClick={() => navigateTo("landing")}
                  className={`inline-flex items-center h-full px-1 border-b-2 text-sm font-semibold transition-all cursor-pointer ${currentPage === "landing"
                    ? "border-hospital-primary text-hospital-primary"
                    : "border-transparent text-hospital-subtext hover:text-hospital-body hover:border-slate-200"
                    }`}
                >
                  Home
                </button>

                {/* Patient Form — visible to patients and logged out users */}
                {(user?.role === "patient") && (
                  <button
                    onClick={() => navigateTo("patient")}
                    className={`inline-flex items-center h-full px-1 border-b-2 text-sm font-semibold transition-all cursor-pointer ${currentPage === "patient"
                      ? "border-hospital-primary text-hospital-primary"
                      : "border-transparent text-hospital-subtext hover:text-hospital-body hover:border-slate-200"
                      }`}
                  >
                    Patient Form
                  </button>
                )}

                {/* Doctor Board — visible to doctors only */}
                {user?.role === "doctor" && (
                  <button
                    onClick={() => navigateTo("doctor")}
                    className={`inline-flex items-center h-full px-1 border-b-2 text-sm font-semibold transition-all cursor-pointer ${currentPage === "doctor"
                      ? "border-hospital-primary text-hospital-primary"
                      : "border-transparent text-hospital-subtext hover:text-hospital-body hover:border-slate-200"
                      }`}
                  >
                    Doctor Board
                  </button>
                )}

                {/* Admin Center — visible to admins only */}
                {user?.role === "admin" && (
                  <button
                    onClick={() => navigateTo("admin")}
                    className={`inline-flex items-center h-full px-1 border-b-2 text-sm font-semibold transition-all cursor-pointer ${currentPage === "admin"
                      ? "border-hospital-primary text-hospital-primary"
                      : "border-transparent text-hospital-subtext hover:text-hospital-body hover:border-slate-200"
                      }`}
                  >
                    Admin Center
                  </button>
                )}
              </div>
            </div>

            {/* Right: Auth / Profile */}
            <div className="hidden md:flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-hospital-border rounded-lg text-xs font-semibold">
                    <User className="w-3.5 h-3.5 text-hospital-accent" />
                    <span className="text-hospital-heading">{user.name}</span>
                    <span className="text-hospital-subtext capitalize">({user.role})</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1 text-xs font-bold text-red-600 hover:text-red-800 transition-colors border border-red-200 hover:border-red-300 bg-red-50/50 hover:bg-red-50 px-2.5 py-1.5 rounded-lg cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigateTo("login")}
                  className="px-5 py-2 bg-hospital-primary hover:bg-hospital-hover text-white text-sm font-bold rounded-lg shadow-sm hover:shadow transition-all cursor-pointer"
                >
                  Login Portal
                </button>
              )}
            </div>

            {/* Mobile menu toggle */}
            <div className="flex items-center md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-hospital-body hover:text-hospital-primary focus:outline-none p-2 rounded-lg border border-hospital-border"
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-hospital-border bg-white px-4 pt-2 pb-4 space-y-2.5 shadow-md">
            <button
              onClick={() => navigateTo("landing")}
              className={`block w-full text-left px-3 py-2 rounded-md text-sm font-semibold ${currentPage === "landing" ? "bg-blue-50 text-hospital-primary" : "text-hospital-body hover:bg-slate-50"
                }`}
            >
              Home
            </button>

            {(user?.role === "patient") && (
              <button
                onClick={() => navigateTo("patient")}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-semibold ${currentPage === "patient" ? "bg-blue-50 text-hospital-primary" : "text-hospital-body hover:bg-slate-50"
                  }`}
              >
                Patient Form
              </button>
            )}

            {user?.role === "doctor" && (
              <button
                onClick={() => navigateTo("doctor")}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-semibold ${currentPage === "doctor" ? "bg-blue-50 text-hospital-primary" : "text-hospital-body hover:bg-slate-50"
                  }`}
              >
                Doctor Board
              </button>
            )}

            {user?.role === "admin" && (
              <button
                onClick={() => navigateTo("admin")}
                className={`block w-full text-left px-3 py-2 rounded-md text-sm font-semibold ${currentPage === "admin" ? "bg-blue-50 text-hospital-primary" : "text-hospital-body hover:bg-slate-50"
                  }`}
              >
                Admin Center
              </button>
            )}

            <div className="border-t border-hospital-border pt-3 mt-1.5">
              {user ? (
                <div className="space-y-2">
                  <div className="px-3 py-1.5 bg-slate-50 border border-hospital-border rounded-lg text-xs font-semibold flex items-center justify-between">
                    <span className="text-hospital-heading">{user.name}</span>
                    <span className="text-hospital-subtext capitalize">{user.role}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full py-2 bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold rounded-lg border border-red-200 flex items-center justify-center gap-1.5"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => navigateTo("login")}
                  className="w-full py-2.5 bg-hospital-primary hover:bg-hospital-hover text-white text-sm font-bold rounded-lg shadow text-center block"
                >
                  Login Portal
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    )}

      {/* Main Content */}
      <main className="flex-grow">
        {currentPage === "landing" && <LandingPage onNavigate={navigateTo} />}
        {currentPage === "login" && <LoginPage onLogin={handleLogin} onNavigate={navigateTo} />}
        {currentPage === "patient" && <PatientDashboard user={user} />}
        {currentPage === "doctor" && <DoctorDashboard user={user} />}
        {currentPage === "admin" && <AdminDashboard />}
      </main>
    </div>
  );
}