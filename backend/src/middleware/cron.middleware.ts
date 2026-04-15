import { Request, Response, NextFunction } from 'express';

export function cronMiddleware(req: Request, res: Response, next: NextFunction): void {
  const secret = req.headers['x-cron-secret'];

  if (!secret || secret !== process.env['CRON_SECRET']) {
    res.status(403).json({ error: 'Forbidden' });
    return;
  }

  next();
}
