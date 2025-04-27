import { HttpStatus, INestApplication } from '@nestjs/common';
import request from 'supertest';
import createTestingModule from '../../../shared/create-testing-module';
import createNestApplication from '../../../shared/create-nest-application';
import teardownTestSuite from '../../../shared/teardown-test-suite';
import { TaskRepository } from '../../../../src/features/tasks/repositories/task.repository';
import { Task } from '../../../../src/features/tasks/entities/task.entity';
import { TaskStatus } from '../../../../src/shared/enums/task-status.enum';

describe('REST API TasksController', () => {
  let app: INestApplication;
  let taskRepository: TaskRepository;

  const createTaskData = ({
    title = 'Default Task',
    description = 'Default description',
    userId = 'default-user',
    status = TaskStatus.OPEN,
    startAt = '2025-05-24T10:00:00.000Z',
    finishAt = '2025-05-24T14:00:00.000Z',
  } = {}) => ({
    title,
    description,
    userId,
    status,
    startAt: typeof startAt === 'string' ? Date.parse(startAt) : startAt,
    finishAt: typeof finishAt === 'string' ? Date.parse(finishAt) : finishAt,
  });

  const createAndSaveTask = (taskData = {}) => {
    const taskEntity = Task.create(createTaskData(taskData));
    return taskRepository.create(taskEntity);
  };

  const getTasks = (query = {}) => {
    const queryString = Object.entries(query)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');

    return request(app.getHttpServer()).get(
      `/tasks${queryString ? '?' + queryString : ''}`,
    );
  };

  const createTask = (data) => {
    return request(app.getHttpServer()).post('/tasks').send(data);
  };

  const markTaskAsCompleted = (taskId) => {
    return request(app.getHttpServer())
      .put('/tasks/mark-as-completed')
      .send({ taskId });
  };

  beforeAll(async () => {
    const module = await createTestingModule();
    app = createNestApplication(module);
    await app.init();
    taskRepository = module.get(TaskRepository);
  });

  afterEach(() => {
    taskRepository.clear();
  });

  afterAll(() => {
    teardownTestSuite(app);
  });

  describe('GET /tasks', () => {
    it('should return list of tasks', async () => {
      const task = createAndSaveTask();

      await getTasks()
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body).toEqual([
            expect.objectContaining({
              id: task.id,
              title: task.title,
              description: task.description,
              userId: task.userId,
              status: task.status,
            }),
          ]);
          expect(body[0].startAt).toBe(new Date(task.startAt).toISOString());
          expect(body[0].finishAt).toBe(new Date(task.finishAt).toISOString());
          expect(body[0].finishedAt).toBe(null);
        });

      const userTasksCount = taskRepository.getUserTasks(task.userId);
      expect(userTasksCount.length).toEqual(1);
    });

    describe('filtering', () => {
      it('should filter tasks by userId', async () => {
        const user1Id = 'user001';
        const user2Id = 'user002';

        const taskUser1 = createAndSaveTask({
          userId: user1Id,
          title: 'User 1 Task',
        });

        const taskUser2 = createAndSaveTask({
          userId: user2Id,
          title: 'User 2 Task',
        });

        await getTasks({ userId: user1Id })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body.length).toEqual(1);
            expect(body[0].id).toEqual(taskUser1.id);
            expect(body[0].userId).toEqual(user1Id);
          });

        await getTasks({ userId: user2Id })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body.length).toEqual(1);
            expect(body[0].id).toEqual(taskUser2.id);
            expect(body[0].userId).toEqual(user2Id);
          });
      });

      it('should filter tasks by status', async () => {
        const userId = 'user003';

        const taskOpen = createAndSaveTask({
          userId,
          title: 'Open Task',
          status: TaskStatus.OPEN,
        });

        const taskCompleted1 = createAndSaveTask({
          userId,
          title: 'Completed task 1',
          status: TaskStatus.COMPLETED,
        });

        const taskCompleted2 = createAndSaveTask({
          userId,
          title: 'Completed Task 2',
          status: TaskStatus.COMPLETED,
        });

        await getTasks({ status: TaskStatus.OPEN })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body.some((task) => task.id === taskOpen.id)).toBeTruthy();
            expect(
              body.every((task) => task.status === TaskStatus.OPEN),
            ).toBeTruthy();
          });

        await getTasks({ status: TaskStatus.COMPLETED })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body.length).toBeGreaterThanOrEqual(2);
            expect(
              body.some((task) => task.id === taskCompleted1.id),
            ).toBeTruthy();
            expect(
              body.some((task) => task.id === taskCompleted2.id),
            ).toBeTruthy();
            expect(
              body.every((task) => task.status === TaskStatus.COMPLETED),
            ).toBeTruthy();
          });
      });

      it('should filter tasks by both userId and status', async () => {
        const user1Id = 'user004';
        const user2Id = 'user005';

        const user1OpenTask = createAndSaveTask({
          userId: user1Id,
          title: 'User 1 Open Task',
          status: TaskStatus.OPEN,
        });

        createAndSaveTask({
          userId: user1Id,
          title: 'User 1 Completed Task',
          status: TaskStatus.COMPLETED,
        });

        createAndSaveTask({
          userId: user2Id,
          title: 'User 2 Open Task',
          status: TaskStatus.OPEN,
        });

        const user2CompletedTask = createAndSaveTask({
          userId: user2Id,
          title: 'User 2 Completed Task',
          status: TaskStatus.COMPLETED,
        });

        await getTasks({ userId: user1Id, status: TaskStatus.OPEN })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body.length).toEqual(1);
            expect(body[0].id).toEqual(user1OpenTask.id);
            expect(body[0].userId).toEqual(user1Id);
            expect(body[0].status).toEqual(TaskStatus.OPEN);
          });

        await getTasks({ userId: user2Id, status: TaskStatus.COMPLETED })
          .expect(HttpStatus.OK)
          .expect(({ body }) => {
            expect(body.length).toEqual(1);
            expect(body[0].id).toEqual(user2CompletedTask.id);
            expect(body[0].userId).toEqual(user2Id);
            expect(body[0].status).toEqual(TaskStatus.COMPLETED);
          });
      });
    });
  });

  describe('POST /tasks', () => {
    it('should create a new task', async () => {
      const newTaskData = {
        title: 'New Task',
        description: 'Task description',
        userId: 'user001',
        startAt: '2025-05-24T10:00:00.000Z',
        finishAt: '2025-05-24T14:00:00.000Z',
      };

      await createTask(newTaskData)
        .expect(HttpStatus.CREATED)
        .expect(({ body }) => {
          expect(body).toHaveProperty('id');
          expect(body.title).toEqual(newTaskData.title);
          expect(body.description).toEqual(newTaskData.description);
          expect(body.userId).toEqual(newTaskData.userId);
          expect(body.status).toEqual(TaskStatus.OPEN);
          expect(body).toHaveProperty('createdAt');
          expect(body).toHaveProperty('updatedAt');
          expect(new Date(body.finishAt).toISOString()).toEqual(
            newTaskData.finishAt,
          );
        });

      const userTasks = taskRepository.getUserTasks(newTaskData.userId);
      expect(userTasks.length).toEqual(1);
      expect(userTasks[0].title).toEqual(newTaskData.title);
    });

    it('should validate required fields', async () => {
      const invalidTaskData = {
        description: 'Missing title and userId',
      };

      await createTask(invalidTaskData).expect(HttpStatus.BAD_REQUEST);

      const allTasks = taskRepository.findAll();
      expect(allTasks.length).toEqual(0);
    });
  });

  describe('PUT /tasks/mark-as-completed', () => {
    it('should mark a task as completed', async () => {
      const task = createAndSaveTask({
        title: 'Task to complete',
        description: 'This task will be completed',
        userId: 'user002',
      });

      expect(task.status).toEqual(TaskStatus.OPEN);

      await markTaskAsCompleted(task.id)
        .expect(HttpStatus.OK)
        .expect(({ body }) => {
          expect(body.id).toEqual(task.id);
          expect(body.status).toEqual(TaskStatus.COMPLETED);
          expect(new Date(body.updatedAt).getTime()).toBeGreaterThan(
            new Date(task.updatedAt).getTime(),
          );
        });

      const updatedTask = taskRepository.findById(task.id);
      expect(updatedTask).not.toBeNull();
      expect(updatedTask?.status).toEqual(TaskStatus.COMPLETED);
      expect(updatedTask?.finishedAt).toBeDefined();
    });

    it('should return 404 for non-existent task', async () => {
      await markTaskAsCompleted('non-existent-task-id').expect(
        HttpStatus.NOT_FOUND,
      );
    });
  });
});
