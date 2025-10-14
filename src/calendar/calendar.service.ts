import { Injectable, Logger } from '@nestjs/common';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CalendarService {
  private readonly logger = new Logger(CalendarService.name);
  private oauth2Client;
  private calendar;

  constructor(private configService: ConfigService) {
    this.initializeGoogleAuth();
  }

  private initializeGoogleAuth() {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get('GOOGLE_CLIENT_ID'),
      this.configService.get('GOOGLE_CLIENT_SECRET'),
      this.configService.get('GOOGLE_REDIRECT_URI'),
    );

    const refreshToken = this.configService.get('GOOGLE_REFRESH_TOKEN');
    if (refreshToken) {
      this.oauth2Client.setCredentials({
        refresh_token: refreshToken,
      });
    }

    this.calendar = google.calendar({ version: 'v3', auth: this.oauth2Client });
  }

  async listEvents(timeMin?: Date, timeMax?: Date) {
    try {
      const response = await this.calendar.events.list({
        calendarId: 'primary',
        timeMin: (timeMin || new Date()).toISOString(),
        timeMax: timeMax?.toISOString(),
        maxResults: 50,
        singleEvents: true,
        orderBy: 'startTime',
      });

      return response.data.items || [];
    } catch (error) {
      this.logger.error('Error fetching events:', error);
      throw new Error('Failed to fetch calendar events');
    }
  }

  async createEvent(eventDetails: {
    summary: string;
    description?: string;
    startDateTime: string;
    endDateTime: string;
    attendees?: string[];
    location?: string;
  }) {
    try {
      const event = {
        summary: eventDetails.summary,
        description: eventDetails.description,
        location: eventDetails.location,
        start: {
          dateTime: eventDetails.startDateTime,
          timeZone: 'UTC',
        },
        end: {
          dateTime: eventDetails.endDateTime,
          timeZone: 'UTC',
        },
        attendees: eventDetails.attendees?.map((email) => ({ email })),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 },
            { method: 'popup', minutes: 30 },
          ],
        },
      };

      const response = await this.calendar.events.insert({
        calendarId: 'primary',
        requestBody: event,
        sendUpdates: 'all',
      });

      this.logger.log(`Event created: ${response.data.htmlLink}`);
      return response.data;
    } catch (error) {
      this.logger.error('Error creating event:', error);
      throw new Error('Failed to create calendar event');
    }
  }

  async findAvailableSlots(date: Date, durationMinutes: number = 60) {
    try {
      const startOfDay = new Date(date);
      startOfDay.setHours(9, 0, 0, 0); // 9 AM

      const endOfDay = new Date(date);
      endOfDay.setHours(17, 0, 0, 0); // 5 PM

      const events = await this.listEvents(startOfDay, endOfDay);

      const availableSlots = [];
      let currentTime = startOfDay.getTime();
      const endTime = endOfDay.getTime();

      for (const event of events) {
        const eventStart = new Date(
          event.start.dateTime || event.start.date,
        ).getTime();

        if (eventStart - currentTime >= durationMinutes * 60000) {
          availableSlots.push({
            start: new Date(currentTime).toISOString(),
            end: new Date(eventStart).toISOString(),
          });
        }

        currentTime = Math.max(
          currentTime,
          new Date(event.end.dateTime || event.end.date).getTime(),
        );
      }

      if (endTime - currentTime >= durationMinutes * 60000) {
        availableSlots.push({
          start: new Date(currentTime).toISOString(),
          end: new Date(endTime).toISOString(),
        });
      }

      return availableSlots;
    } catch (error) {
      this.logger.error('Error finding available slots:', error);
      throw new Error('Failed to find available slots');
    }
  }

  async updateEvent(eventId: string, updates: any) {
    try {
      const response = await this.calendar.events.patch({
        calendarId: 'primary',
        eventId,
        requestBody: updates,
        sendUpdates: 'all',
      });

      return response.data;
    } catch (error) {
      this.logger.error('Error updating event:', error);
      throw new Error('Failed to update event');
    }
  }

  async deleteEvent(eventId: string) {
    try {
      await this.calendar.events.delete({
        calendarId: 'primary',
        eventId,
        sendUpdates: 'all',
      });

      return { success: true, message: 'Event deleted successfully' };
    } catch (error) {
      this.logger.error('Error deleting event:', error);
      throw new Error('Failed to delete event');
    }
  }
}
