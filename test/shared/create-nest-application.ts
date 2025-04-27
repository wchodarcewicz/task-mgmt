import {
  BadRequestException,
  ClassSerializerInterceptor,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TestingModule } from '@nestjs/testing';
import { TaskValidationExceptionFilter } from '../../src/shared/filters/task-validation-exception.filter';

const createNestApplication = (module: TestingModule): INestApplication => {
  const app = module.createNestApplication();
  const reflector = app.get(Reflector);
  app.useGlobalInterceptors(new ClassSerializerInterceptor(reflector));
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
  return app;
};

export default createNestApplication;
