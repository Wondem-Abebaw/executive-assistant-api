import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { TaskService } from './task.service';
import { EmailService } from '../email/email.service';

@Injectable()
export class TaskSchedulerService {
  private readonly logger = new Logger(TaskSchedulerService.name);

  constructor(
    private taskService: TaskService,
    private emailService: EmailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async sendTaskReminders() {
    this.logger.log('Running task reminder check...');

    try {
      const upcomingTasks = await this.taskService.getUpcomingTasks(24);
      const tasksNeedingReminders = upcomingTasks.filter(
        (task) => !task.reminderSent,
      );

      for (const task of tasksNeedingReminders) {
        if (task.assignedTo) {
          await this.emailService.sendTaskReminder(task.assignedTo, {
            title: task.title,
            dueDate: task.dueDate.toISOString(),
            priority: task.priority,
            description: task.description,
          });

          await this.taskService.markReminderSent(task.id);
          this.logger.log(`Reminder sent for task: ${task.id}`);
        }
      }

      this.logger.log(`Sent ${tasksNeedingReminders.length} task reminders`);
    } catch (error) {
      this.logger.error('Error sending task reminders:', error);
    }
  }

  @Cron(CronExpression.EVERY_DAY_AT_9AM)
  async sendDailyDigest() {
    this.logger.log('Sending daily task digest...');

    try {
      const overdueTasks = await this.taskService.getOverdueTasks();
      const todayTasks = await this.taskService.getUpcomingTasks(24);
      const stats = await this.taskService.getTaskStats();

      // Here you would send a digest email to the user
      // Implementation depends on your user management system
      this.logger.log('Daily digest prepared:', {
        overdue: overdueTasks.length,
        today: todayTasks.length,
        stats,
      });
    } catch (error) {
      this.logger.error('Error sending daily digest:', error);
    }
  }
}
