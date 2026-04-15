import { Router, Request, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth.middleware';
import { supabaseAdmin } from '../config/supabase';

const router = Router();
router.use(authMiddleware);

// GET /api/agents — list all agents for the authenticated user
router.get('/', async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const { data, error } = await supabaseAdmin
    .from('agents')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }
  res.json(data);
});

// POST /api/agents — create a new agent
router.post('/', async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const { name, keywords, search_frequency, notification_email } = req.body as {
    name: string;
    keywords: string[];
    search_frequency: string;
    notification_email: boolean;
  };

  if (!name || !keywords?.length || !search_frequency) {
    res.status(400).json({ error: 'name, keywords, and search_frequency are required' });
    return;
  }

  const { data, error } = await supabaseAdmin
    .from('agents')
    .insert({
      user_id: userId,
      name,
      keywords,
      search_frequency,
      notification_email: notification_email ?? false,
      next_run_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(201).json(data);
});

// PUT /api/agents/:id — update an agent
router.put('/:id', async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;
  const { name, keywords, search_frequency, notification_email } = req.body as {
    name?: string;
    keywords?: string[];
    search_frequency?: string;
    notification_email?: boolean;
  };

  const { data, error } = await supabaseAdmin
    .from('agents')
    .update({ name, keywords, search_frequency, notification_email })
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

// DELETE /api/agents/:id — delete an agent
router.delete('/:id', async (req: Request, res: Response) => {
  const userId = (req as AuthenticatedRequest).user.id;

  const { error } = await supabaseAdmin
    .from('agents')
    .delete()
    .eq('id', req.params['id'])
    .eq('user_id', userId);

  if (error) {
    res.status(400).json({ error: error.message });
    return;
  }
  res.status(204).send();
});

export default router;
