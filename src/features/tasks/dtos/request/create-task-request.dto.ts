import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, MaxLength } from 'class-validator';

export class CreateTaskRequestDto {
  @ApiProperty({
    type: 'string',
    description: 'Task owner id',
    required: true,
    example: 'user001',
  })
  @MaxLength(20)
  @IsNotEmpty()
  userId!: string;

  @ApiProperty({
    type: 'string',
    description: 'Task title',
    required: true,
    example: 'Some task title',
  })
  @MaxLength(200)
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    type: 'string',
    description: 'Task description',
    example: 'Some description',
  })
  @MaxLength(1000)
  description!: string;

  @ApiProperty({
    type: 'string',
    description: 'Task planned start date/time',
    example: '2025-05-24T12:00:00.000Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  startAt!: string;

  @ApiProperty({
    type: 'string',
    description: 'Task planned finish date/time',
    example: '2025-05-24T14:00:00.000Z',
    required: true,
  })
  @IsDateString()
  @IsNotEmpty()
  finishAt!: string;
}
