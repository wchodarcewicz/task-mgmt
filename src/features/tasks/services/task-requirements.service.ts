import { Injectable } from '@nestjs/common';
import { TaskRepository } from '../repositories/task.repository';
import { ConfigService } from '@nestjs/config';
import {
  GlobalTasksLimitException,
  TaskAlreadyCompletedException,
  TaskFinishAtSmallerThanStartedAtException,
  TaskTimeCollisionException,
  UserTasksLimitException,
} from '../exceptions/task.exceptions';
import { Task } from '../entities/task.entity';
import { TaskStatus } from '../../../shared/enums/task-status.enum';

@Injectable()
export class TaskRequirementsService {
  constructor(
    private readonly taskRepository: TaskRepository,
    private readonly configService: ConfigService,
  ) {}

  public verifyCreateTaskRequirements(task: Task) {
    this.verifyUserTasksAmountInGivenTimePeriod(task.userId);
    this.verifyStartTimeAfterCreation(task.startAt, task.finishAt);
    this.verifyTaskTimeCollision(task.userId, task.finishAt, task.startAt);
    this.verifyAllTasksAmountInGivenTimePeriod();
  }

  public verifyMarkTaskAsCompletedRequirements(task: Task) {
    this.verifyTaskIsAlreadyCompleted(task.status);
  }

  private verifyTaskIsAlreadyCompleted(currentStatus: TaskStatus): void {
    if (currentStatus === TaskStatus.COMPLETED) {
      throw new TaskAlreadyCompletedException();
    }
  }

  private verifyUserTasksAmountInGivenTimePeriod(userId: string): void {
    const tasksUserTimeLimit = this.configService.getOrThrow(
      'tasks.tasksUserTimeLimit',
    );

    const tasks = this.taskRepository.findLastAddedUserTasksInGivenTimePeriod(
      userId,
      tasksUserTimeLimit,
    );

    const tasksUserLimit = this.configService.getOrThrow(
      'tasks.tasksUserLimit',
    );

    if (tasks.length >= tasksUserLimit) {
      throw new UserTasksLimitException(
        `Cannot create more than ${tasksUserLimit} tasks in a ${tasksUserTimeLimit} seconds`,
      );
    }
  }

  private verifyTaskTimeCollision(
    userId: string,
    finishAt: number,
    startAt: number,
  ): void {
    // we check time collision only for tasks that are not completed
    const tasks = this.taskRepository
      .getUserTasks(userId)
      .filter((task) => task.status !== TaskStatus.COMPLETED);

    if (
      tasks.some(
        (existingTask) =>
          // New task starts before existing task ends AND
          // New task ends after existing task starts
          startAt <= existingTask.finishAt && finishAt >= existingTask.startAt,
      )
    ) {
      throw new TaskTimeCollisionException();
    }
  }

  private verifyStartTimeAfterCreation(
    startAt: number,
    finishAt: number,
  ): void {
    if (finishAt <= startAt) {
      throw new TaskFinishAtSmallerThanStartedAtException();
    }
  }

  private verifyAllTasksAmountInGivenTimePeriod(): void {
    const tasks = this.taskRepository.findLastAddedTasksInGivenTimePeriod(
      this.configService.getOrThrow('tasks.tasksAllTimeLimit'),
    );

    const tasksAllLimit = this.configService.getOrThrow('tasks.tasksAllLimit');

    const tasksAllTimeLimit = this.configService.getOrThrow(
      'tasks.tasksAllTimeLimit',
    );

    if (tasks.length >= tasksAllLimit) {
      throw new GlobalTasksLimitException(
        `Cannot create more than ${tasksAllLimit} tasks in a ${tasksAllTimeLimit} seconds.`,
      );
    }
  }
}
