import { TaskStatus } from '../../../shared/enums/task-status.enum';

interface TaskProps {
  title: string;
  userId: string;
  description: string;
  createdAt: number;
  updatedAt: number;
  startAt: number;
  finishAt: number;
  finishedAt?: number;
  status: number;
}

export class Task {
  public id!: string;
  public userId!: string;
  public title!: string;
  public description!: string;
  public createdAt!: number;
  public updatedAt!: number;
  public status!: TaskStatus;
  public startAt!: number;
  public finishAt!: number;
  public finishedAt?: number;

  public static create(data: Partial<TaskProps>): Task {
    const object = new Task();
    Object.assign(object, data);
    return object;
  }
}
