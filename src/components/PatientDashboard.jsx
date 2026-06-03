import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Check, Clipboard, ShieldAlert, Clock, Sparkles, User, FileHeart } from "lucide-react";

export default function PatientDashboard({ user }) {
  // Form fields
  const [name, setName] = useState(user?.name || "");
  const [age, setAge] = useState(35);
  const [gender, setGender] = useState("Male");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [vitals, setVitals] = useState({
    temp: 98.6,
    bp: 120,
    bp_diastolic: 80,
    pulse: 80,
    spo2: 98
  });

  const [triageResult, setTriageResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const symptomsList = [
    "Fever",
    "Chest Pain",
    "Breathlessness",
    "Headache",
    "Vomiting",
    "Fatigue",
    "Dizziness",
    "Nausea"
  ];

  // Fetch current active token status on mount and poll
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await api.get("/patient/status");
        if (res.data && res.data.active) {
          let tokenPrefix = "P3";
          let statusMessage = "You are in the normal queue";
          let waitRange = "45 - 60 mins";
          let dept = "General Medicine";

          // Determine department based on symptoms if available
          if (res.data.risk_level === "HIGH") {
            tokenPrefix = "P1";
            statusMessage = "Immediate Attention Required";
            waitRange = "0 - 5 mins";
            dept = "Cardiology";
          } else if (res.data.risk_level === "MEDIUM") {
            tokenPrefix = "P2";
            statusMessage = "Please wait, will be attended soon";
            waitRange = "15 - 30 mins";
            dept = "General Medicine";
          }

          setTriageResult({
            riskLevel: res.data.risk_level,
            score: res.data.risk_score / 100,
            tokenId: res.data.token_number,
            tokenPrefix,
            statusMessage,
            waitRange,
            department: dept,
            position: res.data.position,
            status: res.data.status
          });
        } else {
          setTriageResult(null);
        }
      } catch (err) {
        console.error("Error fetching triage status:", err);
      }
    };

    fetchStatus();
    
    // Poll every 8 seconds
    const interval = setInterval(fetchStatus, 8000);
    return () => clearInterval(interval);
  }, []);

  const handleSymptomChange = (symptom) => {
    if (selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom));
    } else {
      setSelectedSymptoms([...selectedSymptoms, symptom]);
    }
  };

  const handleVitalChange = (vital, val) => {
    setVitals({
      ...vitals,
      [vital]: parseFloat(val) || 0
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTriageResult(null);
    setError("");

    try {
      const res = await api.post("/patient/symptoms", {
        temperature: vitals.temp,
        systolic_bp: vitals.bp,
        diastolic_bp: vitals.bp_diastolic,
        oxygen_level: vitals.spo2,
        heart_rate: vitals.pulse,
        symptoms: selectedSymptoms,
        name: name || user?.name || "Patient",
        age: parseInt(age) || 30,
        gender
      });

      const data = res.data;
      let tokenPrefix = "P3";
      let statusMessage = "You are in the normal queue";
      let waitRange = "45 - 60 mins";
      let dept = "General Medicine";

      if (data.risk_level === "HIGH") {
        tokenPrefix = "P1";
        statusMessage = "Immediate Attention Required";
        waitRange = "0 - 5 mins";
        dept = "Cardiology";
      } else if (data.risk_level === "MEDIUM") {
        tokenPrefix = "P2";
        statusMessage = "Please wait, will be attended soon";
        waitRange = "15 - 30 mins";
        dept = "General Medicine";
      }

      setTriageResult({
        riskLevel: data.risk_level,
        score: data.risk_score / 100,
        tokenId: data.token_number,
        tokenPrefix,
        statusMessage,
        waitRange,
        department: dept,
        position: data.position || 1,
        status: data.status
      });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || "Failed to submit symptoms. Please check inputs.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full px-4 py-8 font-sans animate-fade-in">
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-hospital-high rounded-xl text-center font-bold">
          {error}
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Form Column */}
        <div className="w-full md:w-3/5 bg-white p-6 sm:p-8 rounded-xl border border-hospital-border shadow-hospital">
          <div className="flex items-center gap-2.5 pb-4 border-b border-hospital-border mb-6">
            <div className="h-10 w-10 rounded-lg bg-blue-50 text-hospital-primary flex items-center justify-center">
              <Clipboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-hospital-heading">AI Triage Entry Form</h2>
              <p className="text-xs text-hospital-subtext">Enter patient vitals and symptoms for triage classification</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Demographics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">Patient Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={user?.name || "Patient Name"}
                  className="w-full px-3 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">Age</label>
                <input
                  type="number"
                  required
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-2">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full px-3 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body bg-white"
                >
                  <option>Male</option>
                  <option>Female</option>
                  <option>Other</option>
                </select>
              </div>
            </div>

            {/* Symptoms Grid */}
            <div>
              <label className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-3">Select Symptoms</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {symptomsList.map((symptom) => {
                  const isChecked = selectedSymptoms.includes(symptom);
                  return (
                    <button
                      key={symptom}
                      type="button"
                      onClick={() => handleSymptomChange(symptom)}
                      className={`flex items-center gap-2 p-3 rounded-lg border text-left text-xs font-medium transition-all duration-200 cursor-pointer ${
                        isChecked
                          ? "bg-blue-50 border-hospital-primary text-hospital-primary shadow-sm"
                          : "bg-white border-hospital-border text-hospital-body hover:border-blue-200"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 ${
                        isChecked ? "bg-hospital-primary border-hospital-primary text-white" : "border-hospital-inputBorder"
                      }`}>
                        {isChecked && <Check className="w-3 h-3" />}
                      </div>
                      <span>{symptom}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Vitals Inputs */}
            <div>
              <label className="block text-xs font-bold text-hospital-body uppercase tracking-wider mb-3">Vitals Log</label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] text-hospital-subtext mb-1">Temp (°F)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="90"
                    max="110"
                    value={vitals.temp}
                    onChange={(e) => handleVitalChange("temp", e.target.value)}
                    className="w-full px-2.5 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-hospital-subtext mb-1">Systolic BP</label>
                  <input
                    type="number"
                    min="50"
                    max="260"
                    value={vitals.bp}
                    onChange={(e) => handleVitalChange("bp", e.target.value)}
                    className="w-full px-2.5 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-hospital-subtext mb-1">Diastolic BP</label>
                  <input
                    type="number"
                    min="30"
                    max="180"
                    value={vitals.bp_diastolic}
                    onChange={(e) => handleVitalChange("bp_diastolic", e.target.value)}
                    className="w-full px-2.5 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-hospital-subtext mb-1">Pulse (bpm)</label>
                  <input
                    type="number"
                    min="30"
                    max="220"
                    value={vitals.pulse}
                    onChange={(e) => handleVitalChange("pulse", e.target.value)}
                    className="w-full px-2.5 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-hospital-subtext mb-1">SpO2 (%)</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={vitals.spo2}
                    onChange={(e) => handleVitalChange("spo2", e.target.value)}
                    className="w-full px-2.5 py-2 border border-hospital-inputBorder rounded focus:outline-none focus:border-hospital-primary text-sm text-hospital-body"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-4 bg-hospital-primary hover:bg-hospital-hover disabled:bg-slate-400 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer text-base"
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running AI Diagnostics...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 text-blue-100" />
                  <span>Analyse &amp; Get Token</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results/Info Column */}
        <div className="w-full md:w-2/5 flex flex-col gap-6">
          {/* Animated AI Risk Result Card */}
          {triageResult ? (
            <div className="bg-white rounded-xl border border-hospital-border shadow-lg overflow-hidden animate-slide-up animate-fade-in">
              {/* Header Colored Indicator bar based on risk */}
              <div
                className="h-3.5 w-full"
                style={{
                  backgroundColor:
                    triageResult.riskLevel === "HIGH"
                      ? "#c62828"
                      : triageResult.riskLevel === "MEDIUM"
                      ? "#ef6c00"
                      : "#2e7d32"
                }}
              ></div>
              
              <div className="p-6 sm:p-8 text-center">
                <span
                  className="inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 border"
                  style={{
                    backgroundColor:
                      triageResult.riskLevel === "HIGH"
                        ? "#ffebee"
                        : triageResult.riskLevel === "MEDIUM"
                        ? "#fff3e0"
                        : "#e8f5e9",
                    color:
                      triageResult.riskLevel === "HIGH"
                        ? "#c62828"
                        : triageResult.riskLevel === "MEDIUM"
                        ? "#ef6c00"
                        : "#2e7d32",
                    borderColor:
                      triageResult.riskLevel === "HIGH"
                        ? "#ffcdd2"
                        : triageResult.riskLevel === "MEDIUM"
                        ? "#ffe0b2"
                        : "#c8e6c9"
                  }}
                >
                  Triage Risk: {triageResult.riskLevel}
                </span>

                <div className="mb-4">
                  <span className="block text-sm text-hospital-subtext">Estimated Severity Score</span>
                  <span className="text-3xl font-extrabold text-hospital-heading">
                    {(triageResult.score * 100).toFixed(0)}%
                  </span>
                </div>

                <div className="p-4 bg-slate-50 border border-hospital-border rounded-xl mb-4">
                  <span className="block text-xs uppercase tracking-wider font-bold text-hospital-subtext mb-1">Queue Token</span>
                  <div className="text-4xl font-extrabold text-hospital-primary tracking-wide mb-1">
                    {triageResult.tokenId}
                  </div>
                  <span className="text-sm font-semibold text-hospital-heading">
                    Priority Tier: {triageResult.tokenPrefix}
                  </span>
                </div>

                {/* Queue Position helper */}
                {triageResult.status === "WAITING" && triageResult.position !== undefined && (
                  <div className="mb-4 p-4 bg-blue-50 border border-blue-100 rounded-xl">
                    <span className="block text-xs uppercase tracking-wider font-bold text-hospital-subtext">Current Queue Position</span>
                    <span className="text-2xl font-black text-hospital-primary">
                      #{triageResult.position}
                    </span>
                    <span className="block text-[10px] text-hospital-subtext mt-1">Updates live automatically</span>
                  </div>
                )}

                {triageResult.status === "CALLED" && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-bold animate-pulse text-sm">
                    ⚡ You have been CALLED! Please proceed to treatment.
                  </div>
                )}

                {triageResult.status === "IN_PROGRESS" && (
                  <div className="mb-4 p-4 bg-orange-50 border border-orange-200 rounded-xl text-orange-700 font-bold text-sm">
                    🏥 Currently In Progress / Under Treatment.
                  </div>
                )}

                {/* Status Warning message */}
                <div
                  className="flex items-center gap-2 p-3 rounded-lg border text-sm font-semibold justify-center mb-6"
                  style={{
                    backgroundColor:
                      triageResult.riskLevel === "HIGH"
                        ? "#ffebee"
                        : triageResult.riskLevel === "MEDIUM"
                        ? "#fff3e0"
                        : "#e8f5e9",
                    color:
                      triageResult.riskLevel === "HIGH"
                        ? "#c62828"
                        : triageResult.riskLevel === "MEDIUM"
                        ? "#ef6c00"
                        : "#2e7d32",
                    borderColor:
                      triageResult.riskLevel === "HIGH"
                        ? "#ffcdd2"
                        : triageResult.riskLevel === "MEDIUM"
                        ? "#ffe0b2"
                        : "#c8e6c9"
                  }}
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>{triageResult.statusMessage}</span>
                </div>

                {/* Wait time and routing info */}
                <div className="grid grid-cols-2 gap-4 border-t border-hospital-border pt-5 text-left">
                  <div>
                    <span className="block text-xs text-hospital-subtext font-semibold flex items-center gap-1">
                      <Clock className="w-3 h-3" /> Est. Wait Time
                    </span>
                    <span className="text-sm font-extrabold text-hospital-heading">
                      {triageResult.status === "CALLED" ? "0 mins" : triageResult.waitRange}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-hospital-subtext font-semibold flex items-center gap-1">
                      <FileHeart className="w-3 h-3" /> Clinic Assigned
                    </span>
                    <span className="text-sm font-extrabold text-hospital-primary">
                      {triageResult.department}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    onClick={async () => {
                      if (window.confirm("Submit new triage form? This will clear your current queue position.")) {
                        setTriageResult(null);
                        setSelectedSymptoms([]);
                      }
                    }}
                    className="text-xs font-semibold text-hospital-accent hover:underline cursor-pointer"
                  >
                    File New Symptoms Entry
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-hospital-border shadow-hospital p-6 text-left">
              <h3 className="text-base font-bold text-hospital-heading mb-4 flex items-center gap-2">
                <FileHeart className="w-5 h-5 text-hospital-primary" />
                <span>Diagnostics Guidelines</span>
              </h3>
              <p className="text-xs text-hospital-body leading-relaxed mb-4">
                The smart triage assistant analyzes clinical vital parameters and symptoms database logic to run triage protocols:
              </p>
              
              <ul className="space-y-3.5 text-xs text-hospital-body">
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0 mt-1.5"></div>
                  <div>
                    <strong className="text-hospital-high">HIGH RISK (P1)</strong>: Checked chest pain, SpO2 &lt; 90%, BP &gt; 180, or Pulse &gt; 120 bpm. Fast-tracked for immediate medical attention.
                  </div>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shrink-0 mt-1.5"></div>
                  <div>
                    <strong className="text-hospital-medium">MEDIUM RISK (P2)</strong>: Fever temperature &gt; 101°F, or fever combined with 2+ other general symptoms.
                  </div>
                </li>
                <li className="flex gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-600 shrink-0 mt-1.5"></div>
                  <div>
                    <strong className="text-hospital-low">LOW RISK (P3)</strong>: Stable temperature and blood pressure. Standard outpatient wait queue applies.
                  </div>
                </li>
              </ul>
            </div>
          )}

          {/* Quick instructions/Status banner */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 text-left flex items-start gap-3">
            <User className="w-5 h-5 text-hospital-primary shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold text-hospital-heading">Simulated Demo Patient Mode</h4>
              <p className="text-xs text-hospital-subtext mt-1 leading-relaxed">
                As a patient, you can fill in different symptoms/vitals to trigger different triage paths, then log in as the Doctor or Admin to view how your patient registers in the queues and charts!
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
