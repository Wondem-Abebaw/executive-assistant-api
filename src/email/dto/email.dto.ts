import { IsString, IsOptional, IsArray, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendEmailDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  to: string | string[];

  @ApiProperty({ example: 'Meeting Follow-up' })
  @IsString()
  subject: string;

  @ApiProperty({ example: '<p>Thank you for attending...</p>' })
  @IsString()
  html: string;

  @ApiProperty({ example: 'Thank you for attending...', required: false })
  @IsOptional()
  @IsString()
  text?: string;
}

export class SendFollowUpDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  to: string;

  @ApiProperty({
    example: {
      title: 'Q4 Planning Meeting',
      date: '2024-10-14T14:00:00Z',
      attendees: ['john@example.com', 'jane@example.com'],
      notes: 'Discussed budget allocation',
    },
  })
  @IsObject()
  meetingDetails: {
    title: string;
    date: string;
    attendees: string[];
    notes?: string;
  };
}

export class SendMeetingInviteDto {
  @ApiProperty({ example: ['user1@example.com', 'user2@example.com'] })
  @IsArray()
  to: string[];

  @ApiProperty({
    example: {
      title: 'Weekly Sync',
      startTime: '2024-10-15T10:00:00Z',
      endTime: '2024-10-15T11:00:00Z',
      location: 'Zoom',
      description: 'Weekly team sync',
    },
  })
  @IsObject()
  meetingDetails: {
    title: string;
    startTime: string;
    endTime: string;
    location?: string;
    description?: string;
  };
}

export class SendTaskReminderDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsString()
  to: string;

  @ApiProperty({
    example: {
      title: 'Complete quarterly report',
      dueDate: '2024-10-20T17:00:00Z',
      priority: 'high',
      description: 'Q4 financial analysis',
    },
  })
  @IsObject()
  taskDetails: {
    title: string;
    dueDate: string;
    priority: string;
    description?: string;
  };
}
