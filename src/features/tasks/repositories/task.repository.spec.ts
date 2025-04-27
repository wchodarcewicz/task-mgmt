import { Test, TestingModule } from '@nestjs/testing';
import { TaskRepository } from './task.repository';
import { Task } from '../entities/task.entity';

describe('TaskRepository', () => {
  let repository: TaskRepository;
  let baseTime: number;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TaskRepository],
    }).compile();

    repository = module.get<TaskRepository>(TaskRepository);
    repository.clear();

    baseTime = 1000000000000; // Use a fixed timestamp for predictability
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  const mockTime = (offsetMs = 0) => {
    jest.spyOn(Date, 'now').mockImplementation(() => baseTime + offsetMs);
  };

  const createTestTask = (title: string, userId: string, timeOffset = 0) => {
    mockTime(timeOffset);
    return repository.create({ title, userId } as Task);
  };

  describe('create', () => {
    it('should create a task with generated id and timestamps', () => {
      mockTime();
      const task = { title: 'Test task', userId: 'user-1' } as Task;

      const result = repository.create(task);

      expect(result.id).toBeDefined();
      expect(result.createdAt).toBeDefined();
      expect(result.updatedAt).toBeDefined();
      expect(result.title).toBe('Test task');
      expect(result.userId).toBe('user-1');
    });
  });

  describe('update', () => {
    it('should update an existing task', () => {
      const task = createTestTask('Original task', 'user-1');
      const originalCreatedAt = task.createdAt;

      mockTime(100);
      const result = repository.update(task, { title: 'Updated task' });

      expect(result).toBeDefined();
      expect(result?.title).toBe('Updated task');
      expect(result?.userId).toBe('user-1');
      expect(result?.createdAt).toBe(originalCreatedAt);
      expect(result?.updatedAt).toBeGreaterThan(originalCreatedAt);
    });

    it('should return undefined if task has no id', () => {
      const task = { title: 'No ID task', userId: 'user-1' } as Task;

      const result = repository.update(task, { title: 'Updated task' });

      expect(result).toBeUndefined();
    });
  });

  describe('findAll', () => {
    it('should return all tasks', () => {
      createTestTask('Task 1', 'user-1');
      createTestTask('Task 2', 'user-2');

      const result = repository.findAll();

      expect(result).toHaveLength(2);
      expect(result.map((t) => t.title)).toEqual(
        expect.arrayContaining(['Task 1', 'Task 2']),
      );
    });

    it('should return empty array when no tasks exist', () => {
      const result = repository.findAll();

      expect(result).toEqual([]);
    });
  });

  describe('findLastAddedUserTasksInGivenTimePeriod', () => {
    it('should return user tasks created within the time period', () => {
      const userId = 'user-1';

      mockTime(0);
      const task1 = createTestTask('Recent task', userId);

      mockTime(-120 * 1000); // 2 minutes ago
      const task2 = createTestTask('Older task', userId, -120 * 1000);

      mockTime(0);
      createTestTask('Other user task', 'user-2');

      // Get tasks from last 5 minutes
      const result = repository.findLastAddedUserTasksInGivenTimePeriod(
        userId,
        300,
      );

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe(task1.id); // Most recent first
      expect(result[1].id).toBe(task2.id);

      // Get tasks from last 1 minute
      const recentResult = repository.findLastAddedUserTasksInGivenTimePeriod(
        userId,
        60,
      );

      expect(recentResult).toHaveLength(1);
      expect(recentResult[0].id).toBe(task1.id);
    });
  });

  describe('findLastAddedTasksInGivenTimePeriod', () => {
    it('should return all tasks created within the time period', () => {
      const task1 = createTestTask('Recent task 1', 'user-1');

      mockTime(1);
      const task2 = createTestTask('Recent task 2', 'user-2', 1);

      mockTime(-120 * 1000); // 2 minutes ago
      const task3 = createTestTask('Older task', 'user-1', -120 * 1000);

      mockTime(0);

      // Get tasks from last 5 minutes
      const result = repository.findLastAddedTasksInGivenTimePeriod(300);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe(task2.id);
      expect(result[1].id).toBe(task1.id);
      expect(result[2].id).toBe(task3.id);

      // Get tasks from last 1 minute
      const recentResult = repository.findLastAddedTasksInGivenTimePeriod(60);

      expect(recentResult).toHaveLength(2);
      expect(recentResult[0].id).toBe(task2.id);
      expect(recentResult[1].id).toBe(task1.id);
    });
  });

  describe('getUserTasks', () => {
    it('should return tasks for specific user', () => {
      const userId = 'user-1';
      createTestTask('User 1 Task 1', userId);
      createTestTask('User 1 Task 2', userId);
      createTestTask('User 2 Task', 'user-2');

      const result = repository.getUserTasks(userId);

      expect(result).toHaveLength(2);
      expect(result.every((task) => task.userId === userId)).toBe(true);
    });
  });

  describe('findById', () => {
    it('should return task by id', () => {
      const task = createTestTask('Find me', 'user-1');
      createTestTask('Not me', 'user-2');

      const result = repository.findById(task.id);

      expect(result).toBeDefined();
      expect(result?.id).toBe(task.id);
      expect(result?.title).toBe('Find me');
    });

    it('should return undefined for non-existent id', () => {
      createTestTask('Some task', 'user-1');

      const result = repository.findById('non-existent-id');

      expect(result).toBeUndefined();
    });
  });

  describe('delete', () => {
    it('should delete a task and return true', () => {
      const task = createTestTask('Delete me', 'user-1');

      const result = repository.delete(task.id);
      const deletedTask = repository.findById(task.id);

      expect(result).toBe(true);
      expect(deletedTask).toBeUndefined();
    });

    it('should return false for non-existent id', () => {
      const result = repository.delete('non-existent-id');

      expect(result).toBe(false);
    });
  });

  describe('clear', () => {
    it('should remove all tasks', () => {
      createTestTask('Task 1', 'user-1');
      createTestTask('Task 2', 'user-2');

      expect(repository.findAll()).toHaveLength(2);

      repository.clear();

      expect(repository.findAll()).toHaveLength(0);
    });
  });
});
