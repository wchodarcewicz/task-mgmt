import { Logger, Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { CommandHandlers } from './commands-handlers';
import { QueryHandlers } from './query-handlers';
import { TasksController } from './tasks.controller';
import { Repositories } from './repositories';
import { TaskRepository } from './repositories/task.repository';
import { TaskRequirementsService } from './services/task-requirements.service';

@Module({
  imports: [CqrsModule],
  controllers: [TasksController],
  providers: [
    ...QueryHandlers,
    ...CommandHandlers,
    ...Repositories,
    Logger,
    TaskRequirementsService,
  ],
  exports: [TaskRepository],
})
export class TasksModule {}
