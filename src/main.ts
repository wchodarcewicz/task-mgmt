import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory, Reflector } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module';
import winston from 'winston';
import { TaskValidationExceptionFilter } from './shared/filters/task-validation-exception.filter';

async function bootstrap() {
  const app = await createAppWithLogger();
  configureGlobalPipesAndFilters(app);
  configureInterceptors(app);
  configureApiPrefix(app);
  configureSwagger(app);

  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow('app.port'));
}

async function createAppWithLogger(): Promise<INestApplication> {
  return await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [createFileTransport(), createConsoleTransport()],
    }),
  });
}

function createFileTransport() {
  return new winston.transports.File({
    filename: 'logs/application.log',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.json(),
    ),
  });
}

function createConsoleTransport() {
  return new winston.transports.Console({
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.simple(),
    ),
  });
}

function configureGlobalPipesAndFilters(app: INestApplication) {
  app.useGlobalFilters(new TaskValidationExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        return new BadRequestException({
          statusCode: 400,
          message: 'Validation failed',
          errors: errors.map((error) => ({
            property: error.property,
            value: error.value,
            constraints: error.constraints,
          })),
        });
      },
    }),
  );
}

function configureInterceptors(app: INestApplication) {
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
}

function configureApiPrefix(app: INestApplication) {
  app.setGlobalPrefix('api', {});
}

function configureSwagger(app: INestApplication) {
  const configService = app.get(ConfigService);

  const swaggerConfig = new DocumentBuilder()
    .setTitle(configService.getOrThrow('swagger.title'))
    .setDescription(configService.getOrThrow('swagger.description'))
    .setVersion(configService.getOrThrow('swagger.version'))
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(
    configService.getOrThrow('swagger.path'),
    app,
    swaggerDocument,
  );
}

bootstrap();
