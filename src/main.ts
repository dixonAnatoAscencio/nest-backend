import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger, ValidationPipe } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

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
  
    //configuracion de swagger
      const config = new DocumentBuilder()
      .setTitle('Teslo RESTFul API')
      .setDescription('Teslo shop endpoints')
      .setVersion('1.0')
      .build();
  
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);


  await app.listen(process.env.PORT || 3000);
    logger.log(`App running on port ${ process.env.PORT || 3000 }`);
}
bootstrap();
