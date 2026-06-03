import express from 'express';
import { submitSymptoms, getStatus } from '../controllers/patientController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Apply auth middleware to all patient routes
router.use(verifyToken);

router.post('/symptoms', submitSymptoms);
router.get('/status', getStatus);

export default router;
