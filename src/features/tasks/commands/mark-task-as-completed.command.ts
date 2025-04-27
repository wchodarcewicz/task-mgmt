import { MarkTaskAsCompletedRequestDto } from '../dtos/request/mark-task-as-completed-request.dto';

export class MarkTaskAsCompletedCommand {
  constructor(
    public readonly markTaskAsCompletedDto: MarkTaskAsCompletedRequestDto,
  ) {}
}
