import { Controller, Post, Body } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { EmailService } from './email.service';
import {
  SendEmailDto,
  SendFollowUpDto,
  SendMeetingInviteDto,
  SendTaskReminderDto,
} from './dto/email.dto';

@ApiTags('email')
@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  @ApiOperation({ summary: 'Send a custom email' })
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    return this.emailService.sendEmail(
      sendEmailDto.to,
      sendEmailDto.subject,
      sendEmailDto.html,
      sendEmailDto.text,
    );
  }

  @Post('follow-up')
  @ApiOperation({ summary: 'Send a follow-up email after meeting' })
  async sendFollowUp(@Body() followUpDto: SendFollowUpDto) {
    return this.emailService.sendFollowUpEmail(
      followUpDto.to,
      followUpDto.meetingDetails,
    );
  }

  @Post('meeting-invite')
  @ApiOperation({ summary: 'Send a meeting invitation email' })
  async sendMeetingInvite(@Body() inviteDto: SendMeetingInviteDto) {
    return this.emailService.sendMeetingInvite(
      inviteDto.to,
      inviteDto.meetingDetails,
    );
  }

  @Post('task-reminder')
  @ApiOperation({ summary: 'Send a task reminder email' })
  async sendTaskReminder(@Body() reminderDto: SendTaskReminderDto) {
    return this.emailService.sendTaskReminder(
      reminderDto.to,
      reminderDto.taskDetails,
    );
  }
}
