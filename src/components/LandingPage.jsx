import React, { useState } from "react";
import {
  Activity,
  ShieldAlert,
  Users,
  ArrowRight,
  Layers,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertTriangle,
  Lock,
  Building2,
  Heart,
  Play,
  LineChart,
  Check,
  Cpu,
  ListOrdered,
  LayoutDashboard,
  Shield,
  FileCheck,
  TrendingUp,
  Bed,
  Zap
} from "lucide-react";

export default function LandingPage({ onNavigate }) {
  const [expandedFaq, setExpandedFaq] = useState(null);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const toggleFaq = (index) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  };

  const faqData = [
    {
      question: "What is SmartTriage and who is it for?",
      answer: "SmartTriage is an advanced clinical decision support and queue optimization platform designed for government and public hospitals. It automates patient prioritization at triage stations, reducing waiting times and load imbalances."
    },
    {
      question: "How does the AI risk scoring work?",
      answer: "The system reads real-time vital signs (oxygen saturation, heart rate, blood pressure, temperature) and symptoms. Our machine learning models classify the input into priority tiers: P1 (Immediate/High), P2 (Urgent/Medium), and P3 (Non-Urgent/Low)."
    },
    {
      question: "Is patient data secure?",
      answer: "Absolutely. SmartTriage employs strict data governance, secure local database hashing (using BCrypt for authentication), role-based endpoint access control (via JWT), and system audits for every single entry and triage update."
    },
    {
      question: "Can this be used in multiple hospitals?",
      answer: "Yes, the architecture is designed to be multi-tenant or cluster-deployable. In the Admin Panel, administrators can configure custom risk thresholds, monitor local clinic queues, and check total bed capacities dynamically."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F4F7FA] font-sans scroll-smooth">

      {/* 2. Main Navbar */}
      <header className="bg-white border-b border-slate-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="w-10 h-10 rounded-lg bg-[#0D4C7A] flex items-center justify-center text-white shadow-md">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <span className="text-lg font-extrabold text-[#0D4C7A] tracking-tight">SmartTriage</span>
              <span className="text-xs font-bold text-[#1A7EC8] block -mt-1.5">AI Engine</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-8">
            <button onClick={() => scrollToSection("home")} className="text-sm font-semibold text-[#0D4C7A] hover:text-[#1A7EC8] transition-colors cursor-pointer">Home</button>
            <button onClick={() => scrollToSection("features")} className="text-sm font-semibold text-slate-600 hover:text-[#1A7EC8] transition-colors cursor-pointer">Features</button>
            <button onClick={() => scrollToSection("problems")} className="text-sm font-semibold text-slate-600 hover:text-[#1A7EC8] transition-colors cursor-pointer">Challenges</button>
            <button onClick={() => scrollToSection("how-it-works")} className="text-sm font-semibold text-slate-600 hover:text-[#1A7EC8] transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => scrollToSection("about")} className="text-sm font-semibold text-slate-600 hover:text-[#1A7EC8] transition-colors cursor-pointer">About & FAQ</button>
          </nav>

          {/* Login button */}
          <div>
            <button
              onClick={() => onNavigate("login")}
              className="px-5 py-2 text-sm font-bold text-white bg-[#0D4C7A] hover:bg-[#0b3d62] rounded-lg transition-all duration-200 shadow-sm cursor-pointer hover:shadow"
            >
              Login Portal
            </button>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section id="home" className="py-12 lg:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-center">

          {/* Hero Left */}
          <div className="flex flex-col justify-center text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#1A7EC8]/10 border border-[#1A7EC8]/20 text-[#1A7EC8] text-xs font-bold uppercase tracking-wider mb-5 w-fit">
              ★ Trusted by Government Hospitals
            </span>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#0D4C7A] leading-tight tracking-tight">
              Smart Triage.<br />
              <span className="text-[#1A7EC8]">Zero Delays.</span>
            </h1>
            <p className="mt-4 text-base text-slate-600 leading-relaxed">
              Eliminate patient prioritization bottlenecks and maximize hospital load balance. SmartTriageAI computes instant, reliable risk scores to coordinate real-time clinic queuing automatically.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate("login")}
                className="px-6 py-3.5 bg-[#0D4C7A] hover:bg-[#0b3d62] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center gap-2 group cursor-pointer"
              >
                <span>Access Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={() => scrollToSection("how-it-works")}
                className="px-6 py-3.5 bg-white hover:bg-slate-50 border border-slate-200 text-[#0D4C7A] font-bold rounded-lg shadow-sm transition-all duration-200 cursor-pointer inline-flex items-center"
              >
                See How It Works
              </button>
            </div>
          </div>

          {/* Hero Center - Interactive Mockup */}
          <div className="w-full bg-[#0D4C7A] rounded-2xl p-5 shadow-2xl text-white relative overflow-hidden border border-[#1A7EC8]/30 min-h-[300px] flex flex-col justify-between">
            {/* Background grid lines */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1A7EC8_1px,transparent_1px),linear-gradient(to_bottom,#1A7EC8_1px,transparent_1px)] bg-[size:24px_24px] opacity-10"></div>

            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
              </div>
              <span className="text-[10px] font-mono tracking-wider opacity-60">LIVE MONITOR // P1-P3 QUEUE</span>
            </div>

            {/* Dashboard Mockup Content */}
            <div className="relative z-10 my-4 flex-grow flex flex-col gap-3">
              <div className="bg-white/10 p-3 rounded-lg border border-white/5 backdrop-blur-sm">
                <span className="text-[10px] font-bold uppercase text-[#1A7EC8] block tracking-wide">AI Classification Load</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-black">94.8%</span>
                  <span className="text-[10px] text-green-400 font-bold">↑ 2.4% accuracy</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-white/5 p-2.5 rounded border border-white/5">
                  <span className="text-[9px] text-white/50 block uppercase font-bold">P1 (Immediate)</span>
                  <span className="text-lg font-bold text-red-400">4 Active</span>
                </div>
                <div className="bg-white/5 p-2.5 rounded border border-white/5">
                  <span className="text-[9px] text-white/50 block uppercase font-bold">P2 (Urgent)</span>
                  <span className="text-lg font-bold text-yellow-300">12 Active</span>
                </div>
              </div>

              {/* Patient Queue simulator representation */}
              <div className="bg-white/5 p-2 rounded text-[10px] border border-white/5 font-mono flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping"></div>
                  <span>Token #1024 (P1)</span>
                </div>
                <span className="text-slate-400">Wait: ~3 min</span>
              </div>
            </div>

            <div className="relative z-10 border-t border-white/10 pt-3 flex justify-between items-center text-[10px] text-white/50">
              <span>SmartTriage AI active status</span>
              <span className="text-[#4CAF50] font-bold">● ONLINE</span>
            </div>
          </div>

        </div>
      </section>

      {/* WHAT WE OFFER Section */}
      <section id="features" className="py-16 lg:py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1A7EC8] text-xs font-black tracking-widest uppercase block mb-2">WHAT WE OFFER</span>
            <h2 className="text-3xl font-extrabold text-[#0D4C7A]">Everything Your Hospital Needs</h2>
            <p className="mt-4 text-slate-500 text-sm sm:text-base leading-relaxed">
              SmartTriageAI brings together AI, real-time data, and smart automation into one platform built for government hospitals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Feature 1 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1A7EC8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <Cpu className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">AI Risk Scoring</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Scikit-learn model classifies patients as Low, Medium, or High risk in under 1 second
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-green-100 text-[#4CAF50] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <ListOrdered className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">Smart Queue</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Priority-based token system automatically moves critical patients to the front
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">Live Dashboard</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Real-time patient count, risk distribution charts, and department load for admins
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">Role-Based Access</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Separate secure views for Patient, Doctor, and Admin with JWT authentication
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-blue-100 text-[#1A7EC8] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <FileCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">Audit Logs</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Every action logged with user ID, timestamp, and endpoint for full accountability
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-green-100 text-[#4CAF50] flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <TrendingUp className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">Analytics</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Daily reports, peak hour detection, and risk trend analysis with export support
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <Bed className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">Resource Management</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                Track bed availability, doctor allocation, and department capacity in real time
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-[#F4F7FA] p-6 rounded-xl border border-slate-100 hover:shadow-md hover:border-[#1A7EC8]/20 transition-all duration-300 group">
              <div className="w-12 h-12 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform shadow-sm">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0D4C7A] mb-2">Emergency Escalation</h3>
              <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                High-risk patients auto-escalated instantly without any manual intervention
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Challenges We Solve Section */}
      <section id="problems" className="py-16 lg:py-24 bg-white border-t border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1A7EC8] text-xs font-black tracking-widest uppercase block mb-2">PROBLEMS WE SOLVE</span>
            <h2 className="text-3xl font-extrabold text-[#0D4C7A]">Sound Familiar?</h2>
            <p className="mt-4 text-slate-500 text-sm sm:text-base leading-relaxed">
              Government hospitals face these challenges every day. SmartTriage eliminates them.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

            {/* Card 1 */}
            <div className="bg-[#F4F7FA] p-8 rounded-xl border border-slate-200 hover:border-[#1A7EC8]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0D4C7A] mb-3">Manual Triage Delays</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Intake staff spend crucial minutes measuring vitals and reading manuals. Patients deteriorate in waiting halls without visual flags.
                </p>
              </div>
              <span className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded text-xs font-extrabold w-fit uppercase">
                Most critical issue
              </span>
            </div>

            {/* Card 2 (Middle, styled with dark blue left border) */}
            <div className="bg-[#F4F7FA] p-8 rounded-xl border-l-4 border-l-[#0D4C7A] border-t border-r border-b border-slate-200 hover:border-[#1A7EC8]/40 shadow-md hover:shadow-lg transition-all duration-300 flex flex-col justify-between group relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#0D4C7A]/5 rounded-bl-full -z-10"></div>
              <div>
                <div className="w-12 h-12 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0D4C7A] mb-3">No Patient Prioritization</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  First-come, first-served queuing leads to patients with critical oxygen or blood pressure drops waiting behind minor complaints.
                </p>
              </div>
              <span className="inline-block px-3 py-1 bg-[#0D4C7A] text-white rounded text-xs font-extrabold w-fit uppercase">
                Causes patient harm
              </span>
            </div>

            {/* Card 3 */}
            <div className="bg-[#F4F7FA] p-8 rounded-xl border border-slate-200 hover:border-[#1A7EC8]/40 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-lg bg-indigo-100 text-indigo-600 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Building2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#0D4C7A] mb-3">Zero Real-Time Visibility</h3>
                <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-6">
                  Administration has no idea which clinic has a queue spike or how many hospital beds are currently open to admit urgent high-risk patients.
                </p>
              </div>
              <span className="inline-block px-3 py-1 bg-indigo-50 text-indigo-600 rounded text-xs font-extrabold w-fit uppercase">
                Operational blindspot
              </span>
            </div>

          </div>
        </div>
      </section>

      {/* 5. Full-width CTA Banner */}
      <section className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="bg-[#0D4C7A] rounded-2xl p-8 sm:p-12 shadow-xl border border-[#1A7EC8]/20 flex flex-col lg:flex-row items-center justify-between gap-8 relative overflow-hidden">
          {/* Visual element */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#1A7EC8]/10 rounded-full filter blur-3xl -z-10"></div>

          <div className="max-w-2xl text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              SmartTriage was built to solve each of these problems
            </h2>
            <p className="mt-3 text-slate-200 text-sm leading-relaxed">
              One AI-powered platform. Zero compromises. Empower clinic staff with automated decisions, real-time load analytics, and complete workflow logs.
            </p>
          </div>

          <div className="shrink-0 w-full sm:w-auto text-center">
            <button
              onClick={() => onNavigate("login")}
              className="w-full sm:w-auto px-8 py-4 bg-[#4CAF50] hover:bg-[#43a047] text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>See How It Works</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. How It Works Section */}
      <section id="how-it-works" className="py-16 lg:py-24 bg-[#F4F7FA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#1A7EC8] text-xs font-black tracking-widest uppercase block mb-2">HOW IT WORKS</span>
            <h2 className="text-3xl font-extrabold text-[#0D4C7A]">The Right Solution For How You Work</h2>
          </div>

          <div className="relative">
            {/* Connection Line for steps (desktop only) */}
            <div className="hidden lg:block absolute top-1/2 left-[15%] right-[15%] h-0.5 bg-slate-200 -translate-y-12 -z-10"></div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

              {/* Step 1 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#0D4C7A]/5 text-[#0D4C7A] flex items-center justify-center border-2 border-dashed border-[#0D4C7A]/20 group-hover:border-[#0D4C7A] group-hover:bg-[#0D4C7A] group-hover:text-white transition-all duration-300">
                    <Users className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#4CAF50] text-white text-xs font-bold flex items-center justify-center shadow-sm">1</span>
                </div>
                <h3 className="text-lg font-bold text-[#0D4C7A] mb-2">Patient Registers & Enters Symptoms</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  Patients securely login, submit their current symptoms, and input critical vitals: blood pressure, SpO2, heart rate, and temperature.
                </p>
              </div>

              {/* Step 2 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#0D4C7A]/5 text-[#0D4C7A] flex items-center justify-center border-2 border-dashed border-[#0D4C7A]/20 group-hover:border-[#0D4C7A] group-hover:bg-[#0D4C7A] group-hover:text-white transition-all duration-300">
                    <Activity className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#4CAF50] text-white text-xs font-bold flex items-center justify-center shadow-sm">2</span>
                </div>
                <h3 className="text-lg font-bold text-[#0D4C7A] mb-2">AI Scores Risk Level</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  The Flask-based Python AI service classifies the vitals with Random Forest models. Scores immediately flag high, medium, or low risk levels.
                </p>
              </div>

              {/* Step 3 */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm text-center flex flex-col items-center group hover:-translate-y-1 transition-transform duration-300">
                <div className="relative mb-6">
                  <div className="w-16 h-16 rounded-full bg-[#0D4C7A]/5 text-[#0D4C7A] flex items-center justify-center border-2 border-dashed border-[#0D4C7A]/20 group-hover:border-[#0D4C7A] group-hover:bg-[#0D4C7A] group-hover:text-white transition-all duration-300">
                    <ShieldAlert className="w-7 h-7" />
                  </div>
                  <span className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-[#4CAF50] text-white text-xs font-bold flex items-center justify-center shadow-sm">3</span>
                </div>
                <h3 className="text-lg font-bold text-[#0D4C7A] mb-2">Queue Assigned & Doctor Notified</h3>
                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed">
                  A triage token is issued and routed. The specialist clinic is alerted, placing the high-risk patient at the top of the queue list automatically.
                </p>
              </div>

            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="about" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* Left side block */}
            <div className="lg:col-span-5 flex flex-col justify-between">
              <div>
                <span className="text-[#1A7EC8] text-xs font-black tracking-widest uppercase block mb-2">FAQ</span>
                <h2 className="text-3xl font-extrabold text-[#0D4C7A] mb-6">We are here to Answer your Questions</h2>
              </div>

              <div className="bg-[#0D4C7A] rounded-xl p-6 text-white border border-[#1A7EC8]/20 relative overflow-hidden mt-6 lg:mt-0">
                <div className="relative z-10">
                  <Lock className="w-8 h-8 text-[#4CAF50] mb-4" />
                  <h4 className="font-bold text-sm uppercase tracking-wider mb-2">HIPAA & Security Standards</h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    Designed to align with strict compliance guidelines. Audit logs track every action taken by doctors and administrators, ensuring transparency.
                  </p>
                </div>
                <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-white/5 rounded-full filter blur-xl"></div>
              </div>
            </div>

            {/* Right side accordion */}
            <div className="lg:col-span-7 flex flex-col gap-3">
              {faqData.map((faq, index) => {
                const isOpen = expandedFaq === index;
                return (
                  <div
                    key={index}
                    className="border border-slate-200 rounded-xl overflow-hidden hover:border-[#1A7EC8]/30 transition-colors"
                  >
                    <button
                      onClick={() => toggleFaq(index)}
                      className="w-full px-6 py-4 bg-[#F4F7FA] text-left flex justify-between items-center gap-4 transition-colors hover:bg-slate-100"
                    >
                      <span className="font-bold text-[#0D4C7A] text-sm sm:text-base">{faq.question}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-[#1A7EC8] shrink-0" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-[#1A7EC8] shrink-0" />
                      )}
                    </button>
                    {isOpen && (
                      <div className="px-6 py-4 bg-white border-t border-slate-100 text-xs sm:text-sm text-slate-600 leading-relaxed animate-fade-in">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      </section>

      {/* 8. Footer */}
      <footer className="bg-[#0D3D6B] text-white pt-16 pb-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-12">

            {/* Left Block */}
            <div className="md:col-span-4 flex flex-col gap-4 text-left">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center text-[#0D3D6B] shadow-md">
                  <Activity className="w-6 h-6 animate-pulse" />
                </div>
                <div>
                  <span className="text-lg font-black tracking-tight text-white">SmartTriage</span>
                  <span className="text-xs font-bold text-[#4CAF50] block -mt-1">AI Powered</span>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
                Redistributing emergency patient flow and optimizing clinical resources. Helping healthcare units deliver fast, AI-prioritized diagnostics with Zero delays.
              </p>
            </div>

            {/* Links Columns */}
            <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-8">

              {/* Features Col */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4CAF50] mb-4">Features</h4>
                <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
                  <li><a onClick={() => onNavigate("login")} className="hover:text-white transition-colors cursor-pointer">AI Risk Scoring</a></li>
                  <li><a onClick={() => onNavigate("login")} className="hover:text-white transition-colors cursor-pointer">Smart Queue</a></li>
                  <li><a onClick={() => onNavigate("login")} className="hover:text-white transition-colors cursor-pointer">Live Dashboard</a></li>
                  <li><a onClick={() => onNavigate("login")} className="hover:text-white transition-colors cursor-pointer">Audit Logs</a></li>
                </ul>
              </div>

              {/* Resources Col */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4CAF50] mb-4">Resources</h4>
                <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
                  <li><button onClick={() => scrollToSection("home")} className="hover:text-white transition-colors cursor-pointer text-left">About</button></li>
                  <li><button onClick={() => scrollToSection("how-it-works")} className="hover:text-white transition-colors cursor-pointer text-left">How It Works</button></li>
                  <li><button onClick={() => scrollToSection("about")} className="hover:text-white transition-colors cursor-pointer text-left">FAQs</button></li>
                </ul>
              </div>

              {/* Team Col */}
              <div className="col-span-2 sm:col-span-1">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#4CAF50] mb-4">Team</h4>
                <ul className="flex flex-col gap-2.5 text-xs text-slate-300">
                  <li>Shivam Kumar Singh</li>
                  <li>Madhur</li>
                  <li>Mohit Tiwari</li>
                </ul>
              </div>

            </div>

          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-400">
            <div className="flex gap-4">
              <a className="hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
              <span className="opacity-20">|</span>
              <a className="hover:text-white transition-colors cursor-pointer">Terms of Use</a>
            </div>
            <p className="text-center sm:text-right">&copy; 2026 SmartTriageAI. Built for Government Healthcare.</p>
          </div>

        </div>
      </footer>
    </div>
  );
}

