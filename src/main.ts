// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));

  // Swagger setup
  // const config = new DocumentBuilder()
  //   .setTitle('NestJS App')
  //   .setDescription('API description')
  //   .setVersion('1.0')
  //   .addBearerAuth()
  //   .build();

  const config = new DocumentBuilder()
  .setTitle('NestJS App')
  .setDescription('API description')
  .setVersion('1.0')
  .addOAuth2({
    type: 'oauth2',
    flows: {
      password: {
        tokenUrl: '/auth/login', // endpoint nhận username/password trả về token
        scopes: {},
      },
    },
  })
  .build();


  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();
