import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TaskRequirementsService } from './task-requirements.service';
import { TaskRepository } from '../repositories/task.repository';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '../../../shared/enums/task-status.enum';
import {
  GlobalTasksLimitException,
  TaskAlreadyCompletedException,
  TaskFinishAtSmallerThanStartedAtException,
  TaskTimeCollisionException,
  UserTasksLimitException,
} from '../exceptions/task.exceptions';

describe('TaskRequirementsService', () => {
  let service: TaskRequirementsService;
  let taskRepository: jest.Mocked<TaskRepository>;
  let configService: jest.Mocked<ConfigService>;

  const now = Date.now();
  const userId = 'user-123';
  const startAt = now + 1000 * 60 * 5; // 5 minutes ahead
  const finishAt = now + 1000 * 60 * 10; // 10 minutes ahead
  const task = {
    id: 'task-123',
    userId,
    startAt: Date.now() + 1000 * 60 * 5,
    finishAt: Date.now() + 1000 * 60 * 15,
  } as Task;

  beforeEach(async () => {
    const mockTaskRepository = {
      findLastAddedUserTasksInGivenTimePeriod: jest.fn(),
      findLastAddedTasksInGivenTimePeriod: jest.fn(),
      getUserTasks: jest.fn(),
    };

    const mockConfigService = {
      getOrThrow: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TaskRequirementsService,
        { provide: TaskRepository, useValue: mockTaskRepository },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<TaskRequirementsService>(TaskRequirementsService);
    taskRepository = module.get(TaskRepository) as jest.Mocked<TaskRepository>;
    configService = module.get(ConfigService) as jest.Mocked<ConfigService>;

    configService.getOrThrow.mockImplementation((key) => {
      const config = {
        'tasks.tasksUserLimit': 5,
        'tasks.tasksUserTimeLimit': 60,
        'tasks.tasksAllLimit': 20,
        'tasks.tasksAllTimeLimit': 300,
      };
      return config[key] || null;
    });
  });

  describe('verifyCreateTaskRequirements', () => {
    it('should throw UserTasksLimitException when user creates too many tasks in given time period', () => {
      const userTasks = Array(5)
        .fill({})
        .map((_, i) => ({
          id: `task-${i}`,
          userId,
        })) as Task[];

      taskRepository.findLastAddedUserTasksInGivenTimePeriod.mockReturnValue(
        userTasks,
      );
      taskRepository.getUserTasks.mockReturnValue([]);
      taskRepository.findLastAddedTasksInGivenTimePeriod.mockReturnValue([]);

      expect(() => service.verifyCreateTaskRequirements(task)).toThrow(
        UserTasksLimitException,
      );
      expect(
        taskRepository.findLastAddedUserTasksInGivenTimePeriod,
      ).toHaveBeenCalledWith(userId, 60);
    });

    it('should throw TaskTimeCollisionException when task time collides with existing task', () => {
      const existingTasks = [
        {
          id: 'existing-task',
          userId,
          status: TaskStatus.OPEN,
          createdAt: now,
          startAt: startAt + 100 * 60 * 6,
          finishAt: finishAt + 1000 * 60 * 11,
        },
      ] as Task[];

      taskRepository.findLastAddedUserTasksInGivenTimePeriod.mockReturnValue(
        [],
      );
      taskRepository.getUserTasks.mockReturnValue(existingTasks);
      taskRepository.findLastAddedTasksInGivenTimePeriod.mockReturnValue([]);

      expect(() => service.verifyCreateTaskRequirements(task)).toThrow(
        TaskTimeCollisionException,
      );
      expect(taskRepository.getUserTasks).toHaveBeenCalledWith(userId);
    });

    it('should throw GlobalTasksLimitException when global task limit is exceeded', () => {
      const globalTasks = Array(21)
        .fill({})
        .map((_, i) => ({
          id: `global-task-${i}`,
        })) as Task[];

      taskRepository.findLastAddedUserTasksInGivenTimePeriod.mockReturnValue(
        [],
      );
      taskRepository.getUserTasks.mockReturnValue([]);
      taskRepository.findLastAddedTasksInGivenTimePeriod.mockReturnValue(
        globalTasks,
      );

      expect(() => service.verifyCreateTaskRequirements(task)).toThrow(
        GlobalTasksLimitException,
      );
      expect(
        taskRepository.findLastAddedTasksInGivenTimePeriod,
      ).toHaveBeenCalled();
    });

    it('should call verifyStartTimeAfterCreation and throw TaskFinishAtSmallerThanStartedAtException when finishAt is smaller than startAt', () => {
      const invalidTask = {
        ...task,
        startAt: now + 1000 * 60 * 10, // 10 minutes ahead
        finishAt: now + 1000 * 60 * 5, // 5 minutes ahead (earlier than start)
      } as Task;

      taskRepository.findLastAddedUserTasksInGivenTimePeriod.mockReturnValue(
        [],
      );
      taskRepository.getUserTasks.mockReturnValue([]);
      taskRepository.findLastAddedTasksInGivenTimePeriod.mockReturnValue([]);

      expect(() => service.verifyCreateTaskRequirements(invalidTask)).toThrow(
        TaskFinishAtSmallerThanStartedAtException,
      );
    });

    it('should not throw exception when all requirements are met', () => {
      taskRepository.findLastAddedUserTasksInGivenTimePeriod.mockReturnValue(
        [],
      );
      taskRepository.getUserTasks.mockReturnValue([]);
      taskRepository.findLastAddedTasksInGivenTimePeriod.mockReturnValue([]);

      expect(() => service.verifyCreateTaskRequirements(task)).not.toThrow();
    });
  });

  describe('verifyMarkTaskAsCompletedRequirements', () => {
    it('should throw TaskAlreadyCompletedException when task is already completed', () => {
      task.status = TaskStatus.COMPLETED;

      expect(() => service.verifyMarkTaskAsCompletedRequirements(task)).toThrow(
        TaskAlreadyCompletedException,
      );
    });

    it('should not throw exception when task is not completed', () => {
      task.status = TaskStatus.OPEN;

      expect(() =>
        service.verifyMarkTaskAsCompletedRequirements(task),
      ).not.toThrow();
    });
  });

  describe('verifyStartTimeAfterCreation', () => {
    it('should throw TaskFinishAtSmallerThanStartedAtException when finishAt is smaller than startAt', () => {
      const invalidStartAt = now + 1000 * 60 * 10; // 10 minutes ahead
      const invalidFinishAt = now + 1000 * 60 * 5; // 5 minutes ahead (earlier than start)

      expect(() => {
        // Using reflective method to test private method
        (service as any).verifyStartTimeAfterCreation(
          invalidStartAt,
          invalidFinishAt,
        );
      }).toThrow(TaskFinishAtSmallerThanStartedAtException);
    });

    it('should throw TaskFinishAtSmallerThanStartedAtException when finishAt equals startAt', () => {
      const sameTime = now + 1000 * 60 * 10; // Same time for both

      expect(() => {
        // Using reflective method to test private method
        (service as any).verifyStartTimeAfterCreation(sameTime, sameTime);
      }).toThrow(TaskFinishAtSmallerThanStartedAtException);
    });

    it('should not throw exception when finishAt is greater than startAt', () => {
      const validStartAt = now + 1000 * 60 * 5; // 5 minutes ahead
      const validFinishAt = now + 1000 * 60 * 10; // 10 minutes ahead

      expect(() => {
        (service as any).verifyStartTimeAfterCreation(
          validStartAt,
          validFinishAt,
        );
      }).not.toThrow();
    });
  });
});
