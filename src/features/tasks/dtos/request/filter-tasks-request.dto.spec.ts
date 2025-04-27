import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { FilterTasksRequestDto } from './filter-tasks-request.dto';
import { TaskStatus } from '../../../../shared/enums/task-status.enum';

describe('FilterTasksRequestDto', () => {
  it('should pass validation when both fields are valid', async () => {
    const dtoData = {
      status: TaskStatus.OPEN,
      userId: 'user001',
    };

    const dto = plainToInstance(FilterTasksRequestDto, dtoData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation when only status is provided', async () => {
    const dtoData = {
      status: TaskStatus.COMPLETED,
    };

    const dto = plainToInstance(FilterTasksRequestDto, dtoData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation when only userId is provided', async () => {
    const dtoData = {
      userId: 'user002',
    };

    const dto = plainToInstance(FilterTasksRequestDto, dtoData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should pass validation when no fields are provided', async () => {
    const dtoData = {};

    const dto = plainToInstance(FilterTasksRequestDto, dtoData);
    const errors = await validate(dto);

    expect(errors.length).toBe(0);
  });

  it('should fail validation when status is invalid', async () => {
    const dtoData = {
      status: 999,
    };

    const dto = plainToInstance(FilterTasksRequestDto, dtoData);
    const errors = await validate(dto);

    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].property).toBe('status');
    expect(errors[0].constraints).toHaveProperty('isEnum');
  });

  it('should correctly transform and validate when given valid enum values', async () => {
    const validValues = [TaskStatus.OPEN, TaskStatus.COMPLETED];

    for (const status of validValues) {
      const dto = plainToInstance(FilterTasksRequestDto, { status });
      const errors = await validate(dto);
      expect(errors.length).toBe(0);
    }
  });
});
