import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
dotenv.config();

import healthRouter from './routes/health.routes';
import agentsRouter from './routes/agents.routes';
import insightsRouter from './routes/insights.routes';
import triggerRouter from './routes/trigger.routes';
import { runDueAgents } from './services/scheduler.service';

const app = express();
const PORT = process.env['PORT'] || 3000;

app.use(cors({
  origin: process.env['FRONTEND_URL'] ?? true,
  credentials: true,
}));
app.use(express.json());

app.use('/api/health', healthRouter);
app.use('/api/agents', agentsRouter);
app.use('/api/insights', insightsRouter);
app.use('/api/trigger-agents', triggerRouter); // kept for manual testing

// ── Internal scheduler ────────────────────────────────────────────────────────
// Checks the DB every 5 minutes for agents whose next_run_at <= NOW() and runs
// them. No external cron trigger needed — the server manages its own schedule.
const SCHEDULER_INTERVAL_MS = 1 * 60 * 1000; // 5 minutes

async function tick() {
  console.log(`[scheduler] Tick at ${new Date().toISOString()}`);
  try {
    const result = await runDueAgents();
    if (result.ran > 0 || result.errors.length > 0) {
      console.log(`[scheduler] ran=${result.ran} errors=${result.errors.length}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[scheduler] Unexpected error: ${message}`);
  }
}

app.listen(PORT, () => {
  console.log(`AgentScout backend listening on port ${PORT}`);

  // Run once immediately on startup to catch any overdue agents,
  // then repeat on the interval.
  tick();
  setInterval(tick, SCHEDULER_INTERVAL_MS);
});

export default app;
