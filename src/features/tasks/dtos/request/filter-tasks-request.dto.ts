import { ApiProperty } from '@nestjs/swagger';
import { TaskStatus } from '../../../../shared/enums/task-status.enum';
import { IsEnum, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class FilterTasksRequestDto {
  @ApiProperty({
    type: 'number',
    description: 'Task status (1 = OPEN, 2 = FINISHED)',
    required: false,
    enum: TaskStatus,
  })
  @IsEnum(TaskStatus)
  @IsOptional()
  @Transform(({ value }) =>
    typeof value === 'string' ? parseInt(value, 10) : value,
  )
  status?: TaskStatus;

  @ApiProperty({
    type: 'string',
    description: 'User ID',
    required: false,
    example: 'user001',
  })
  @IsOptional()
  userId?: string;
}
