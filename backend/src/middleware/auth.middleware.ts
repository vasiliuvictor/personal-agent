import { Request, Response, NextFunction } from 'express';
import { createClient } from '@supabase/supabase-js';
import { User } from '@supabase/supabase-js';

export interface AuthenticatedRequest extends Request {
  user: User;
  userToken: string;
}

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or malformed authorization header' });
    return;
  }

  const token = authHeader.split(' ')[1];

  // Create a per-request Supabase client with the user's JWT — validates the token
  const supabase = createClient(
    process.env['SUPABASE_URL']!,
    process.env['SUPABASE_ANON_KEY']!
  );

  const { data: { user }, error } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }

  (req as AuthenticatedRequest).user = user;
  (req as AuthenticatedRequest).userToken = token;
  next();
}
