import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Fallbacks for root, assets and favicon
  const expressApp: any = (app as any).getHttpAdapter().getInstance();
  expressApp.get('/', (_req: any, res: any) => {
    const a = join(__dirname, '..', 'public', 'index.html');
    const b = join(process.cwd(), 'apps', 'api', 'public', 'index.html');
    res.sendFile(a, (err: any) => {
      if (err) res.sendFile(b);
    });
  });
  expressApp.get('/app/*', (req: any, res: any) => {
    const rel = req.path.replace(/^\/app\//, '');
    const a = join(__dirname, '..', 'public', 'app', rel);
    const b = join(process.cwd(), 'apps', 'api', 'public', 'app', rel);
    res.sendFile(a, (err: any) => {
      if (err) res.sendFile(b);
    });
  });
  expressApp.get('/favicon.ico', (_req: any, res: any) => {
    const a = join(__dirname, '..', 'public', 'favicon.ico');
    const b = join(process.cwd(), 'apps', 'api', 'public', 'favicon.ico');
    res.sendFile(a, (err: any) => {
      if (err) res.sendFile(b, (err2: any) => {
        if (err2) res.status(204).end();
      });
    });
  });
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();

