import { registerAs } from '@nestjs/config';

export default registerAs('tasks', () => ({
  tasksUserLimit: process.env.TASKS_USER_LIMIT || 5,
  tasksUserTimeLimit: process.env.TASKS_USER_TIME_LIMIT || 60,
  tasksAllLimit: process.env.TASKS_ALL_LIMIT || 20,
  tasksAllTimeLimit: process.env.TASKS_ALL_TIME_LIMIT || 600,
}));
