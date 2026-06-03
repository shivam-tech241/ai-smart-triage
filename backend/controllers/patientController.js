import axios from 'axios';
import db from '../db/db.js';
import { logAudit } from '../middleware/audit.js';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:5001';

export const submitSymptoms = async (req, res) => {
  const userId = req.user.id;
  const {
    temperature,
    systolic_bp,
    diastolic_bp,
    oxygen_level,
    heart_rate,
    symptoms = [],
    name,
    age,
    gender
  } = req.body;

  if (temperature === undefined || systolic_bp === undefined || diastolic_bp === undefined || oxygen_level === undefined || heart_rate === undefined) {
    return res.status(400).json({ error: 'All vitals (temperature, systolic_bp, diastolic_bp, oxygen_level, heart_rate) are required.' });
  }

  try {
    // 1. Call Python Flask AI service
    const aiResponse = await axios.post(`${AI_SERVICE_URL}/predict`, {
      temperature: parseFloat(temperature),
      systolic_bp: parseInt(systolic_bp),
      diastolic_bp: parseInt(diastolic_bp),
      oxygen_level: parseInt(oxygen_level),
      heart_rate: parseInt(heart_rate)
    });

    const { risk_level, risk_score, confidence } = aiResponse.data;

    // 2. Fallbacks for demographic details from user profile if not provided
    let patientName = name;
    let patientAge = age;
    let patientGender = gender;

    if (!patientName) {
      const user = db.prepare('SELECT name FROM users WHERE id = ?').get(userId);
      patientName = user ? user.name : 'Anonymous Patient';
    }

    // 3. Save to symptom_entries
    const insertSymptom = db.prepare(`
      INSERT INTO symptom_entries (user_id, temperature, systolic_bp, diastolic_bp, oxygen_level, heart_rate, symptoms, name, age, gender)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const symptomResult = insertSymptom.run(
      userId,
      parseFloat(temperature),
      parseInt(systolic_bp),
      parseInt(diastolic_bp),
      parseInt(oxygen_level),
      parseInt(heart_rate),
      JSON.stringify(symptoms),
      patientName,
      patientAge ? parseInt(patientAge) : 30,
      patientGender || 'Other'
    );
    const entryId = symptomResult.lastInsertRowid;

    // 4. Save to risk_scores
    const insertRisk = db.prepare(`
      INSERT INTO risk_scores (user_id, entry_id, score, level, confidence)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertRisk.run(userId, entryId, risk_score / 100, risk_level, confidence);

    // 5. Generate and assign queue token
    // Count all generated tokens to make the next unique token number
    const countResult = db.prepare('SELECT COUNT(*) as count FROM queue_tokens').get();
    const nextTokenNum = countResult.count + 1;
    const tokenNumber = `T-${String(nextTokenNum).padStart(3, '0')}`;

    // Map priority: HIGH -> 1, MEDIUM -> 2, LOW -> 3
    let priority = 3;
    if (risk_level === 'HIGH') priority = 1;
    else if (risk_level === 'MEDIUM') priority = 2;

    const insertToken = db.prepare(`
      INSERT INTO queue_tokens (token_number, user_id, priority, status, risk_level)
      VALUES (?, ?, ?, ?, ?)
    `);
    insertToken.run(tokenNumber, userId, priority, 'WAITING', risk_level);

    logAudit(userId, 'submit_symptoms', '/api/patient/symptoms');

    return res.status(201).json({
      message: 'Symptom analysis completed and token issued successfully.',
      token_number: tokenNumber,
      risk_level,
      risk_score,
      confidence,
      priority,
      status: 'WAITING'
    });
  } catch (err) {
    console.error('Symptom Submission Error:', err);
    return res.status(500).json({ error: 'An error occurred during symptom triage analysis.' });
  }
};

export const getStatus = (req, res) => {
  const userId = req.user.id;

  try {
    // Find the user's latest token which is not completed
    const token = db.prepare(`
      SELECT * FROM queue_tokens 
      WHERE user_id = ? AND status IN ('WAITING', 'CALLED', 'IN_PROGRESS')
      ORDER BY id DESC LIMIT 1
    `).get(userId);

    if (!token) {
      return res.status(200).json({ active: false, message: 'No active triage token found.' });
    }

    // Get the corresponding risk score details
    const risk = db.prepare(`
      SELECT * FROM risk_scores 
      WHERE user_id = ? 
      ORDER BY id DESC LIMIT 1
    `).get(userId);

    // Calculate queue position if status is WAITING
    let position = 0;
    if (token.status === 'WAITING') {
      const positionResult = db.prepare(`
        SELECT COUNT(*) as count FROM queue_tokens
        WHERE status = 'WAITING'
          AND (priority < ? OR (priority = ? AND id < ?))
      `).get(token.priority, token.priority, token.id);
      
      position = positionResult.count + 1;
    }

    return res.status(200).json({
      active: true,
      token_number: token.token_number,
      status: token.status,
      risk_level: token.risk_level,
      risk_score: risk ? Math.round(risk.score * 100) : 0,
      confidence: risk ? risk.confidence : 0,
      priority: token.priority,
      position,
      issued_at: token.issued_at,
      called_at: token.called_at
    });
  } catch (err) {
    console.error('Get Status Error:', err);
    return res.status(500).json({ error: 'An error occurred while fetching your triage status.' });
  }
};
