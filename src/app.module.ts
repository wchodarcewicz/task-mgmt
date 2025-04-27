import { Logger, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configs } from 'config';
import { HealthController } from './health.controller';
import { TasksModule } from './features/tasks/tasks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: configs,
      envFilePath: ['.env'],
    }),
    TasksModule,
  ],
  controllers: [HealthController],
  providers: [Logger],
})
export class AppModule {}
