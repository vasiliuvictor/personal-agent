import { Router } from 'express';
import { cronMiddleware } from '../middleware/cron.middleware';
import { runDueAgents } from '../services/scheduler.service';

const router = Router();

router.post('/', cronMiddleware, async (_req, res) => {
  try {
    const result = await runDueAgents();
    res.json(result);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[trigger] Error:', message);
    res.status(500).json({ error: message });
  }
});

export default router;
