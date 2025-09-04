import express, { Request, Response } from 'express';
import bodyParser from 'body-parser';
import Redis from 'ioredis';

const app = express();
app.use(bodyParser.json());

const QUEUE_KEY = process.env.RENDER_QUEUE || 'render_jobs';
const redisUrl = process.env.REDIS_URL || '';
const secret = process.env.RENDER_WEBHOOK_SECRET || '';
const redis = new Redis(redisUrl);

function auth(req: any) {
  const h = req.headers['authorization'];
  if (!secret) return false;
  if (!h) return false;
  const [type, token] = String(h).split(' ');
  return type === 'Bearer' && token === secret;
}

app.get('/health', (_req: Request, res: Response) => res.json({ ok: true }));

app.post('/render/start', async (req: Request, res: Response) => {
  if (!auth(req)) return res.status(401).json({ error: 'unauthorized' });
  const job = req.body;
  if (!job || !job.kind || !job.dnaSeed) return res.status(400).json({ error: 'bad_request' });
  const jobId = `${Date.now()}_${Math.random().toString(36).slice(2)}`;
  const payload = { id: jobId, receivedAt: new Date().toISOString(), ...job };
  await redis.rpush(QUEUE_KEY, JSON.stringify(payload));
  return res.status(202).json({ accepted: true, jobId });
});

const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
app.listen(port, () => console.log(`Renderer service on :${port}`));
