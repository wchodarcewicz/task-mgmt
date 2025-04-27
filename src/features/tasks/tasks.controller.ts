import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Query,
  ValidationPipe,
} from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
  ApiQuery,
  ApiOperation,
} from '@nestjs/swagger';
import { CreateTaskCommand } from './commands';
import { CreateTaskRequestDto } from './dtos/request/create-task-request.dto';
import { GetTaskQuery } from './queries';
import { FilterTasksRequestDto } from './dtos/request/filter-tasks-request.dto';
import { CreateTaskResponseDto } from './dtos/response/create-task-response.dto';
import { ListTaskResponseDto } from './dtos/response/list-task-response.dto';
import { Task } from './entities/task.entity';
import { MarkTaskAsCompletedRequestDto } from './dtos/request/mark-task-as-completed-request.dto';
import { MarkTaskAsCompletedResponseDto } from './dtos/response/mark-task-as-completed-response.dto';
import { MarkTaskAsCompletedCommand } from './commands';

@Controller('tasks')
@ApiTags('tasks')
export class TasksController {
  constructor(
    private readonly queryBus: QueryBus,
    private readonly commandBus: CommandBus,
  ) {}

  @Get()
  @ApiOperation({
    summary: 'Get tasks',
    description: 'Retrieve tasks filtered by status and/or user',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    type: Number,
    description: 'Filter by task status',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    type: String,
    description: 'Filter by user ID',
  })
  @ApiOkResponse({
    description: 'Returns list of tasks for given user/status or all.',
    type: [ListTaskResponseDto],
  })
  async getTasks(
    @Query(new ValidationPipe({ transform: true }))
    filter: FilterTasksRequestDto,
  ): Promise<ListTaskResponseDto[]> {
    const { result } = await this.queryBus.execute(
      new GetTaskQuery({
        status: filter.status !== undefined ? Number(filter.status) : undefined,
        userId: filter.userId,
      }),
    );
    return result.map((task: Task) => new ListTaskResponseDto(task));
  }

  @Post()
  @ApiOperation({ summary: 'Create task', description: 'Create a new task' })
  @ApiCreatedResponse({
    description: 'Task successfully created',
    type: CreateTaskResponseDto,
  })
  async createTask(
    @Body(ValidationPipe) createTaskDto: CreateTaskRequestDto,
  ): Promise<CreateTaskResponseDto> {
    const { result } = await this.commandBus.execute(
      new CreateTaskCommand(createTaskDto),
    );
    return new CreateTaskResponseDto(result);
  }

  @Put('mark-as-completed')
  @ApiOperation({
    summary: 'Mark task as completed',
    description: 'Updates a task to completed status',
  })
  @ApiOkResponse({
    description: 'Task successfully marked as completed',
    type: MarkTaskAsCompletedResponseDto,
  })
  async markTaskAsCompleted(
    @Body(ValidationPipe)
    markTaskAsCompletedRequestDto: MarkTaskAsCompletedRequestDto,
  ): Promise<MarkTaskAsCompletedResponseDto> {
    const { result } = await this.commandBus.execute(
      new MarkTaskAsCompletedCommand(markTaskAsCompletedRequestDto),
    );

    return new MarkTaskAsCompletedResponseDto(result);
  }
}
