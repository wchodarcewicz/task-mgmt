import { validate } from 'class-validator';
import { MarkTaskAsCompletedRequestDto } from './mark-task-as-completed-request.dto';

describe('MarkTaskAsCompletedRequestDto', () => {
  it('should validate with valid taskId', async () => {
    const dto = new MarkTaskAsCompletedRequestDto();
    dto.taskId = '41f00e17-e320-4f35-9dc1-6b2222a96ac2';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation with missing taskId', async () => {
    const dto = new MarkTaskAsCompletedRequestDto();

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should fail validation with empty taskId', async () => {
    const dto = new MarkTaskAsCompletedRequestDto();
    dto.taskId = '';

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints).toHaveProperty('isNotEmpty');
  });

  it('should properly instantiate with constructor parameters', () => {
    const taskId = '41f00e17-e320-4f35-9dc1-6b2222a96ac2';
    const dto = { taskId } as MarkTaskAsCompletedRequestDto;

    expect(dto.taskId).toBe(taskId);
  });
});
