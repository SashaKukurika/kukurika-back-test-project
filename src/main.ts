import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as dotenv from 'dotenv';

import { AppModule } from './app.module';

// ?? check its null or undefine
const environment = process.env.NODE_ENV ?? '';
dotenv.config({ path: `environments/${environment}.env` });

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // add swagger
  const config = new DocumentBuilder()
    .setTitle('Project example')
    .setDescription('The Project API description')
    .setVersion('1.0')
    .addTag('project')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  // validation
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(3000);
}
bootstrap();
