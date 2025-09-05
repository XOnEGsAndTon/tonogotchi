import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app.module';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  // Fallback for favicon only; root is served by ServeStatic
  const expressApp: any = (app as any).getHttpAdapter().getInstance();
  expressApp.get('/favicon.ico', (_req: any, res: any) => res.status(204).end());
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
  await app.listen(port);
  // eslint-disable-next-line no-console
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();

