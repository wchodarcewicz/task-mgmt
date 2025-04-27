import { CreateTaskRequestDto } from '../dtos/request/create-task-request.dto';

export class CreateTaskCommand {
  constructor(public readonly createTaskDto: CreateTaskRequestDto) {}
}
