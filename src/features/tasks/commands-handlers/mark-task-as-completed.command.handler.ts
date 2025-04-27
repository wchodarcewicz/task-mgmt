import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { TaskRepository } from '../repositories/task.repository';
import { MarkTaskAsCompletedCommand } from '../commands';
import { TaskStatus } from '../../../shared/enums/task-status.enum';
import { Task } from '../entities/task.entity';
import { TaskRequirementsService } from '../services/task-requirements.service';
import { TaskNotExistException } from '../exceptions/task.exceptions';

@CommandHandler(MarkTaskAsCompletedCommand)
export class MarkTaskAsCompletedCommandHandler
  implements ICommandHandler<MarkTaskAsCompletedCommand>
{
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
    private readonly taskRequirementsService: TaskRequirementsService,
  ) {}

  async execute(
    command: MarkTaskAsCompletedCommand,
  ): Promise<{ result: Task }> {
    this.logger.log(`MarkTaskAsCompletedCommand executed`);

    const { markTaskAsCompletedDto } = command;

    const { taskId } = markTaskAsCompletedDto;

    const taskEntity = this.taskRepository.findById(taskId);

    if (!taskEntity) {
      throw new TaskNotExistException();
    }

    this.taskRequirementsService.verifyMarkTaskAsCompletedRequirements(
      taskEntity,
    );

    const task = this.taskRepository.update(taskEntity, {
      status: TaskStatus.COMPLETED,
      finishedAt: Date.now(),
    });

    if (task) {
      return { result: task };
    }

    throw new TaskNotExistException();
  }
}
