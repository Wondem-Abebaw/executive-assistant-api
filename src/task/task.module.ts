import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { TaskSchedulerService } from './task-scheduler.service';
import { EmailModule } from '../email/email.module';

@Module({
  imports: [EmailModule],
  controllers: [TaskController],
  providers: [TaskService, TaskSchedulerService],
  exports: [TaskService],
})
export class TaskModule {}
