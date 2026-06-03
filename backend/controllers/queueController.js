import db from '../db/db.js';
import { logAudit } from '../middleware/audit.js';

export const getQueue = (req, res) => {
  try {
    // Select active patients in detail, including vitals and symptoms from the latest entry
    const activeQueue = db.prepare(`
      SELECT qt.id as token_id, qt.token_number, qt.priority, qt.status, qt.risk_level, qt.issued_at, qt.called_at,
             se.temperature, se.systolic_bp, se.diastolic_bp, se.oxygen_level, se.heart_rate, se.symptoms,
             se.name, se.age, se.gender, u.email
      FROM queue_tokens qt
      JOIN users u ON qt.user_id = u.id
      LEFT JOIN symptom_entries se ON se.id = (
        SELECT id FROM symptom_entries 
        WHERE user_id = qt.user_id 
        ORDER BY id DESC LIMIT 1
      )
      WHERE qt.status IN ('WAITING', 'CALLED', 'IN_PROGRESS')
      ORDER BY qt.priority ASC, qt.id ASC
    `).all();

    // Map rows to parse symptoms and format names
    const formattedQueue = activeQueue.map(row => {
      let symptoms = [];
      try {
        symptoms = row.symptoms ? JSON.parse(row.symptoms) : [];
      } catch (e) {
        symptoms = [];
      }

      // Format time string for output
      const timeStr = new Date(row.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      // Determine specialty department based on primary symptoms (replicates determining department on frontend)
      let department = 'General Medicine';
      if (symptoms.includes('Chest Pain') || (symptoms.includes('Breathlessness') && symptoms.includes('Chest Pain'))) {
        department = 'Cardiology';
      } else if (symptoms.includes('Headache') && symptoms.includes('Dizziness')) {
        department = 'Neurology';
      } else if (symptoms.includes('Fatigue') && symptoms.includes('Nausea') && !symptoms.includes('Fever')) {
        department = 'Ortho';
      }

      return {
        id: row.token_number,
        db_id: row.token_id,
        name: row.name || 'Anonymous Patient',
        age: row.age || 30,
        gender: row.gender || 'Other',
        riskLevel: row.risk_level,
        score: 0.85, // Default fallback score if missing
        symptoms,
        vitals: {
          temp: row.temperature || 98.6,
          bp: row.systolic_bp || 120,
          pulse: row.heart_rate || 80,
          spo2: row.oxygen_level || 98
        },
        department,
        status: row.status,
        time: timeStr,
        timestamp: new Date(row.issued_at).getTime()
      };
    });

    // Let's populate the score from risk_scores for each active queue member
    formattedQueue.forEach(item => {
      const scoreRow = db.prepare(`
        SELECT score FROM risk_scores 
        WHERE user_id = (SELECT id FROM users WHERE email = (SELECT email FROM users u JOIN queue_tokens qt ON qt.user_id = u.id WHERE qt.token_number = ?))
        ORDER BY id DESC LIMIT 1
      `).get(item.id);
      
      if (scoreRow) {
        item.score = scoreRow.score;
      }
    });

    return res.status(200).json(formattedQueue);
  } catch (err) {
    console.error('Get Queue Error:', err);
    return res.status(500).json({ error: 'An error occurred while fetching the patient queue.' });
  }
};

export const callNext = (req, res) => {
  const doctorUserId = req.user.id;

  try {
    // Find the next waiting patient (highest priority = lowest number, oldest registration = lowest id)
    const nextPatient = db.prepare(`
      SELECT * FROM queue_tokens 
      WHERE status = 'WAITING' 
      ORDER BY priority ASC, id ASC 
      LIMIT 1
    `).get();

    if (!nextPatient) {
      return res.status(200).json({ active: false, message: 'No pending patients in the waiting queue.' });
    }

    const calledAt = new Date().toISOString();
    // Update status to 'CALLED'
    db.prepare(`
      UPDATE queue_tokens 
      SET status = 'CALLED', called_at = ? 
      WHERE id = ?
    `).run(calledAt, nextPatient.id);

    logAudit(doctorUserId, `call_patient_${nextPatient.token_number}`, '/api/queue/next');

    return res.status(200).json({
      active: true,
      message: `Patient ${nextPatient.token_number} called.`,
      token: nextPatient.token_number
    });
  } catch (err) {
    console.error('Call Next Error:', err);
    return res.status(500).json({ error: 'An error occurred while calling the next patient.' });
  }
};

export const escalate = (req, res) => {
  const doctorUserId = req.user.id;
  const { tokenId } = req.params;

  try {
    // Find token by token_number or db id
    const token = db.prepare(`
      SELECT * FROM queue_tokens 
      WHERE token_number = ? OR id = ?
    `).get(tokenId, tokenId);

    if (!token) {
      return res.status(404).json({ error: 'Triage token not found.' });
    }

    // Update to priority 1 and risk level HIGH
    db.prepare(`
      UPDATE queue_tokens 
      SET priority = 1, risk_level = 'HIGH' 
      WHERE id = ?
    `).run(token.id);

    logAudit(doctorUserId, `escalate_patient_${token.token_number}`, `/api/queue/escalate/${tokenId}`);

    return res.status(200).json({
      message: `Patient ${token.token_number} has been escalated to Priority 1 (HIGH).`,
      token_number: token.token_number
    });
  } catch (err) {
    console.error('Escalate Error:', err);
    return res.status(500).json({ error: 'An error occurred during patient escalation.' });
  }
};

export const updateStatus = (req, res) => {
  const userId = req.user.id;
  const { tokenId } = req.params;
  const { status } = req.body;

  if (!status || !['WAITING', 'CALLED', 'IN_PROGRESS', 'COMPLETED'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (WAITING, CALLED, IN_PROGRESS, COMPLETED) is required.' });
  }

  try {
    const token = db.prepare(`
      SELECT * FROM queue_tokens 
      WHERE token_number = ? OR id = ?
    `).get(tokenId, tokenId);

    if (!token) {
      return res.status(404).json({ error: 'Triage token not found.' });
    }

    db.prepare(`
      UPDATE queue_tokens 
      SET status = ? 
      WHERE id = ?
    `).run(status, token.id);

    logAudit(userId, `update_status_${token.token_number}_to_${status}`, `/api/queue/status/${tokenId}`);

    return res.status(200).json({
      message: `Triage token ${token.token_number} status updated to ${status}.`,
      token_number: token.token_number,
      status
    });
  } catch (err) {
    console.error('Update Status Error:', err);
    return res.status(500).json({ error: 'An error occurred while updating token status.' });
  }
};
