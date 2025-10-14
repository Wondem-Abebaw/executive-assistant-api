// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { CalendarModule } from './calendar/calendar.module';
import { EmailModule } from './email/email.module';
import { TaskModule } from './task/task.module';
import { NlpModule } from './nlp/nlp.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ScheduleModule.forRoot(),
    CalendarModule,
    EmailModule,
    TaskModule,
    NlpModule,
    HealthModule,
  ],
})
export class AppModule {}
