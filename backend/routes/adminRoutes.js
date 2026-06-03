import express from 'express';
import { getDashboardStats, getReports, updateThresholds, resetDatabase } from '../controllers/adminController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);
router.use(requireRole('admin'));

router.get('/dashboard', getDashboardStats);
router.get('/reports', getReports);
router.put('/thresholds', updateThresholds);
router.post('/reset', resetDatabase);

export default router;
