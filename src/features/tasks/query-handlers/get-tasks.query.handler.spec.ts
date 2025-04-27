import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GetTaskQuery } from '../queries';
import { GetTasksQueryHandler } from './get-tasks.query.handler';
import { TaskRepository } from '../repositories/task.repository';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '../../../shared/enums/task-status.enum';

describe('GetTasksQueryHandler', () => {
  let handler: GetTasksQueryHandler;
  let taskRepository: TaskRepository;
  let logger: Logger;

  const mockTasks: Task[] = [
    {
      id: '1',
      title: 'Task 1',
      status: TaskStatus.OPEN,
      description: 'Description 1',
      userId: 'user1',
      startAt: Date.now() + 1000 * 60,
      finishAt: Date.now() + 1000 * 60 * 5,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '2',
      title: 'Task 2',
      status: TaskStatus.COMPLETED,
      description: 'Description 2',
      userId: 'user1',
      startAt: Date.now() + 1000 * 60 * 10,
      finishAt: Date.now() + 1000 * 60 * 10,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
    {
      id: '3',
      title: 'Task 3',
      status: TaskStatus.COMPLETED,
      description: 'Description 3',
      userId: 'user2',
      startAt: Date.now() + 1000 * 60 * 8,
      finishAt: Date.now() + 1000 * 60 * 15,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetTasksQueryHandler,
        {
          provide: Logger,
          useValue: {
            log: jest.fn(),
          },
        },
        {
          provide: TaskRepository,
          useValue: {
            findAll: jest.fn().mockReturnValue(mockTasks),
            getUserTasks: jest
              .fn()
              .mockImplementation((userId) =>
                mockTasks.filter((task) => task.userId === userId),
              ),
          },
        },
      ],
    }).compile();

    handler = module.get<GetTasksQueryHandler>(GetTasksQueryHandler);
    taskRepository = module.get<TaskRepository>(TaskRepository);
    logger = module.get<Logger>(Logger);
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  it('should get all tasks when no filters are provided', async () => {
    const query = new GetTaskQuery({ status: undefined, userId: undefined });

    const result = await handler.execute(query);

    expect(taskRepository.findAll).toHaveBeenCalled();
    expect(result.result).toEqual(mockTasks);
    expect(logger.log).toHaveBeenCalledWith('Query GetTasks executed');
  });

  it('should filter tasks by status', async () => {
    const status = TaskStatus.OPEN;
    const query = new GetTaskQuery({ status, userId: undefined });

    const result = await handler.execute(query);

    expect(taskRepository.findAll).toHaveBeenCalled();
    expect(result.result).toEqual(
      mockTasks.filter((task) => task.status === status),
    );
    expect(logger.log).toHaveBeenCalledWith('Query GetTasks executed');
  });

  it('should get tasks for a specific user', async () => {
    const userId = 'user1';
    const query = new GetTaskQuery({ status: undefined, userId });

    const result = await handler.execute(query);

    expect(taskRepository.getUserTasks).toHaveBeenCalledWith(userId);
    expect(result.result).toEqual(
      mockTasks.filter((task) => task.userId === userId),
    );
    expect(logger.log).toHaveBeenCalledWith('Query GetTasks executed');
  });

  it('should get tasks for a specific user filtered by status', async () => {
    const userId = 'user1';
    const status = TaskStatus.COMPLETED;
    const query = new GetTaskQuery({ status, userId });

    const result = await handler.execute(query);

    expect(taskRepository.getUserTasks).toHaveBeenCalledWith(userId);
    expect(result.result).toEqual(
      mockTasks.filter(
        (task) => task.userId === userId && task.status === status,
      ),
    );
    expect(logger.log).toHaveBeenCalledWith('Query GetTasks executed');
  });
});
