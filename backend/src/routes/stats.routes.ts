import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';

const router = Router();
router.use(authMiddleware);

// GET /api/stats — aggregated statistics for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  // Two queries in parallel: agents list + lightweight insight records
  const [agentsResult, insightsResult] = await Promise.all([
    supabaseAdmin
      .from('agents')
      .select('id, name, last_run_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    supabaseAdmin
      .from('insights')
      .select('agent_id, is_read, created_at')
      .eq('user_id', userId),
  ]);

  if (agentsResult.error) {
    res.status(500).json({ error: agentsResult.error.message });
    return;
  }
  if (insightsResult.error) {
    res.status(500).json({ error: insightsResult.error.message });
    return;
  }

  const agents = agentsResult.data ?? [];
  const insights = insightsResult.data ?? [];

  // Per-agent counts
  const insightsPerAgent = agents.map(agent => {
    const agentInsights = insights.filter(i => i.agent_id === agent.id);
    return {
      agentId:   agent.id,
      agentName: agent.name,
      lastRunAt: agent.last_run_at,
      total:     agentInsights.length,
      unread:    agentInsights.filter(i => !i.is_read).length,
    };
  });

  // Insights per day — last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const dayMap: Record<string, number> = {};
  for (const insight of insights) {
    const d = new Date(insight.created_at);
    if (d >= thirtyDaysAgo) {
      const key = insight.created_at.slice(0, 10);
      dayMap[key] = (dayMap[key] ?? 0) + 1;
    }
  }

  const insightsByDay = Object.entries(dayMap)
    .map(([date, count]) => ({ date, count }))
    .sort((a, b) => a.date.localeCompare(b.date));

  res.json({
    totalAgents:     agents.length,
    totalInsights:   insights.length,
    unreadInsights:  insights.filter(i => !i.is_read).length,
    insightsPerAgent,
    insightsByDay,
  });
});

export default router;
