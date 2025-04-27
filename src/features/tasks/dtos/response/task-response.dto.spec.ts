import { TaskResponseDto } from './task-response.dto';
import { TaskStatus } from '../../../../shared/enums/task-status.enum';
import { Task } from '../../entities/task.entity';

describe('TaskResponseDto', () => {
  let mockTask: Task;

  beforeEach(() => {
    const currentDate = Date.now();

    mockTask = {
      id: 'task-123',
      userId: 'user-456',
      title: 'Test Task',
      description: 'This is a test description',
      createdAt: currentDate,
      updatedAt: currentDate,
      startAt: currentDate,
      finishAt: currentDate + 86400000,
      finishedAt: currentDate + 2 * 86400000,
      status: TaskStatus.OPEN,
    };
  });

  it('should transform a task entity to response DTO', () => {
    const dto = new TaskResponseDto(mockTask);

    expect(dto.id).toBe(mockTask.id);
    expect(dto.userId).toBe(mockTask.userId);
    expect(dto.title).toBe(mockTask.title);
    expect(dto.description).toBe(mockTask.description);
    expect(dto.status).toBe(mockTask.status);
    expect(dto.createdAt).toBe(new Date(mockTask.createdAt).toISOString());
    expect(dto.updatedAt).toBe(new Date(mockTask.updatedAt).toISOString());
    expect(dto.startAt).toBe(new Date(mockTask.startAt).toISOString());
    expect(dto.finishAt).toBe(new Date(mockTask.finishAt).toISOString());
    if (mockTask.finishedAt) {
      expect(dto.finishedAt).toBe(new Date(mockTask.finishedAt).toISOString());
    }
  });

  it('should handle null finishedAt value', () => {
    mockTask.finishedAt = undefined;
    const dto = new TaskResponseDto(mockTask);
    expect(dto.finishedAt).toBeNull();
  });
});
