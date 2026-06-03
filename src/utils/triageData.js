// Seed Data
export const DEFAULT_PATIENTS = [
  {
    id: "T-001",
    name: "Rahul Sharma",
    age: 45,
    gender: "Male",
    riskLevel: "HIGH",
    score: 0.92,
    symptoms: ["Chest Pain", "Breathlessness"],
    vitals: { temp: 98.6, bp: 140, pulse: 90, spo2: 95 },
    department: "Cardiology",
    status: "Pending",
    time: "10:05 AM",
    timestamp: Date.now() - 25 * 60000, // 25 mins ago
  },
  {
    id: "T-002",
    name: "Priya Singh",
    age: 32,
    gender: "Female",
    riskLevel: "MEDIUM",
    score: 0.58,
    symptoms: ["Fever", "Headache", "Vomiting"],
    vitals: { temp: 100.5, bp: 120, pulse: 80, spo2: 98 },
    department: "General Medicine",
    status: "Pending",
    time: "10:12 AM",
    timestamp: Date.now() - 18 * 60000, // 18 mins ago
  },
  {
    id: "T-003",
    name: "Amit Kumar",
    age: 28,
    gender: "Male",
    riskLevel: "LOW",
    score: 0.22,
    symptoms: ["Fatigue", "Nausea"],
    vitals: { temp: 98.2, bp: 115, pulse: 70, spo2: 99 },
    department: "General Medicine",
    status: "Pending",
    time: "10:18 AM",
    timestamp: Date.now() - 12 * 60000, // 12 mins ago
  },
  {
    id: "T-004",
    name: "Sunita Devi",
    age: 60,
    gender: "Female",
    riskLevel: "HIGH",
    score: 0.94,
    symptoms: ["Chest Pain"],
    vitals: { temp: 98.4, bp: 130, pulse: 85, spo2: 88 },
    department: "Cardiology",
    status: "Pending",
    time: "10:22 AM",
    timestamp: Date.now() - 8 * 60000, // 8 mins ago
  },
  {
    id: "T-005",
    name: "Mohit Verma",
    age: 35,
    gender: "Male",
    riskLevel: "MEDIUM",
    score: 0.62,
    symptoms: ["Fever", "Dizziness"],
    vitals: { temp: 102.0, bp: 122, pulse: 95, spo2: 97 },
    department: "General Medicine",
    status: "Pending",
    time: "10:25 AM",
    timestamp: Date.now() - 5 * 60000, // 5 mins ago
  }
];

// Helper to load or initialize patients state in localStorage
export const getPatients = () => {
  const data = localStorage.getItem("triage_patients");
  if (!data) {
    localStorage.setItem("triage_patients", JSON.stringify(DEFAULT_PATIENTS));
    return DEFAULT_PATIENTS;
  }
  return JSON.parse(data);
};

// Helper to save patients to localStorage
export const savePatients = (patients) => {
  localStorage.setItem("triage_patients", JSON.stringify(patients));
};

// Helper to get general analytics stats
export const getAnalyticsStats = (patients) => {
  const pending = patients.filter(p => p.status === "Pending");
  
  const highCount = pending.filter(p => p.riskLevel === "HIGH").length;
  const mediumCount = pending.filter(p => p.riskLevel === "MEDIUM").length;
  const lowCount = pending.filter(p => p.riskLevel === "LOW").length;

  return {
    totalQueue: pending.length,
    highCount,
    mediumCount,
    lowCount
  };
};

// Determine department by primary symptoms
export const determineDepartment = (symptoms) => {
  if (symptoms.includes("Chest Pain")) return "Cardiology";
  if (symptoms.includes("Breathlessness") && symptoms.includes("Chest Pain")) return "Cardiology";
  if (symptoms.includes("Headache") && symptoms.includes("Dizziness")) return "Neurology";
  if (symptoms.includes("Fatigue") && symptoms.includes("Nausea") && !symptoms.includes("Fever")) return "Ortho";
  return "General Medicine";
};

// Rule-based AI triage algorithm
export const runAITriage = (symptoms, vitals) => {
  const { temp, bp, pulse, spo2 } = vitals;
  
  const hasChestPain = symptoms.includes("Chest Pain");
  const hasFever = symptoms.includes("Fever");
  
  // High risk conditions: chest pain selected OR SpO2 < 90 OR BP > 180 OR pulse > 120
  const isHigh = hasChestPain || spo2 < 90 || bp > 180 || pulse > 120;
  
  // Medium risk conditions: fever selected + 2 or more other symptoms OR temperature > 101
  const isMedium = !isHigh && (
    (hasFever && symptoms.length >= 3) || // Fever + 2 or more other symptoms (total 3 or more symptoms)
    temp > 101
  );

  let riskLevel = "LOW";
  let scoreRange = [0.10, 0.35];
  let tokenPrefix = "P3";
  let statusMessage = "You are in the normal queue";
  let waitRange = "45 - 60 mins";

  if (isHigh) {
    riskLevel = "HIGH";
    scoreRange = [0.85, 0.95];
    tokenPrefix = "P1";
    statusMessage = "Immediate Attention Required";
    waitRange = "0 - 5 mins";
  } else if (isMedium) {
    riskLevel = "MEDIUM";
    scoreRange = [0.45, 0.65];
    tokenPrefix = "P2";
    statusMessage = "Please wait, will be attended soon";
    waitRange = "15 - 30 mins";
  }

  // Generate score in specified range
  const score = +(scoreRange[0] + Math.random() * (scoreRange[1] - scoreRange[0])).toFixed(2);

  return {
    riskLevel,
    score,
    tokenPrefix,
    statusMessage,
    waitRange,
    department: determineDepartment(symptoms)
  };
};
