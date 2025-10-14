import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CalendarService } from '../calendar/calendar.service';
import { EmailService } from '../email/email.service';
import { TaskService } from '../task/task.service';

interface ParsedIntent {
  action:
    | 'schedule_meeting'
    | 'send_email'
    | 'create_task'
    | 'query_info'
    | 'unknown';
  parameters: any;
  confidence: number;
}

@Injectable()
export class NlpService {
  private readonly logger = new Logger(NlpService.name);
  private genAI: GoogleGenerativeAI;
  private model;

  constructor(
    private configService: ConfigService,
    private calendarService: CalendarService,
    private emailService: EmailService,
    private taskService: TaskService,
  ) {
    const apiKey = this.configService.get('GEMINI_API_KEY');
    if (apiKey) {
      this.genAI = new GoogleGenerativeAI(apiKey);
      this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
    }
  }

  async processCommand(command: string, userEmail?: string): Promise<any> {
    try {
      this.logger.log(`Processing command: ${command}`);

      // Parse the intent using Gemini
      const intent = await this.parseIntent(command);

      // Execute the action based on intent
      const result = await this.executeAction(intent, userEmail);

      return {
        success: true,
        intent: intent.action,
        result,
        originalCommand: command,
      };
    } catch (error) {
      this.logger.error('Error processing command:', error);
      return {
        success: false,
        error: error.message,
        originalCommand: command,
      };
    }
  }

  private async parseIntent(command: string): Promise<ParsedIntent> {
    const prompt = `
You are an AI assistant that parses natural language commands for an executive assistant application.
Analyze the following command and extract the intent and parameters.

Command: "${command}"

Respond ONLY with a valid JSON object in this exact format:
{
  "action": "schedule_meeting" | "send_email" | "create_task" | "query_info" | "unknown",
  "parameters": {
    // Extract relevant parameters based on the action
    // For schedule_meeting: title, startTime, endTime, attendees, location, description
    // For send_email: to, subject, body, type (follow_up, meeting_invite, reminder)
    // For create_task: title, description, dueDate, priority, assignedTo
    // For query_info: query
  },
  "confidence": 0.0-1.0
}

Examples:
- "Schedule a meeting with John next Tuesday at 2pm for 1 hour" -> schedule_meeting
- "Send a follow-up email to sarah@example.com about yesterday's meeting" -> send_email
- "Create a high priority task to review Q4 budget by Friday" -> create_task
- "What meetings do I have tomorrow?" -> query_info

Important: 
- For dates/times, use ISO format or be descriptive (e.g., "next Tuesday 2pm")
- Extract email addresses when mentioned
- Identify priority levels (high, medium, low) for tasks
- Return ONLY valid JSON, no additional text
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Extract JSON from response (handle markdown code blocks)
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      this.logger.log('Parsed intent:', parsed);

      return parsed;
    } catch (error) {
      this.logger.error('Error parsing intent:', error);
      return {
        action: 'unknown',
        parameters: {},
        confidence: 0,
      };
    }
  }

  private async executeAction(
    intent: ParsedIntent,
    userEmail?: string,
  ): Promise<any> {
    switch (intent.action) {
      case 'schedule_meeting':
        return this.handleScheduleMeeting(intent.parameters);

      case 'send_email':
        return this.handleSendEmail(intent.parameters, userEmail);

      case 'create_task':
        return this.handleCreateTask(intent.parameters, userEmail);

      case 'query_info':
        return this.handleQuery(intent.parameters);

      default:
        throw new Error('Unknown action type');
    }
  }

  private async handleScheduleMeeting(params: any): Promise<any> {
    const { title, startTime, endTime, attendees, location, description } =
      params;

    // Parse dates if they're in natural language
    const startDateTime = await this.parseDateTime(startTime);
    const endDateTime = endTime
      ? await this.parseDateTime(endTime)
      : new Date(startDateTime.getTime() + 60 * 60 * 1000); // Default 1 hour

    const event = await this.calendarService.createEvent({
      summary: title,
      description,
      startDateTime: startDateTime.toISOString(),
      endDateTime: endDateTime.toISOString(),
      attendees: Array.isArray(attendees)
        ? attendees
        : [attendees].filter(Boolean),
      location,
    });

    // Send meeting invites if attendees are provided
    if (attendees && attendees.length > 0) {
      await this.emailService.sendMeetingInvite(attendees, {
        title,
        startTime: startDateTime.toISOString(),
        endTime: endDateTime.toISOString(),
        location,
        description,
      });
    }

    return {
      message: 'Meeting scheduled successfully',
      event,
    };
  }

  private async handleSendEmail(params: any, userEmail?: string): Promise<any> {
    const { to, subject, body, type } = params;

    if (type === 'follow_up') {
      return this.emailService.sendFollowUpEmail(
        to,
        params.meetingDetails || {
          title: subject,
          date: new Date().toISOString(),
          attendees: [to],
          notes: body,
        },
      );
    } else if (type === 'meeting_invite') {
      return this.emailService.sendMeetingInvite([to], params.meetingDetails);
    } else {
      return this.emailService.sendEmail(to, subject, body);
    }
  }

  private async handleCreateTask(
    params: any,
    assignedTo?: string,
  ): Promise<any> {
    const { title, description, dueDate, priority } = params;

    const parsedDueDate = await this.parseDateTime(dueDate);

    return this.taskService.createTask({
      title,
      description,
      dueDate: parsedDueDate,
      priority: priority || 'medium',
      status: 'pending',
      assignedTo: params.assignedTo || assignedTo,
    });
  }

  private async handleQuery(params: any): Promise<any> {
    const { query } = params;
    const lowerQuery = query.toLowerCase();

    if (lowerQuery.includes('meeting') || lowerQuery.includes('calendar')) {
      const events = await this.calendarService.listEvents();
      return {
        type: 'calendar_query',
        data: events,
        message: `Found ${events.length} upcoming events`,
      };
    } else if (lowerQuery.includes('task')) {
      const tasks = await this.taskService.getAllTasks();
      return {
        type: 'task_query',
        data: tasks,
        message: `Found ${tasks.length} tasks`,
      };
    } else {
      return {
        type: 'general_query',
        message:
          'I can help with meetings, tasks, and emails. What would you like to know?',
      };
    }
  }

  private async parseDateTime(dateTimeStr: string): Promise<Date> {
    // Use Gemini to parse natural language dates
    const prompt = `
Convert this natural language date/time to ISO 8601 format.
Current date/time: ${new Date().toISOString()}

Input: "${dateTimeStr}"

Respond ONLY with the ISO 8601 date string, nothing else.
Example: 2024-03-15T14:30:00.000Z
`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const isoString = response.text().trim();

      // Validate and return
      const date = new Date(isoString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }

      return date;
    } catch (error) {
      this.logger.error('Error parsing date, using fallback:', error);
      // Fallback: try native Date parsing
      return new Date(dateTimeStr);
    }
  }

  async generateSummary(text: string): Promise<string> {
    const prompt = `Summarize the following text concisely:\n\n${text}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Error generating summary:', error);
      return text;
    }
  }

  async suggestResponse(context: string): Promise<string> {
    const prompt = `Based on this context, suggest a professional email response:\n\n${context}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      this.logger.error('Error suggesting response:', error);
      throw new Error('Failed to generate response suggestion');
    }
  }
}
