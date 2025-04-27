import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateTaskCommandHandler } from './create-task.command.handler';
import { CreateTaskCommand } from '../commands';
import { TaskRepository } from '../repositories/task.repository';
import { TaskRequirementsService } from '../services/task-requirements.service';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '../../../shared/enums/task-status.enum';

describe('CreateTaskCommandHandler', () => {
  let handler: CreateTaskCommandHandler;
  let taskRepository: jest.Mocked<TaskRepository>;
  let taskRequirementsService: jest.Mocked<TaskRequirementsService>;
  let logger: jest.Mocked<Logger>;

  const mockTask = {
    id: 'task-123',
    title: 'Test Task',
    description: 'Task description',
    status: TaskStatus.OPEN,
    finishAt: new Date().getTime(),
  } as Task;

  const startAtDateString = '2023-12-31T11:59:59Z';
  const finishAtDateString = '2023-12-31T23:59:59Z';
  const timestampStartAt = Date.parse(startAtDateString);
  const timestampFinishAt = Date.parse(finishAtDateString);

  const createTaskDto = {
    title: 'Test Task',
    description: 'Task description',
    userId: 'user-123',
    startAt: startAtDateString,
    finishAt: finishAtDateString,
  };
  const command = new CreateTaskCommand(createTaskDto);

  beforeEach(async () => {
    const loggerMock = {
      log: jest.fn(),
    } as unknown as jest.Mocked<Logger>;

    const taskRepositoryMock = {
      create: jest.fn().mockReturnValue(mockTask),
    } as unknown as jest.Mocked<TaskRepository>;

    const taskRequirementsServiceMock = {
      verifyCreateTaskRequirements: jest.fn(),
    } as unknown as jest.Mocked<TaskRequirementsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateTaskCommandHandler,
        { provide: Logger, useValue: loggerMock },
        { provide: TaskRepository, useValue: taskRepositoryMock },
        {
          provide: TaskRequirementsService,
          useValue: taskRequirementsServiceMock,
        },
      ],
    }).compile();

    handler = module.get<CreateTaskCommandHandler>(CreateTaskCommandHandler);
    taskRepository = module.get(TaskRepository) as jest.Mocked<TaskRepository>;
    taskRequirementsService = module.get(
      TaskRequirementsService,
    ) as jest.Mocked<TaskRequirementsService>;
    logger = module.get(Logger) as jest.Mocked<Logger>;
  });

  it('should be defined', () => {
    expect(handler).toBeDefined();
  });

  describe('execute', () => {
    it('should create a task successfully', async () => {
      const taskEntityMock = { ...mockTask };

      jest.spyOn(Task, 'create').mockReturnValue(taskEntityMock as Task);

      const result = await handler.execute(command);

      expect(logger.log).toHaveBeenCalledWith('CreateTaskCommand executed');
      expect(Task.create).toHaveBeenCalledWith({
        ...createTaskDto,
        status: TaskStatus.OPEN,
        startAt: expect.any(Number),
        finishAt: expect.any(Number),
      });
      expect(
        taskRequirementsService.verifyCreateTaskRequirements,
      ).toHaveBeenCalledWith(taskEntityMock);
      expect(taskRepository.create).toHaveBeenCalledWith(taskEntityMock);
      expect(result).toEqual({ result: mockTask });
    });

    it('should pass task requirements verification', async () => {
      const taskEntityMock = { ...mockTask };
      jest.spyOn(Task, 'create').mockReturnValue(taskEntityMock as Task);

      await handler.execute(command);

      expect(
        taskRequirementsService.verifyCreateTaskRequirements,
      ).toHaveBeenCalledWith(taskEntityMock);
    });

    it('should throw error when task requirements verification fails', async () => {
      const taskEntityMock = { ...mockTask };
      jest.spyOn(Task, 'create').mockReturnValue(taskEntityMock as Task);

      const error = new Error('Task requirements not met');
      taskRequirementsService.verifyCreateTaskRequirements.mockImplementation(
        () => {
          throw error;
        },
      );

      await expect(handler.execute(command)).rejects.toThrow(error);
      expect(
        taskRequirementsService.verifyCreateTaskRequirements,
      ).toHaveBeenCalledWith(taskEntityMock);
      expect(taskRepository.create).not.toHaveBeenCalled();
    });

    it('should properly parse startAt & finishAt date string', async () => {
      await handler.execute(command);

      expect(Task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          startAt: timestampStartAt,
          finishAt: timestampFinishAt,
        }),
      );
    });
  });
});
