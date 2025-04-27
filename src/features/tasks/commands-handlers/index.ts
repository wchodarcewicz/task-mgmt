import { CreateTaskCommandHandler } from './create-task.command.handler';
import { MarkTaskAsCompletedCommandHandler } from './mark-task-as-completed.command.handler';

export const CommandHandlers = [
  CreateTaskCommandHandler,
  MarkTaskAsCompletedCommandHandler,
];
