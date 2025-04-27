import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';
import { Response } from 'express';
import { TaskExceptions } from '../../features/tasks/exceptions/task.exceptions';

@Catch(TaskExceptions)
export class TaskValidationExceptionFilter implements ExceptionFilter {
  catch(exception: TaskExceptions, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(exception.httpStatusCode).json({
      name: exception.name,
      message: exception.message,
      statusCode: exception.httpStatusCode,
    });
  }
}
