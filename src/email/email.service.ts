import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    }
  }

  async sendEmail(
    to: string | string[],
    subject: string,
    html: string,
    text?: string,
  ) {
    try {
      const msg = {
        to: Array.isArray(to) ? to : [to],
        from: this.configService.get('SENDGRID_FROM_EMAIL'),
        subject,
        text: text || '',
        html,
      };

      const response = await sgMail.send(msg);
      this.logger.log(`Email sent successfully to ${to}`);
      return { success: true, messageId: response[0].headers['x-message-id'] };
    } catch (error) {
      this.logger.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendFollowUpEmail(
    to: string,
    meetingDetails: {
      title: string;
      date: string;
      attendees: string[];
      notes?: string;
    },
  ) {
    const subject = `Follow-up: ${meetingDetails.title}`;
    const html = this.generateFollowUpEmailTemplate(meetingDetails);

    return this.sendEmail(to, subject, html);
  }

  async sendMeetingInvite(
    to: string[],
    meetingDetails: {
      title: string;
      startTime: string;
      endTime: string;
      location?: string;
      description?: string;
    },
  ) {
    const subject = `Meeting Invitation: ${meetingDetails.title}`;
    const html = this.generateMeetingInviteTemplate(meetingDetails);

    return this.sendEmail(to, subject, html);
  }

  async sendTaskReminder(
    to: string,
    taskDetails: {
      title: string;
      dueDate: string;
      priority: string;
      description?: string;
    },
  ) {
    const subject = `Task Reminder: ${taskDetails.title}`;
    const html = this.generateTaskReminderTemplate(taskDetails);

    return this.sendEmail(to, subject, html);
  }

  async sendBulkEmails(
    emails: Array<{
      to: string;
      subject: string;
      html: string;
    }>,
  ) {
    try {
      const messages = emails.map((email) => ({
        to: email.to,
        from: this.configService.get('SENDGRID_FROM_EMAIL'),
        subject: email.subject,
        html: email.html,
      }));

      const response = await sgMail.send(messages);
      this.logger.log(`Bulk emails sent successfully: ${emails.length} emails`);
      return { success: true, count: emails.length };
    } catch (error) {
      this.logger.error('Error sending bulk emails:', error);
      throw new Error('Failed to send bulk emails');
    }
  }

  private generateFollowUpEmailTemplate(details: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4F46E5; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9fafb; border-radius: 5px; margin-top: 20px; }
            .footer { margin-top: 20px; font-size: 12px; color: #6b7280; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Meeting Follow-Up</h2>
            </div>
            <div class="content">
              <h3>${details.title}</h3>
              <p><strong>Date:</strong> ${new Date(details.date).toLocaleString()}</p>
              <p><strong>Attendees:</strong> ${details.attendees.join(', ')}</p>
              ${details.notes ? `<p><strong>Notes:</strong></p><p>${details.notes}</p>` : ''}
              <p>Thank you for attending the meeting. Please find the summary above.</p>
            </div>
            <div class="footer">
              <p>This is an automated message from your Executive Assistant.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateMeetingInviteTemplate(details: any): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10B981; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9fafb; border-radius: 5px; margin-top: 20px; }
            .meeting-info { background-color: white; padding: 15px; border-left: 4px solid #10B981; margin: 15px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>📅 Meeting Invitation</h2>
            </div>
            <div class="content">
              <h3>${details.title}</h3>
              <div class="meeting-info">
                <p><strong>Start:</strong> ${new Date(details.startTime).toLocaleString()}</p>
                <p><strong>End:</strong> ${new Date(details.endTime).toLocaleString()}</p>
                ${details.location ? `<p><strong>Location:</strong> ${details.location}</p>` : ''}
                ${details.description ? `<p><strong>Description:</strong> ${details.description}</p>` : ''}
              </div>
              <p>Please confirm your attendance.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  private generateTaskReminderTemplate(details: any): string {
    const priorityColor =
      {
        high: '#EF4444',
        medium: '#F59E0B',
        low: '#10B981',
      }[details.priority.toLowerCase()] || '#6B7280';

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: ${priorityColor}; color: white; padding: 20px; border-radius: 5px; }
            .content { padding: 20px; background-color: #f9fafb; border-radius: 5px; margin-top: 20px; }
            .priority-badge { display: inline-block; padding: 5px 10px; background-color: ${priorityColor}; color: white; border-radius: 3px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>⏰ Task Reminder</h2>
            </div>
            <div class="content">
              <h3>${details.title}</h3>
              <p><span class="priority-badge">${details.priority.toUpperCase()} PRIORITY</span></p>
              <p><strong>Due Date:</strong> ${new Date(details.dueDate).toLocaleString()}</p>
              ${details.description ? `<p><strong>Description:</strong> ${details.description}</p>` : ''}
              <p>This is a reminder to complete this task.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
