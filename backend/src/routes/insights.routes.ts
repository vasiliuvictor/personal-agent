import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';

const router = Router();
router.use(authMiddleware);

// GET /api/insights?page=1&limit=20&agent_id=xxx
router.get('/', async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const limit = Math.min(parseInt(req.query['limit'] as string) || 20, 100);
  const page = Math.max(parseInt(req.query['page'] as string) || 1, 1);
  const agentId = req.query['agent_id'] as string | undefined;
  const unreadOnly = req.query['unread_only'] === 'true';

  let query = supabaseAdmin
    .from('insights')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range((page - 1) * limit, page * limit - 1);

  if (agentId) {
    query = query.eq('agent_id', agentId);
  }
  if (unreadOnly) {
    query = query.eq('is_read', false);
  }

  const { data, error, count } = await query;

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ data, total: count, page, limit });
});

// PATCH /api/insights/:id/read — mark an insight as read
router.patch('/:id/read', async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const { data, error } = await supabaseAdmin
    .from('insights')
    .update({ is_read: true })
    .eq('id', req.params['id'])
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.json(data);
});

export default router;
