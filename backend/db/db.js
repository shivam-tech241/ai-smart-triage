import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import bcrypt from 'bcryptjs';

const dbDir = path.resolve('backend/db');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'triage.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('patient', 'doctor', 'admin')),
    doctor_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS symptom_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    temperature REAL NOT NULL,
    systolic_bp INTEGER NOT NULL,
    diastolic_bp INTEGER NOT NULL,
    oxygen_level INTEGER NOT NULL,
    heart_rate INTEGER NOT NULL,
    symptoms TEXT NOT NULL, -- JSON string of symptoms
    name TEXT,
    age INTEGER,
    gender TEXT,
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS risk_scores (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    entry_id INTEGER NOT NULL,
    score REAL NOT NULL,
    level TEXT NOT NULL CHECK(level IN ('LOW', 'MEDIUM', 'HIGH')),
    confidence REAL NOT NULL,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(entry_id) REFERENCES symptom_entries(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS queue_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    token_number TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    priority INTEGER NOT NULL CHECK(priority IN (1, 2, 3)),
    status TEXT NOT NULL CHECK(status IN ('WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED')),
    risk_level TEXT NOT NULL CHECK(risk_level IN ('LOW', 'MEDIUM', 'HIGH')),
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    called_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    endpoint TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS thresholds (
    key TEXT PRIMARY KEY,
    value REAL NOT NULL
  );
`);

// Seed initial thresholds
const seedThresholds = () => {
  const stmt = db.prepare('INSERT OR IGNORE INTO thresholds (key, value) VALUES (?, ?)');
  stmt.run('high_temp', 103.0);
  stmt.run('medium_temp', 100.0);
  stmt.run('high_bp', 180.0);
  stmt.run('medium_bp', 140.0);
  stmt.run('high_spo2', 90.0);
  stmt.run('medium_spo2', 95.0);
};

// Seed default users and patients if users table is empty
const seedDatabase = async () => {
  const userCount = db.prepare('SELECT COUNT(*) as count FROM users').get();
  
  if (userCount.count === 0) {
    console.log("Database is empty. Seeding default demo data...");
    
    // Create demo users
    const salt = bcrypt.genSaltSync(10);
    
    const insertUser = db.prepare(`
      INSERT INTO users (name, email, password_hash, role, doctor_id)
      VALUES (?, ?, ?, ?, ?)
    `);
    
    // Hash passwords
    const patientHash = bcrypt.hashSync('1234', salt);
    const doctorHash = bcrypt.hashSync('DOC001', salt); // default password is DOC001
    const adminHash = bcrypt.hashSync('ADMIN123', salt); // default password is ADMIN123
    
    const patientResult = insertUser.run('Rahul Sharma', 'patient@demo.com', patientHash, 'patient', null);
    const doctorResult = insertUser.run('Dr. Sharma', 'doctor@demo.com', doctorHash, 'doctor', 'DOC001');
    const adminResult = insertUser.run('Super Admin', 'admin@demo.com', adminHash, 'admin', null);
    
    const patientId = patientResult.lastInsertRowid;
    const doctorId = doctorResult.lastInsertRowid;
    const adminId = adminResult.lastInsertRowid;
    
    // Also insert other demo users for seeding patients
    const priyaHash = bcrypt.hashSync('1234', salt);
    const amitHash = bcrypt.hashSync('1234', salt);
    const sunitaHash = bcrypt.hashSync('1234', salt);
    const mohitHash = bcrypt.hashSync('1234', salt);
    
    const priyaId = insertUser.run('Priya Singh', 'priya@demo.com', priyaHash, 'patient', null).lastInsertRowid;
    const amitId = insertUser.run('Amit Kumar', 'amit@demo.com', amitHash, 'patient', null).lastInsertRowid;
    const sunitaId = insertUser.run('Sunita Devi', 'sunita@demo.com', sunitaHash, 'patient', null).lastInsertRowid;
    const mohitId = insertUser.run('Mohit Verma', 'mohit@demo.com', mohitHash, 'patient', null).lastInsertRowid;

    // Seed default patient records
    const insertSymptom = db.prepare(`
      INSERT INTO symptom_entries (user_id, temperature, systolic_bp, diastolic_bp, oxygen_level, heart_rate, symptoms, name, age, gender, submitted_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const insertRisk = db.prepare(`
      INSERT INTO risk_scores (user_id, entry_id, score, level, confidence, generated_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const insertToken = db.prepare(`
      INSERT INTO queue_tokens (token_number, user_id, priority, status, risk_level, issued_at)
      VALUES (?, ?, ?, ?, ?, ?)
    `);

    const now = new Date();
    
    // Seed Patient 1 (Rahul Sharma - HIGH)
    const time1 = new Date(now.getTime() - 25 * 60000).toISOString();
    const entry1 = insertSymptom.run(patientId, 98.6, 140, 90, 95, 90, JSON.stringify(["Chest Pain", "Breathlessness"]), "Rahul Sharma", 45, "Male", time1).lastInsertRowid;
    insertRisk.run(patientId, entry1, 0.92, 'HIGH', 0.95, time1);
    insertToken.run('T-001', patientId, 1, 'WAITING', 'HIGH', time1);

    // Seed Patient 2 (Priya Singh - MEDIUM)
    const time2 = new Date(now.getTime() - 18 * 60000).toISOString();
    const entry2 = insertSymptom.run(priyaId, 100.5, 120, 80, 98, 80, JSON.stringify(["Fever", "Headache", "Vomiting"]), "Priya Singh", 32, "Female", time2).lastInsertRowid;
    insertRisk.run(priyaId, entry2, 0.58, 'MEDIUM', 0.88, time2);
    insertToken.run('T-002', priyaId, 2, 'WAITING', 'MEDIUM', time2);

    // Seed Patient 3 (Amit Kumar - LOW)
    const time3 = new Date(now.getTime() - 12 * 60000).toISOString();
    const entry3 = insertSymptom.run(amitId, 98.2, 115, 70, 99, 70, JSON.stringify(["Fatigue", "Nausea"]), "Amit Kumar", 28, "Male", time3).lastInsertRowid;
    insertRisk.run(amitId, entry3, 0.22, 'LOW', 0.90, time3);
    insertToken.run('T-003', amitId, 3, 'WAITING', 'LOW', time3);

    // Seed Patient 4 (Sunita Devi - HIGH)
    const time4 = new Date(now.getTime() - 8 * 60000).toISOString();
    const entry4 = insertSymptom.run(sunitaId, 98.4, 130, 85, 88, 85, JSON.stringify(["Chest Pain"]), "Sunita Devi", 60, "Female", time4).lastInsertRowid;
    insertRisk.run(sunitaId, entry4, 0.94, 'HIGH', 0.96, time4);
    insertToken.run('T-004', sunitaId, 1, 'WAITING', 'HIGH', time4);

    // Seed Patient 5 (Mohit Verma - MEDIUM)
    const time5 = new Date(now.getTime() - 5 * 60000).toISOString();
    const entry5 = insertSymptom.run(mohitId, 102.0, 122, 95, 97, 95, JSON.stringify(["Fever", "Dizziness"]), "Mohit Verma", 35, "Male", time5).lastInsertRowid;
    insertRisk.run(mohitId, entry5, 0.62, 'MEDIUM', 0.85, time5);
    insertToken.run('T-005', mohitId, 2, 'WAITING', 'MEDIUM', time5);

    console.log("Seeding complete.");
  }
};

seedThresholds();
seedDatabase().catch(err => {
  console.error("Error seeding database:", err);
});

export const resetAndSeedDatabase = async () => {
  db.exec(`
    DELETE FROM queue_tokens;
    DELETE FROM risk_scores;
    DELETE FROM symptom_entries;
    DELETE FROM users;
    DELETE FROM thresholds;
  `);
  seedThresholds();
  await seedDatabase();
};

export default db;
