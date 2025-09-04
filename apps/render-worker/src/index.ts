import Redis from 'ioredis';
import { render, RenderJob } from '@tonogotchi/renderer';

const QUEUE_KEY = process.env.RENDER_QUEUE || 'render_jobs';
const redisUrl = process.env.REDIS_URL || '';
const redis = new Redis(redisUrl);

async function uploadToIPFS(_paths: { cover: string; anim?: string }) {
  // TODO: implement storage upload using Pinata/web3.storage/TON Storage
  return { cid: 'bafyUPLOAD_PLACEHOLDER' };
}

async function notifyCallback(url: string, payload: any) {
  try {
    await fetch(url, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload) });
  } catch (e) {
    console.error('callback failed', e);
  }
}

async function loop() {
  console.log('Render-worker listening...');
  // eslint-disable-next-line no-constant-condition
  while (true) {
    try {
      const res = await redis.blpop(QUEUE_KEY, 10);
      if (!res) continue;
      const [, raw] = res;
      const job = JSON.parse(raw) as RenderJob & { id?: string };
      console.log('Processing job', job.id || 'no-id');
      const out = await render(job);
      const uploaded = await uploadToIPFS({ cover: out.cover, anim: out.anim });
      const result = { jobId: job.id, cid: uploaded.cid, cover: out.cover, anim: out.anim };
      if (job.callbackUrl) await notifyCallback(job.callbackUrl, result);
      console.log('Rendered', result);
    } catch (e) {
      console.error('render error', e);
    }
  }
}

loop().catch((e) => { console.error(e); process.exit(1); });

