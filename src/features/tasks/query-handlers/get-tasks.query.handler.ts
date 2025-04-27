import { Logger } from '@nestjs/common';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetTaskQuery } from '../queries';
import { GetTasksQueryResult } from '../queries/get-tasks.query.result';
import { TaskRepository } from '../repositories/task.repository';

@QueryHandler(GetTaskQuery)
export class GetTasksQueryHandler
  implements IQueryHandler<GetTaskQuery, GetTasksQueryResult>
{
  constructor(
    private readonly logger: Logger,
    private readonly taskRepository: TaskRepository,
  ) {}

  async execute(query: GetTaskQuery): Promise<GetTasksQueryResult> {
    this.logger.log('Query GetTasks executed');

    const { status, userId } = query.payload;

    let tasks = userId
      ? this.taskRepository.getUserTasks(userId)
      : this.taskRepository.findAll();

    if (status) {
      tasks = tasks.filter((task) => task.status === status);
    }

    return new GetTasksQueryResult(tasks);
  }
}
