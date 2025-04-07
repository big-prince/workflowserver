/* eslint-disable @typescript-eslint/no-floating-promises */
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import appConfig from './configs/env.config';
import { CustomExceptionFilter } from './common/filters/custom-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new CustomExceptionFilter());
  const config: Record<string, any> = app.get(appConfig.KEY);
  const port: number = parseInt(String(config['port']), 10) || 5000;

  //listen
  await app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
  app.enableShutdownHooks();
}
bootstrap();
