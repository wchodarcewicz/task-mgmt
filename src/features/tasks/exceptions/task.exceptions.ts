import { HttpStatus } from '@nestjs/common';

export class TaskExceptions extends Error {
  public readonly httpStatusCode: HttpStatus;

  constructor(message: string, httpStatusCode: HttpStatus) {
    super(message);
    this.name = 'TaskValidationException';
    this.httpStatusCode = httpStatusCode;
  }
}

export class UserTasksLimitException extends TaskExceptions {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
    this.name = 'UserTasksLimitException';
  }
}

export class TaskTimeCollisionException extends TaskExceptions {
  constructor(message?: string) {
    super(
      message ??
        'Task time collision with other user tasks detected. There is already a task added with start & finish dates that covers with new task dates.',
      HttpStatus.CONFLICT,
    );
    this.name = 'TaskTimeCollisionException';
  }
}

export class GlobalTasksLimitException extends TaskExceptions {
  constructor(message: string) {
    super(message, HttpStatus.TOO_MANY_REQUESTS);
    this.name = 'GlobalTasksLimitException';
  }
}

export class TaskAlreadyCompletedException extends TaskExceptions {
  constructor(message?: string) {
    super(
      message ??
        'Task is already completed. Cannot mark it as completed again.',
      HttpStatus.CONFLICT,
    );
    this.name = 'TaskAlreadyCompletedException';
  }
}

export class TaskNotExistException extends TaskExceptions {
  constructor(message?: string) {
    super(message ?? 'Task with given ID not found', HttpStatus.NOT_FOUND);
    this.name = 'TaskNotExistException';
  }
}

export class TaskFinishAtSmallerThanStartedAtException extends TaskExceptions {
  constructor(message?: string) {
    super(
      message ??
        'Task finish date is smaller or equal start date. Please check the dates.',
      HttpStatus.CONFLICT,
    );
    this.name = 'TaskFinishAtSmallerThanStartedAtException';
  }
}
