import { Logger } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../commands';
import { Task } from '../entities/task.entity';
import { TaskRepository } from '../repositories/task.repository';
import { TaskStatus } from '../../../shared/enums/task-status.enum';
import { TaskRequirementsService } from '../services/task-requirements.service';

@CommandHandler(CreateTaskCommand)
export class CreateTaskCommandHandler
  implements ICommandHandler<CreateTaskCommand>
{
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
    private readonly taskRequirementsService: TaskRequirementsService,
  ) {}

  public async execute(command: CreateTaskCommand): Promise<{ result: Task }> {
    this.logger.log(`CreateTaskCommand executed`);

    const taskEntity = Task.create({
      ...command.createTaskDto,
      status: TaskStatus.OPEN,
      startAt: Date.parse(command.createTaskDto.startAt),
      finishAt: Date.parse(command.createTaskDto.finishAt),
    });

    this.taskRequirementsService.verifyCreateTaskRequirements(taskEntity);

    const task = this.taskRepository.create(taskEntity);

    return { result: task };
  }
}
