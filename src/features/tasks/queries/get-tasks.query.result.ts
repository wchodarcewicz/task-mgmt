import { Task } from '../entities/task.entity';

export class GetTasksQueryResult {
  constructor(public result: Task[]) {}
}
