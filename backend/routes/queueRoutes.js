import express from 'express';
import { getQueue, callNext, escalate, updateStatus } from '../controllers/queueController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(verifyToken);

router.get('/', requireRole(['doctor', 'admin']), getQueue);
router.post('/next', requireRole('doctor'), callNext);
router.post('/escalate/:tokenId', requireRole('doctor'), escalate);
router.put('/status/:tokenId', requireRole(['doctor', 'admin']), updateStatus);

export default router;
