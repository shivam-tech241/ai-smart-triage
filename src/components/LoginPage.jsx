import React, { useState } from "react";
import { Lock, User, ShieldCheck, Activity, Key, LogIn, Sparkles, UserPlus } from "lucide-react";
import api from "../api/axios";

export default function LoginPage({ onLogin, onNavigate }) {
  const [activeTab, setActiveTab] = useState("patient"); // patient | doctor | admin
  const [isRegister, setIsRegister] = useState(false);
  
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [doctorId, setDoctorId] = useState("");
  const [adminKey, setAdminKey] = useState("");
  
  // Registration specific fields
  const [doctorVerificationId, setDoctorVerificationId] = useState("");
  const [adminVerificationKey, setAdminVerificationKey] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleAutofill = () => {
    setError("");
    setSuccess("");
    if (activeTab === "patient") {
      setEmail("patient@demo.com");
      setPassword("1234");
    } else if (activeTab === "doctor") {
      setEmail("doctor@demo.com");
      setDoctorId("DOC001");
    } else if (activeTab === "admin") {
      setEmail("admin@demo.com");
      setAdminKey("ADMIN123");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (isRegister) {
      // REGISTRATION LOGIC
      if (!name || !password) {
        setError("Please enter your name and password.");
        return;
      }

      const payload = {
        name,
        email,
        password,
        role: activeTab
      };

      if (activeTab === "doctor") {
        if (!doctorVerificationId) {
          setError("Doctor Verification ID (DOC-2026) is required for registration.");
          return;
        }
        payload.doctorId = doctorVerificationId;
      }

      if (activeTab === "admin") {
        if (!adminVerificationKey) {
          setError("Admin Secret Key (ADMIN@TRIAGE) is required for registration.");
          return;
        }
        payload.adminSecretKey = adminVerificationKey;
      }

      try {
        const res = await api.post("/auth/register", payload);
        setSuccess("Registration successful! You can now log in.");
        setIsRegister(false);
        // Reset fields
        setName("");
        setPassword("");
        setDoctorVerificationId("");
        setAdminVerificationKey("");
      } catch (err) {
        setError(err.response?.data?.error || "Registration failed. Please check credentials.");
      }
    } else {
      // LOGIN LOGIC
      const loginPassword = activeTab === "patient" ? password : (activeTab === "doctor" ? doctorId : adminKey);
      
      try {
        const res = await api.post("/auth/login", {
          email,
          password: loginPassword
        });

        // Save session and token
        const userData = {
          token: res.data.token,
          id: res.data.user.id,
          name: res.data.user.name,
          email: res.data.user.email,
          role: res.data.user.role,
          department: res.data.user.role === "doctor" ? "Cardiology" : null // Demo dept
        };
        
        onLogin(userData);
      } catch (err) {
        setError(err.response?.data?.error || "Login failed. Check your email and password.");
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-73px)] bg-hospital-bg py-12 px-4 sm:px-6 lg:px-8 font-sans animate-fade-in">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-hospital border border-hospital-border">
        {/* Header Branding */}
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-hospital-primary mb-3">
            <Activity className="w-7 h-7" />
          </div>
          <h2 className="text-3xl font-extrabold text-hospital-heading">
            {isRegister ? "Create Account" : "Clinical Portal"}
          </h2>
          <p className="mt-2 text-sm text-hospital-subtext">
            {isRegister ? "Register a new credentials login" : "Select your clinical role below to login"}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-hospital-border mb-6">
          <button
            type="button"
            onClick={() => {
              setActiveTab("patient");
              setError("");
              setSuccess("");
              setEmail("");
              setPassword("");
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === "patient"
                ? "border-hospital-primary text-hospital-primary"
                : "border-transparent text-hospital-subtext hover:text-hospital-body"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <User className="w-4 h-4" />
              <span>Patient</span>
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => {
              setActiveTab("doctor");
              setError("");
              setSuccess("");
              setEmail("");
              setDoctorId("");
              setDoctorVerificationId("");
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === "doctor"
                ? "border-hospital-primary text-hospital-primary"
                : "border-transparent text-hospital-subtext hover:text-hospital-body"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <Activity className="w-4 h-4" />
              <span>Doctor</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab("admin");
              setError("");
              setSuccess("");
              setEmail("");
              setAdminKey("");
              setAdminVerificationKey("");
            }}
            className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
              activeTab === "admin"
                ? "border-hospital-primary text-hospital-primary"
                : "border-transparent text-hospital-subtext hover:text-hospital-body"
            }`}
          >
            <div className="flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4" />
              <span>Admin</span>
            </div>
          </button>
        </div>

        {/* Form */}
        <form className="space-y-5" onSubmit={handleSubmit}>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-hospital-high text-sm rounded-lg text-center font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 border border-green-200 text-hospital-low text-sm rounded-lg text-center font-medium">
              {success}
            </div>
          )}

          {/* Registration fields */}
          {isRegister && (
            <div>
              <label htmlFor="user-name" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                  <User className="w-4 h-4" />
                </span>
                <input
                  id="user-name"
                  name="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                  placeholder="Rahul Sharma"
                />
              </div>
            </div>
          )}

          <div>
            <label htmlFor="email-address" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                @
              </span>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                placeholder={activeTab === "patient" ? "patient@demo.com" : (activeTab === "doctor" ? "doctor@demo.com" : "admin@demo.com")}
              />
            </div>
          </div>

          {/* Conditional Inputs based on Mode (Login vs Register) & Role */}
          {isRegister ? (
            // REGISTRATION MODE: Common Password field + specific Verification Key
            <>
              <div>
                <label htmlFor="reg-password" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    id="reg-password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {activeTab === "doctor" && (
                <div>
                  <label htmlFor="doc-verify" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
                    Doctor Verification ID
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      id="doc-verify"
                      name="doctorVerificationId"
                      type="text"
                      required
                      value={doctorVerificationId}
                      onChange={(e) => setDoctorVerificationId(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                      placeholder="DOC-2026"
                    />
                  </div>
                </div>
              )}

              {activeTab === "admin" && (
                <div>
                  <label htmlFor="admin-verify" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
                    Admin Secret Key
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      id="admin-verify"
                      name="adminVerificationKey"
                      type="password"
                      required
                      value={adminVerificationKey}
                      onChange={(e) => setAdminVerificationKey(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                      placeholder="ADMIN@TRIAGE"
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            // LOGIN MODE: Role specific fields as originally designed
            <>
              {activeTab === "patient" && (
                <div>
                  <label htmlFor="password" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                      <Lock className="w-4 h-4" />
                    </span>
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                      placeholder="••••"
                    />
                  </div>
                </div>
              )}

              {activeTab === "doctor" && (
                <div>
                  <label htmlFor="doctor-id" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
                    Doctor ID
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                      <Activity className="w-4 h-4" />
                    </span>
                    <input
                      id="doctor-id"
                      name="doctorId"
                      type="text"
                      required
                      value={doctorId}
                      onChange={(e) => setDoctorId(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                      placeholder="DOC001"
                    />
                  </div>
                </div>
              )}

              {activeTab === "admin" && (
                <div>
                  <label htmlFor="admin-key" className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">
                    Admin Key
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-hospital-subtext">
                      <Key className="w-4 h-4" />
                    </span>
                    <input
                      id="admin-key"
                      name="adminKey"
                      type="password"
                      required
                      value={adminKey}
                      onChange={(e) => setAdminKey(e.target.value)}
                      className="w-full pl-9 pr-4 py-3 border border-hospital-inputBorder rounded-lg focus:outline-none focus:border-hospital-primary text-hospital-body placeholder-hospital-subtext transition-colors"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-hospital-primary hover:bg-hospital-hover text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isRegister ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
              <span>{isRegister ? "Create Account" : "Login to Dashboard"}</span>
            </button>
          </div>
        </form>

        {/* Toggle Mode Link (Login vs Register) */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={() => {
              setIsRegister(!isRegister);
              setError("");
              setSuccess("");
            }}
            className="text-sm font-semibold text-hospital-primary hover:underline cursor-pointer"
          >
            {isRegister ? "Already have an account? Log in" : "Need an account? Register here"}
          </button>
        </div>

        {/* Demo Credentials Box */}
        {!isRegister && (
          <div className="mt-6 p-5 bg-[#e8f0fe] border border-[#b3d4ff] rounded-xl text-left shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-[#0d47a1] flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-hospital-accent animate-pulse" />
                <span>Demo Access Credentials</span>
              </span>
              <button
                type="button"
                onClick={handleAutofill}
                className="text-xs font-bold text-hospital-primary hover:underline cursor-pointer bg-white py-1 px-2.5 rounded border border-[#b3d4ff]"
              >
                Auto-fill Form
              </button>
            </div>

            <div className="space-y-2 text-xs text-hospital-body">
              <div className={`p-2 rounded transition-colors ${activeTab === "patient" ? "bg-white border border-[#b3d4ff]" : ""}`}>
                <span className="font-bold">Patient Role:</span>
                <div className="flex justify-between mt-1 text-[#37474f]">
                  <span>Email: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">patient@demo.com</code></span>
                  <span>Password: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">1234</code></span>
                </div>
              </div>

              <div className={`p-2 rounded transition-colors ${activeTab === "doctor" ? "bg-white border border-[#b3d4ff]" : ""}`}>
                <span className="font-bold">Doctor Role:</span>
                <div className="flex justify-between mt-1 text-[#37474f]">
                  <span>Email: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">doctor@demo.com</code></span>
                  <span>ID: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">DOC001</code></span>
                </div>
              </div>

              <div className={`p-2 rounded transition-colors ${activeTab === "admin" ? "bg-white border border-[#b3d4ff]" : ""}`}>
                <span className="font-bold">Admin Role:</span>
                <div className="flex justify-between mt-1 text-[#37474f]">
                  <span>Email: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">admin@demo.com</code></span>
                  <span>Key: <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">ADMIN123</code></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
