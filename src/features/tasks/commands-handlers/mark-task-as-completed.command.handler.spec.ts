import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { TaskRepository } from '../repositories/task.repository';
import { TaskRequirementsService } from '../services/task-requirements.service';
import { MarkTaskAsCompletedCommand } from '../commands';
import { MarkTaskAsCompletedCommandHandler } from './mark-task-as-completed.command.handler';
import { TaskStatus } from '../../../shared/enums/task-status.enum';
import { Task } from '../entities/task.entity';
import { TaskNotExistException } from '../exceptions/task.exceptions';

describe('MarkTaskAsCompletedCommandHandler', () => {
  let commandHandler: MarkTaskAsCompletedCommandHandler;
  let taskRepository: jest.Mocked<TaskRepository>;
  let taskRequirementsService: jest.Mocked<TaskRequirementsService>;

  const taskId = '123';
  const command = new MarkTaskAsCompletedCommand({ taskId });
  const mockTask = { id: taskId, status: TaskStatus.OPEN } as Task;

  beforeEach(async () => {
    const mockTaskRepository = {
      findById: jest.fn(),
      update: jest.fn(),
    };

    const mockTaskRequirementsService = {
      verifyMarkTaskAsCompletedRequirements: jest.fn(),
    };

    const mockLogger = {
      log: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MarkTaskAsCompletedCommandHandler,
        { provide: TaskRepository, useValue: mockTaskRepository },
        {
          provide: TaskRequirementsService,
          useValue: mockTaskRequirementsService,
        },
        { provide: Logger, useValue: mockLogger },
      ],
    }).compile();

    commandHandler = module.get<MarkTaskAsCompletedCommandHandler>(
      MarkTaskAsCompletedCommandHandler,
    );

    taskRepository = module.get(TaskRepository) as jest.Mocked<TaskRepository>;

    taskRequirementsService = module.get(
      TaskRequirementsService,
    ) as jest.Mocked<TaskRequirementsService>;
  });

  describe('execute', () => {
    it('should mark a task as completed successfully', async () => {
      const updatedTask = {
        ...mockTask,
        status: TaskStatus.COMPLETED,
        finishedAt: expect.any(Number),
      };

      taskRepository.findById.mockReturnValue(mockTask);
      taskRepository.update.mockReturnValue(updatedTask);

      const result = await commandHandler.execute(command);

      expect(taskRepository.findById).toHaveBeenCalledWith(taskId);

      expect(
        taskRequirementsService.verifyMarkTaskAsCompletedRequirements,
      ).toHaveBeenCalledWith(mockTask);

      expect(taskRepository.update).toHaveBeenCalledWith(mockTask, {
        status: TaskStatus.COMPLETED,
        finishedAt: expect.any(Number),
      });

      expect(result).toEqual({ result: updatedTask });
    });

    it('should throw TaskNotExistException when task is not found', async () => {
      taskRepository.findById.mockReturnValue(undefined);

      await expect(commandHandler.execute(command)).rejects.toThrow(
        TaskNotExistException,
      );
      expect(taskRepository.update).not.toHaveBeenCalled();
    });

    it('should throw TaskNotExistException when update fails', async () => {
      taskRepository.findById.mockReturnValue(mockTask);
      taskRepository.update.mockReturnValue(undefined);

      await expect(commandHandler.execute(command)).rejects.toThrow(
        TaskNotExistException,
      );
    });
  });
});
