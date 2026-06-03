import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { CheckCircle, AlertTriangle, Activity, Thermometer, Heart, Eye, Users, ChevronUp, Radio } from "lucide-react";

export default function DoctorDashboard({ user }) {
  const [patients, setPatients] = useState([]);
  const [stats, setStats] = useState({ totalQueue: 0, highCount: 0, mediumCount: 0, lowCount: 0 });
  const [filterDeptOnly, setFilterDeptOnly] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  // Load active patients on mount and setup polling
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/queue");
      setPatients(res.data);
      
      // Calculate stats on active patients in queue
      const highCount = res.data.filter(p => p.riskLevel === "HIGH").length;
      const mediumCount = res.data.filter(p => p.riskLevel === "MEDIUM").length;
      const lowCount = res.data.filter(p => p.riskLevel === "LOW").length;

      setStats({
        totalQueue: res.data.length,
        highCount,
        mediumCount,
        lowCount
      });
    } catch (err) {
      console.error("Error loading doctor queue:", err);
    }
  };

  const handleCallNext = async () => {
    setErrorMessage("");
    setInfoMessage("");
    try {
      const res = await api.post("/queue/next");
      if (res.data && res.data.active) {
        setInfoMessage(`Called patient ${res.data.token} to emergency booth!`);
        loadData();
      } else {
        setInfoMessage("No pending patients in the waiting queue.");
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error calling next patient.");
    }
  };

  const handleEscalate = async (patientId) => {
    setErrorMessage("");
    setInfoMessage("");
    try {
      const res = await api.post(`/queue/escalate/${patientId}`);
      setInfoMessage(`Patient ${patientId} successfully escalated to Priority 1 (HIGH)!`);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error escalating patient.");
    }
  };

  const handleMarkAsDone = async (patientId) => {
    setErrorMessage("");
    setInfoMessage("");
    try {
      await api.put(`/queue/status/${patientId}`, { status: "COMPLETED" });
      setInfoMessage(`Patient ${patientId} marked as completed.`);
      loadData();
    } catch (err) {
      setErrorMessage(err.response?.data?.error || "Error marking patient as done.");
    }
  };

  const pendingPatients = patients.filter((p) => p.status === "WAITING" || p.status === "CALLED" || p.status === "IN_PROGRESS");
  
  const displayedPatients = pendingPatients.filter((p) => {
    if (filterDeptOnly && user?.department) {
      return p.department === user.department;
    }
    return true;
  });

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 font-sans animate-fade-in">
      
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-6 border-b border-hospital-border mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-hospital-heading">
            {user?.name || "Dr. Sharma"}
          </h1>
          <p className="text-sm text-hospital-accent font-semibold">
            Emergency Department &mdash; {user?.department || "Cardiology"} Specialist
          </p>
        </div>

        {/* Global Action: Call Next Patient */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCallNext}
            className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-4 h-4 animate-pulse" />
            <span>Call Next Patient</span>
          </button>

          {/* Department Filter Toggle */}
          <div className="flex items-center gap-2 bg-white border border-hospital-border p-1.5 rounded-lg shadow-sm">
            <button
              onClick={() => setFilterDeptOnly(false)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                !filterDeptOnly 
                  ? "bg-hospital-primary text-white" 
                  : "text-hospital-body hover:bg-slate-100"
              }`}
            >
              All Depts Queue
            </button>
            <button
              onClick={() => setFilterDeptOnly(true)}
              className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer ${
                filterDeptOnly 
                  ? "bg-hospital-primary text-white" 
                  : "text-hospital-body hover:bg-slate-100"
              }`}
            >
              My Dept ({user?.department || "Cardiology"}) Only
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-hospital-high text-sm rounded-xl text-center font-bold">
          {errorMessage}
        </div>
      )}
      {infoMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 text-hospital-low text-sm rounded-xl text-center font-bold">
          {infoMessage}
        </div>
      )}

      {/* Stats Summary Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-white p-5 rounded-xl border border-hospital-border shadow-hospital flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-hospital-primary flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider">Total Active Queue</span>
            <span className="text-2xl font-black text-hospital-heading">{stats.totalQueue}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#ffcdd2] shadow-hospital flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-red-50 text-hospital-high flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider">High Risk (P1)</span>
            <span className="text-2xl font-black text-hospital-high">{stats.highCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#ffe0b2] shadow-hospital flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-hospital-medium flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider">Med Risk (P2)</span>
            <span className="text-2xl font-black text-hospital-medium">{stats.mediumCount}</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#c8e6c9] shadow-hospital flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-hospital-low flex items-center justify-center shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider">Low Risk (P3)</span>
            <span className="text-2xl font-black text-hospital-low">{stats.lowCount}</span>
          </div>
        </div>

      </div>

      {/* Main Queue List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-hospital-heading flex items-center gap-2">
            <Activity className="w-5 h-5 text-hospital-primary" />
            <span>Active Triage Patient Queue</span>
          </h2>
          <span className="text-xs text-hospital-subtext">Sorted by Severity, then Timestamp</span>
        </div>

        {displayedPatients.length === 0 ? (
          <div className="bg-white p-12 text-center border border-hospital-border rounded-xl shadow-hospital">
            <CheckCircle className="w-12 h-12 text-hospital-low mx-auto mb-4" />
            <h3 className="text-lg font-bold text-hospital-heading">All Clear!</h3>
            <p className="text-sm text-hospital-subtext mt-1">There are no pending patients in the active queue.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {displayedPatients.map((patient) => {
              const isHigh = patient.riskLevel === "HIGH";
              const isMed = patient.riskLevel === "MEDIUM";
              const isCalled = patient.status === "CALLED";
              
              const borderStyles = isCalled
                ? "border-l-4 border-l-blue-600 border-hospital-border bg-blue-50/20"
                : isHigh 
                ? "border-l-4 border-l-[#c62828] border-hospital-border"
                : isMed
                ? "border-l-4 border-l-[#ef6c00] border-hospital-border"
                : "border-l-4 border-l-[#2e7d32] border-hospital-border";

              return (
                <div
                  key={patient.id}
                  className={`bg-white rounded-xl border p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col lg:flex-row lg:items-center justify-between gap-6 ${borderStyles}`}
                >
                  
                  {/* Left Column: Demographics & Badges */}
                  <div className="space-y-2 lg:max-w-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 text-hospital-body rounded border border-slate-200">
                        {patient.id}
                      </span>
                      <span
                        className="text-xs font-bold px-2 py-0.5 rounded border"
                        style={{
                          backgroundColor: isHigh ? "#ffebee" : isMed ? "#fff3e0" : "#e8f5e9",
                          color: isHigh ? "#c62828" : isMed ? "#ef6c00" : "#2e7d32",
                          borderColor: isHigh ? "#ffcdd2" : isMed ? "#ffe0b2" : "#c8e6c9"
                        }}
                      >
                        {patient.riskLevel} ({(patient.score * 100).toFixed(0)}%)
                      </span>
                      <span className="text-xs font-bold text-hospital-accent">
                        {patient.department}
                      </span>
                      {isCalled && (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-700 rounded border border-blue-200 uppercase animate-pulse">
                          Called
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-hospital-heading">
                      {patient.name} <span className="text-sm font-normal text-hospital-body">({patient.age} yrs, {patient.gender})</span>
                    </h3>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {patient.symptoms.map((symptom) => (
                        <span key={symptom} className="text-xs bg-slate-50 border border-hospital-border px-2 py-0.5 rounded text-hospital-body">
                          {symptom}
                        </span>
                      ))}
                      {patient.symptoms.length === 0 && (
                        <span className="text-xs text-hospital-subtext italic">No symptoms reported</span>
                      )}
                    </div>
                  </div>

                  {/* Middle Column: Vitals Summary */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 bg-slate-50 rounded-lg border border-hospital-border flex-grow max-w-xl">
                    <div className="flex items-center gap-2">
                      <Thermometer className="w-4 h-4 text-hospital-accent" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-hospital-subtext">Temp</span>
                        <span className={`text-xs font-extrabold ${patient.vitals.temp > 101 ? "text-hospital-medium" : "text-hospital-heading"}`}>
                          {patient.vitals.temp}°F
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-hospital-accent" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-hospital-subtext">BP (Syst)</span>
                        <span className={`text-xs font-extrabold ${patient.vitals.bp > 140 ? "text-hospital-high" : "text-hospital-heading"}`}>
                          {patient.vitals.bp} mmHg
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Activity className="w-4 h-4 text-hospital-accent" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-hospital-subtext">Pulse</span>
                        <span className={`text-xs font-extrabold ${patient.vitals.pulse > 100 ? "text-hospital-high" : "text-hospital-heading"}`}>
                          {patient.vitals.pulse} bpm
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Eye className="w-4 h-4 text-hospital-accent" />
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-hospital-subtext">SpO2</span>
                        <span className={`text-xs font-extrabold ${patient.vitals.spo2 < 92 ? "text-hospital-high" : "text-hospital-heading"}`}>
                          {patient.vitals.spo2}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Time & Actions */}
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-center gap-3 shrink-0 border-t lg:border-t-0 pt-4 lg:pt-0 border-hospital-border">
                    <div className="text-left lg:text-right">
                      <span className="block text-[10px] uppercase font-bold text-hospital-subtext">Registered At</span>
                      <span className="text-xs font-extrabold text-hospital-heading">{patient.time}</span>
                    </div>

                    <div className="flex gap-2">
                      {/* Escalate button: shown if not already HIGH risk */}
                      {patient.riskLevel !== "HIGH" && (
                        <button
                          onClick={() => handleEscalate(patient.id)}
                          className="px-2.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-bold rounded-lg border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                          title="Escalate to High Priority"
                        >
                          <ChevronUp className="w-3.5 h-3.5" />
                          <span>Escalate</span>
                        </button>
                      )}
                      
                      <button
                        onClick={() => handleMarkAsDone(patient.id)}
                        className="px-4 py-2 bg-hospital-primary hover:bg-hospital-hover text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mark as Done</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
