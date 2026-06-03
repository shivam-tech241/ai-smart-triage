import db, { resetAndSeedDatabase } from '../db/db.js';
import { logAudit } from '../middleware/audit.js';

export const getDashboardStats = (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    // 1. Total patients today
    const totalTodayResult = db.prepare(`
      SELECT COUNT(*) as count FROM symptom_entries 
      WHERE date(submitted_at) = date('now')
    `).get();
    const totalPatientsToday = totalTodayResult ? totalTodayResult.count : 0;

    // 2. Risk distribution today
    const riskResult = db.prepare(`
      SELECT level, COUNT(*) as count FROM risk_scores
      WHERE date(generated_at) = date('now')
      GROUP BY level
    `).all();

    const riskDistribution = { low: 0, medium: 0, high: 0 };
    riskResult.forEach(row => {
      const levelKey = row.level.toLowerCase();
      if (riskDistribution[levelKey] !== undefined) {
        riskDistribution[levelKey] = row.count;
      }
    });

    // 3. Current queue length
    const queueLengthResult = db.prepare(`
      SELECT COUNT(*) as count FROM queue_tokens
      WHERE status IN ('WAITING', 'CALLED', 'IN_PROGRESS')
    `).get();
    const currentQueueLength = queueLengthResult ? queueLengthResult.count : 0;

    // 4. Available beds (total beds from config minus active patients - CALLED or IN_PROGRESS)
    const activePatientsResult = db.prepare(`
      SELECT COUNT(*) as count FROM queue_tokens
      WHERE status IN ('CALLED', 'IN_PROGRESS')
    `).get();
    const activePatientsCount = activePatientsResult ? activePatientsResult.count : 0;

    // Fetch total beds setting from config
    const totalBedsRow = db.prepare("SELECT value FROM thresholds WHERE key = 'total_beds'").get();
    const totalBeds = totalBedsRow ? parseInt(totalBedsRow.value) : 50;
    const availableBeds = Math.max(0, totalBeds - activePatientsCount);

    // 5. Peak hour of the day
    const peakHourResult = db.prepare(`
      SELECT strftime('%H', submitted_at) as hour, COUNT(*) as count
      FROM symptom_entries
      GROUP BY hour
      ORDER BY count DESC
      LIMIT 1
    `).get();

    let peakHour = 'N/A';
    if (peakHourResult && peakHourResult.hour) {
      const hourInt = parseInt(peakHourResult.hour);
      const ampm = hourInt >= 12 ? 'PM' : 'AM';
      const formattedHour = hourInt % 12 === 0 ? 12 : hourInt % 12;
      peakHour = `${formattedHour}:00 ${ampm}`;
    }

    // 6. Fetch roster (list of all patients) for the table
    const allPatients = db.prepare(`
      SELECT qt.token_number as id, qt.priority, qt.status, qt.risk_level as riskLevel, qt.issued_at,
             se.name, se.age, se.gender, se.symptoms,
             se.temperature, se.systolic_bp, se.diastolic_bp, se.oxygen_level, se.heart_rate
      FROM queue_tokens qt
      JOIN users u ON qt.user_id = u.id
      LEFT JOIN symptom_entries se ON se.id = (
        SELECT id FROM symptom_entries 
        WHERE user_id = qt.user_id 
        ORDER BY id DESC LIMIT 1
      )
      ORDER BY qt.id DESC
    `).all();

    const patientsList = allPatients.map(row => {
      let symptoms = [];
      try {
        symptoms = row.symptoms ? JSON.parse(row.symptoms) : [];
      } catch (e) {
        symptoms = [];
      }

      // Department calculation
      let department = 'General Medicine';
      if (symptoms.includes('Chest Pain')) {
        department = 'Cardiology';
      } else if (symptoms.includes('Headache') && symptoms.includes('Dizziness')) {
        department = 'Neurology';
      } else if (symptoms.includes('Fatigue') && symptoms.includes('Nausea') && !symptoms.includes('Fever')) {
        department = 'Ortho';
      }

      // Get latest score for risk_scores
      const scoreRow = db.prepare(`
        SELECT score FROM risk_scores 
        WHERE user_id = (SELECT id FROM users WHERE email = (SELECT email FROM users u JOIN queue_tokens qt ON qt.user_id = u.id WHERE qt.token_number = ?))
        ORDER BY id DESC LIMIT 1
      `).get(row.id);

      return {
        id: row.id,
        name: row.name || 'Anonymous Patient',
        age: row.age || 30,
        gender: row.gender || 'Other',
        riskLevel: row.riskLevel,
        score: scoreRow ? scoreRow.score : 0.5,
        symptoms,
        vitals: {
          temp: row.temperature || 98.6,
          bp: row.systolic_bp || 120,
          pulse: row.heart_rate || 80,
          spo2: row.oxygen_level || 98
        },
        department,
        status: row.status,
        time: new Date(row.issued_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: new Date(row.issued_at).getTime()
      };
    });

    return res.status(200).json({
      totalPatientsToday,
      riskDistribution,
      currentQueueLength,
      availableBeds,
      totalBeds,
      peakHour,
      patients: patientsList
    });
  } catch (err) {
    console.error('Admin Dashboard Error:', err);
    return res.status(500).json({ error: 'An error occurred while loading dashboard statistics.' });
  }
};

export const getReports = (req, res) => {
  try {
    // Basic summary report
    const summary = db.prepare(`
      SELECT 
        (SELECT COUNT(*) FROM queue_tokens) as total_tickets,
        (SELECT COUNT(*) FROM queue_tokens WHERE status = 'COMPLETED') as completed_tickets,
        (SELECT COUNT(*) FROM queue_tokens WHERE status = 'WAITING') as waiting_tickets,
        (SELECT COUNT(*) FROM queue_tokens WHERE status = 'CALLED') as called_tickets
    `).get();

    // Average wait time (in minutes) for completed/called tokens
    const waitTimeResult = db.prepare(`
      SELECT AVG(strftime('%s', called_at) - strftime('%s', issued_at)) / 60.0 as avg_wait_minutes
      FROM queue_tokens
      WHERE called_at IS NOT NULL
    `).get();

    const avgWaitMinutes = waitTimeResult && waitTimeResult.avg_wait_minutes
      ? Math.round(waitTimeResult.avg_wait_minutes * 10) / 10
      : 0.0;

    return res.status(200).json({
      reportDate: new Date().toLocaleDateString(),
      totalTicketsIssued: summary.total_tickets,
      completedTreatments: summary.completed_tickets,
      currentlyWaiting: summary.waiting_tickets,
      currentlyCalled: summary.called_tickets,
      averageWaitTimeMinutes: avgWaitMinutes,
      description: 'Daily operational status report for AI-Based Smart Triage and Load Optimization system.'
    });
  } catch (err) {
    console.error('Get Reports Error:', err);
    return res.status(500).json({ error: 'An error occurred while compiling reports.' });
  }
};

export const updateThresholds = (req, res) => {
  const userId = req.user.id;
  const thresholds = req.body; // Expect key-value map

  try {
    const insertStmt = db.prepare(`
      INSERT INTO thresholds (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value
    `);

    const transaction = db.transaction((data) => {
      for (const [key, val] of Object.entries(data)) {
        insertStmt.run(key, parseFloat(val));
      }
    });

    transaction(thresholds);

    logAudit(userId, 'update_thresholds', '/api/admin/thresholds');

    return res.status(200).json({
      message: 'Triage risk thresholds updated successfully.',
      thresholds
    });
  } catch (err) {
    console.error('Update Thresholds Error:', err);
    return res.status(500).json({ error: 'An error occurred while updating thresholds.' });
  }
};

export const resetDatabase = async (req, res) => {
  const userId = req.user.id;
  try {
    await resetAndSeedDatabase();
    logAudit(userId, 'reset_database', '/api/admin/reset');
    return res.status(200).json({ message: 'Database reset successfully.' });
  } catch (err) {
    console.error('Reset Database Error:', err);
    return res.status(500).json({ error: 'An error occurred during database reset.' });
  }
};
