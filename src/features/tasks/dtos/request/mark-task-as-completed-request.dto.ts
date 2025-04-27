import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class MarkTaskAsCompletedRequestDto {
  @ApiProperty({
    type: 'string',
    description: 'Task ID',
    required: true,
    example: '41f00e17-e320-4f35-9dc1-6b2222a96ac2',
  })
  @IsNotEmpty()
  taskId!: string;
}
