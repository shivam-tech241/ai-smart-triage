import React, { useState, useEffect } from "react";
import api from "../api/axios";
import { Download, Plus, Minus, RefreshCw, BarChart2, Shield, Calendar, Layers, Sliders, CheckCircle } from "lucide-react";

export default function AdminDashboard() {
  const [patients, setPatients] = useState([]);
  const [bedsAvailable, setBedsAvailable] = useState(15);
  const [totalBeds, setTotalBeds] = useState(50);
  const [stats, setStats] = useState({
    totalPatientsToday: 0,
    riskDistribution: { low: 0, medium: 0, high: 0 },
    currentQueueLength: 0,
    peakHour: "N/A"
  });

  // Thresholds state
  const [thresholds, setThresholds] = useState({
    high_temp: 103.0,
    medium_temp: 100.0,
    high_bp: 180.0,
    medium_bp: 140.0,
    high_spo2: 90.0,
    medium_spo2: 95.0
  });

  const [message, setMessage] = useState("");
  const [isSavingThresholds, setIsSavingThresholds] = useState(false);

  useEffect(() => {
    loadData();
    // Poll data every 6 seconds
    const interval = setInterval(loadData, 6000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    try {
      const res = await api.get("/admin/dashboard");
      const data = res.data;
      setPatients(data.patients || []);
      setBedsAvailable(data.availableBeds);
      setTotalBeds(data.totalBeds || 50);
      setStats({
        totalPatientsToday: data.totalPatientsToday,
        riskDistribution: data.riskDistribution || { low: 0, medium: 0, high: 0 },
        currentQueueLength: data.currentQueueLength,
        peakHour: data.peakHour || "N/A"
      });
    } catch (err) {
      console.error("Error loading admin stats:", err);
    }
  };

  const handleResetData = async () => {
    if (window.confirm("Are you sure you want to reset the database and restore default seed patients?")) {
      try {
        await api.post("/admin/reset");
        setMessage("Database successfully reset to default seeds!");
        loadData();
        setTimeout(() => setMessage(""), 4000);
      } catch (err) {
        console.error("Error resetting data:", err);
      }
    }
  };

  const handleAddMockPatient = async () => {
    const names = ["Aarav Patel", "Ananya Iyer", "Vikram Sen", "Ritu Mehta", "Sanjay Joshi"];
    const ages = [24, 52, 70, 39, 41];
    const genders = ["Male", "Female", "Male", "Female", "Male"];
    
    const mockSymptomsSets = [
      { symptoms: ["Chest Pain"], temp: 98.6, bp: 185, bp_dia: 100, pulse: 88, spo2: 95 }, // HIGH (BP > 180)
      { symptoms: ["Fever", "Headache", "Fatigue"], temp: 101.5, bp: 120, bp_dia: 80, pulse: 92, spo2: 97 }, // MEDIUM (Fever + symptoms)
      { symptoms: ["Nausea", "Fatigue"], temp: 98.4, bp: 110, bp_dia: 75, pulse: 72, spo2: 99 }, // LOW (Normal)
      { symptoms: ["Breathlessness"], temp: 98.8, bp: 130, bp_dia: 85, pulse: 82, spo2: 87 }, // HIGH (SpO2 < 90)
      { symptoms: ["Fever"], temp: 104.2, bp: 124, bp_dia: 82, pulse: 85, spo2: 98 } // HIGH (Temp > 103)
    ];

    const randomIndex = Math.floor(Math.random() * mockSymptomsSets.length);
    const selectedMock = mockSymptomsSets[randomIndex];
    const mockName = names[Math.floor(Math.random() * names.length)];
    const mockAge = ages[Math.floor(Math.random() * ages.length)];
    const mockGender = genders[Math.floor(Math.random() * genders.length)];

    try {
      await api.post("/patient/symptoms", {
        temperature: selectedMock.temp,
        systolic_bp: selectedMock.bp,
        diastolic_bp: selectedMock.bp_dia,
        oxygen_level: selectedMock.spo2,
        heart_rate: selectedMock.pulse,
        symptoms: selectedMock.symptoms,
        name: mockName,
        age: mockAge,
        gender: mockGender
      });

      setMessage(`Simulated patient "${mockName}" registered and triaged successfully!`);
      loadData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error creating mock patient:", err);
    }
  };

  const handleUpdateBeds = async (change) => {
    const nextBeds = Math.max(1, totalBeds + change);
    try {
      await api.put("/admin/thresholds", { total_beds: nextBeds });
      setTotalBeds(nextBeds);
      loadData();
    } catch (err) {
      console.error("Error adjusting beds capacity:", err);
    }
  };

  const handleSaveThresholds = async (e) => {
    e.preventDefault();
    setIsSavingThresholds(true);
    setMessage("");

    try {
      await api.put("/admin/thresholds", thresholds);
      setMessage("Clinical risk thresholds updated successfully!");
      loadData();
      setTimeout(() => setMessage(""), 4000);
    } catch (err) {
      console.error("Error saving thresholds:", err);
      setMessage("Failed to save thresholds.");
    } finally {
      setIsSavingThresholds(false);
    }
  };

  const handleThresholdChange = (key, val) => {
    setThresholds({
      ...thresholds,
      [key]: parseFloat(val) || 0
    });
  };

  // Export report as CSV download
  const handleExportReport = () => {
    const headers = [
      "Token ID",
      "Name",
      "Age",
      "Gender",
      "Risk Level",
      "AI Score",
      "Symptoms",
      "Vitals Temp (F)",
      "Vitals BP Systolic",
      "Vitals Pulse Rate",
      "Vitals SpO2",
      "Department",
      "Status",
      "Time Registered"
    ];

    const rows = patients.map((p) => [
      p.id,
      p.name,
      p.age,
      p.gender,
      p.riskLevel,
      p.score,
      p.symptoms.join("; "),
      p.vitals.temp,
      p.vitals.bp,
      p.vitals.pulse,
      p.vitals.spo2,
      p.department,
      p.status,
      p.time
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.map((val) => `"${val}"`).join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `hospital_triage_report_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Department counts for bar chart
  const deptCounts = {
    Cardiology: 0,
    "General Medicine": 0,
    Neurology: 0,
    Ortho: 0
  };

  patients.filter(p => p.status !== "COMPLETED").forEach((p) => {
    if (deptCounts[p.department] !== undefined) {
      deptCounts[p.department] += 1;
    } else {
      deptCounts["General Medicine"] += 1;
    }
  });

  const deptData = [
    { name: "Cardiology", count: deptCounts["Cardiology"], color: "#1565c0" },
    { name: "General Med", count: deptCounts["General Medicine"], color: "#1e88e5" },
    { name: "Neurology", count: deptCounts["Neurology"], color: "#0d47a1" },
    { name: "Ortho", count: deptCounts["Ortho"], color: "#90caf9" }
  ];

  const maxCount = Math.max(...deptData.map((d) => d.count), 4);

  return (
    <div className="max-w-6xl mx-auto w-full px-4 py-8 font-sans animate-fade-in">
      
      {/* Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-hospital-border mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-hospital-heading flex items-center gap-2">
            <Shield className="w-8 h-8 text-hospital-primary" />
            <span>Hospital Load Optimizer</span>
          </h1>
          <p className="text-sm text-hospital-subtext">
            Command Center Overview &amp; Real-time Resource Allocation Dashboard
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={handleAddMockPatient}
            className="px-3.5 py-2 bg-[#e8f0fe] hover:bg-blue-100 text-hospital-primary border border-hospital-inputBorder rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Patient</span>
          </button>
          
          <button
            onClick={handleResetData}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-hospital-body border border-hospital-border rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Reset Patient Queue to Default seeds"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>
        </div>
      </div>

      {message && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 text-hospital-primary rounded-xl text-center font-bold text-sm">
          {message}
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-xl border border-hospital-border shadow-hospital">
          <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider mb-1">Patients Today</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-hospital-heading">{stats.totalPatientsToday}</span>
            <span className="text-xs text-hospital-subtext">registered</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-xl border border-hospital-border shadow-hospital">
          <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider mb-1">High Risk Count (P1)</span>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-hospital-high">{stats.riskDistribution.high}</span>
            <span className="text-xs text-hospital-subtext">immediate</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-xl border border-hospital-border shadow-hospital">
          <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider mb-1">Peak Load Hour</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-hospital-primary">{stats.peakHour}</span>
            <span className="text-xs text-hospital-subtext">highest load</span>
          </div>
        </div>

        {/* Metric 4: Interactive Bed Counter */}
        <div className="bg-white p-5 rounded-xl border border-hospital-border shadow-hospital">
          <span className="block text-xs font-bold text-hospital-subtext uppercase tracking-wider mb-1">Beds Available</span>
          <div className="flex items-center justify-between mt-1">
            <span className="text-3xl font-black text-hospital-heading">{bedsAvailable} <span className="text-xs text-hospital-subtext">/ {totalBeds}</span></span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => handleUpdateBeds(-1)}
                className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-hospital-border rounded flex items-center justify-center cursor-pointer"
                title="Decrease Bed Capacity"
              >
                <Minus className="w-3.5 h-3.5 text-hospital-body" />
              </button>
              <button
                onClick={() => handleUpdateBeds(1)}
                className="w-7 h-7 bg-slate-50 hover:bg-slate-100 border border-hospital-border rounded flex items-center justify-center cursor-pointer"
                title="Increase Bed Capacity"
              >
                <Plus className="w-3.5 h-3.5 text-hospital-body" />
              </button>
            </div>
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* SVG Department Load Chart */}
        <div className="bg-white rounded-xl border border-hospital-border p-6 shadow-hospital lg:col-span-2">
          <h2 className="text-lg font-bold text-hospital-heading mb-6 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-hospital-primary" />
            <span>Active Patient Load by Specialty Clinic</span>
          </h2>

          <div className="w-full flex justify-center">
            <svg className="w-full max-w-2xl h-64 font-sans" viewBox="0 0 500 240">
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
                const gridY = 30 + ratio * 150;
                const gridValue = Math.round(maxCount * (1 - ratio));
                return (
                  <g key={index} className="opacity-45">
                    <line x1="60" y1={gridY} x2="480" y2={gridY} stroke="#e3eaf5" strokeWidth="1" strokeDasharray="3,3" />
                    <text x="45" y={gridY + 4} fill="#78909c" fontSize="10" textAnchor="end" fontWeight="bold">
                      {gridValue}
                    </text>
                  </g>
                );
              })}

              <line x1="60" y1="180" x2="480" y2="180" stroke="#90caf9" strokeWidth="1.5" />

              {deptData.map((item, index) => {
                const barWidth = 48;
                const spacing = 100;
                const xPos = 85 + index * spacing;
                
                const maxBarHeight = 150;
                const barHeight = item.count > 0 ? (item.count / maxCount) * maxBarHeight : 5;
                const yPos = 180 - barHeight;

                return (
                  <g key={item.name} className="group">
                    <rect
                      x={xPos - 12}
                      y="25"
                      width={barWidth + 24}
                      height="160"
                      fill="transparent"
                      className="cursor-pointer"
                    />
                    
                    <rect
                      x={xPos}
                      y={yPos}
                      width={barWidth}
                      height={barHeight}
                      fill={item.color}
                      rx="4"
                      className="transition-all duration-500 ease-out hover:brightness-90 cursor-pointer"
                    />

                    <text
                      x={xPos + barWidth / 2}
                      y={yPos - 8}
                      fill="#0d1b3e"
                      fontSize="11"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {item.count}
                    </text>

                    <text
                      x={xPos + barWidth / 2}
                      y="200"
                      fill="#37474f"
                      fontSize="10"
                      fontWeight="bold"
                      textAnchor="middle"
                    >
                      {item.name}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Triage Threshold Configurator Panel */}
        <div className="bg-white rounded-xl border border-hospital-border p-6 shadow-hospital">
          <h2 className="text-lg font-bold text-hospital-heading mb-4 flex items-center gap-2">
            <Sliders className="w-5 h-5 text-hospital-primary" />
            <span>Triage Threshold Config</span>
          </h2>
          <p className="text-xs text-hospital-subtext mb-4 leading-relaxed">
            Modify vital parameters thresholds stored in the database to adjust priority sorting levels.
          </p>

          <form onSubmit={handleSaveThresholds} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-hospital-body uppercase mb-1">Temp High (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.high_temp}
                  onChange={(e) => handleThresholdChange("high_temp", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-hospital-inputBorder rounded text-xs text-hospital-body"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-hospital-body uppercase mb-1">Temp Med (°F)</label>
                <input
                  type="number"
                  step="0.1"
                  value={thresholds.medium_temp}
                  onChange={(e) => handleThresholdChange("medium_temp", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-hospital-inputBorder rounded text-xs text-hospital-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-hospital-body uppercase mb-1">Systolic BP High</label>
                <input
                  type="number"
                  value={thresholds.high_bp}
                  onChange={(e) => handleThresholdChange("high_bp", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-hospital-inputBorder rounded text-xs text-hospital-body"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-hospital-body uppercase mb-1">Systolic BP Med</label>
                <input
                  type="number"
                  value={thresholds.medium_bp}
                  onChange={(e) => handleThresholdChange("medium_bp", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-hospital-inputBorder rounded text-xs text-hospital-body"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-hospital-body uppercase mb-1">SpO2 High Risk (&lt;)</label>
                <input
                  type="number"
                  value={thresholds.high_spo2}
                  onChange={(e) => handleThresholdChange("high_spo2", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-hospital-inputBorder rounded text-xs text-hospital-body"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-hospital-body uppercase mb-1">SpO2 Med Risk (&lt;)</label>
                <input
                  type="number"
                  value={thresholds.medium_spo2}
                  onChange={(e) => handleThresholdChange("medium_spo2", e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-hospital-inputBorder rounded text-xs text-hospital-body"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSavingThresholds}
              className="w-full py-2 bg-hospital-primary hover:bg-hospital-hover disabled:bg-slate-400 text-white font-bold rounded text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{isSavingThresholds ? "Saving..." : "Save Thresholds"}</span>
            </button>
          </form>
        </div>
      </div>

      {/* Patient Database Table */}
      <div className="bg-white rounded-xl border border-hospital-border shadow-hospital overflow-hidden">
        
        {/* Table Header Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-b border-hospital-border gap-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-hospital-primary" />
            <h2 className="text-lg font-bold text-hospital-heading">Roster Audit Ledger</h2>
          </div>

          <button
            onClick={handleExportReport}
            className="px-4 py-2.5 bg-hospital-primary hover:bg-hospital-hover text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report (CSV)</span>
          </button>
        </div>

        {/* Actual Responsive Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="bg-hospital-tableHeader border-b border-hospital-border">
                <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-hospital-heading">Token</th>
                <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-hospital-heading">Name / Demographics</th>
                <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-hospital-heading">Clinic Specialty</th>
                <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-hospital-heading text-center">Risk level</th>
                <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-hospital-heading">Reg Time</th>
                <th className="py-3.5 px-6 text-xs font-bold uppercase tracking-wider text-hospital-heading text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hospital-border">
              {patients.map((patient) => {
                const isHigh = patient.riskLevel === "HIGH";
                const isMed = patient.riskLevel === "MEDIUM";

                return (
                  <tr key={patient.id} className="hover:bg-hospital-tableRowHover transition-colors">
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold bg-slate-100 text-hospital-body border border-slate-200 px-2 py-0.5 rounded">
                        {patient.id}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-hospital-heading text-sm">{patient.name}</div>
                      <div className="text-[11px] text-hospital-subtext font-semibold">{patient.age} yrs &bull; {patient.gender}</div>
                    </td>
                    <td className="py-4 px-6 text-xs font-bold text-hospital-primary">
                      {patient.department}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className="inline-block text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full border"
                        style={{
                          backgroundColor: isHigh ? "#ffebee" : isMed ? "#fff3e0" : "#e8f5e9",
                          color: isHigh ? "#c62828" : isMed ? "#ef6c00" : "#2e7d32",
                          borderColor: isHigh ? "#ffcdd2" : isMed ? "#ffe0b2" : "#c8e6c9"
                        }}
                      >
                        {patient.riskLevel}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-hospital-body font-semibold">
                      {patient.time}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-block text-[10px] font-bold uppercase px-2 py-0.5 rounded border ${
                        patient.status === "WAITING" 
                          ? "bg-amber-50 text-amber-700 border-amber-200" 
                          : patient.status === "CALLED"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : patient.status === "IN_PROGRESS"
                          ? "bg-orange-50 text-orange-700 border-orange-200"
                          : "bg-slate-50 text-slate-500 border-slate-200"
                      }`}>
                        {patient.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {patients.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-sm text-hospital-subtext font-semibold">
                    No registry log found. Add simulated records above.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
