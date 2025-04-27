import { Injectable } from '@nestjs/common';
import { Task } from '../entities/task.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class TaskRepository {
  private tasks = new Map<string, Task>();

  create(task: Task): Task {
    const now = Date.now();
    task.id = randomUUID();
    task.createdAt = now;
    task.updatedAt = now;
    this.tasks.set(task.id, task);
    return task;
  }

  update(task: Task, updatedTask: Partial<Task>): Task | undefined {
    if (!task.id) {
      return undefined;
    }
    const updated = { ...task, ...updatedTask, updatedAt: Date.now() };
    this.tasks.set(task.id, updated);
    return updated;
  }

  findAll(): Task[] {
    return Array.from(this.tasks.values());
  }

  findLastAddedUserTasksInGivenTimePeriod(
    userId: string,
    timePeriod: number,
  ): Task[] {
    const now = Date.now();

    return Array.from(this.tasks.values())
      .filter(
        (task) =>
          task.userId === userId && now - task.createdAt <= timePeriod * 1000,
      )
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  findLastAddedTasksInGivenTimePeriod(timePeriod: number): Task[] {
    const now = Date.now();

    return Array.from(this.tasks.values())
      .filter((task) => now - task.createdAt <= timePeriod * 1000)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  getUserTasks(userId: string): Task[] {
    return Array.from(this.tasks.values()).filter(
      (task) => task.userId === userId,
    );
  }

  findById(id: string): Task | undefined {
    return this.tasks.get(id);
  }

  clear(): void {
    this.tasks.clear();
  }

  delete(id: string): boolean {
    return this.tasks.delete(id);
  }
}
