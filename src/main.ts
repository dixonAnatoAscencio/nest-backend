import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');


  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  ),

  ServeStaticModule.forRoot({
    rootPath: join(__dirname, '..', 'public'),
    renderPath: '/public',
  })

    await app.listen(process.env.PORT || 3000);
    logger.log(`App running on port ${ process.env.PORT || 3000 }`);
}
bootstrap();
