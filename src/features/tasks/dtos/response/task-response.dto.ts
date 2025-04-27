import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../../../shared/enums/task-status.enum';
import { Task } from '../../entities/task.entity';

export class TaskResponseDto {
  @ApiProperty({
    type: 'string',
  })
  id: string;

  @ApiProperty({
    type: 'string',
  })
  userId: string;

  @ApiProperty({
    type: 'string',
  })
  title: string;

  @ApiProperty({
    type: 'string',
  })
  description?: string;

  @ApiProperty({
    type: 'string',
  })
  createdAt: string;

  @ApiProperty({
    type: 'string',
  })
  updatedAt: string;

  @ApiProperty({
    type: 'string',
  })
  finishAt: string;

  @ApiProperty({
    type: 'string',
  })
  startAt: string;

  @ApiProperty({
    type: 'string',
  })
  finishedAt?: string | null;

  @ApiProperty({
    type: 'number',
    enum: TaskStatus,
  })
  status: TaskStatus;

  constructor(task: Task) {
    this.id = task.id;
    this.title = task.title;
    this.userId = task.userId;
    this.description = task.description;
    this.createdAt = new Date(task.createdAt).toISOString();
    this.updatedAt = new Date(task.updatedAt).toISOString();
    this.startAt = new Date(task.startAt).toISOString();
    this.finishAt = new Date(task.finishAt).toISOString();
    this.finishedAt = task.finishedAt
      ? new Date(task.finishedAt).toISOString()
      : null;

    this.status = task.status;
  }
}
