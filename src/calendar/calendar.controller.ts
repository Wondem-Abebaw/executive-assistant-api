import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CalendarService } from './calendar.service';
import { CreateEventDto, UpdateEventDto } from './dto/calendar.dto';

@ApiTags('calendar')
@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get('events')
  @ApiOperation({ summary: 'List all calendar events' })
  async listEvents(
    @Query('timeMin') timeMin?: string,
    @Query('timeMax') timeMax?: string,
  ) {
    return this.calendarService.listEvents(
      timeMin ? new Date(timeMin) : undefined,
      timeMax ? new Date(timeMax) : undefined,
    );
  }

  @Post('events')
  @ApiOperation({ summary: 'Create a new calendar event' })
  async createEvent(@Body() createEventDto: CreateEventDto) {
    return this.calendarService.createEvent(createEventDto);
  }

  @Get('availability')
  @ApiOperation({ summary: 'Find available time slots' })
  async findAvailableSlots(
    @Query('date') date: string,
    @Query('duration') duration?: number,
  ) {
    return this.calendarService.findAvailableSlots(
      new Date(date),
      duration || 60,
    );
  }

  @Patch('events/:id')
  @ApiOperation({ summary: 'Update a calendar event' })
  async updateEvent(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
  ) {
    return this.calendarService.updateEvent(id, updateEventDto);
  }

  @Delete('events/:id')
  @ApiOperation({ summary: 'Delete a calendar event' })
  async deleteEvent(@Param('id') id: string) {
    return this.calendarService.deleteEvent(id);
  }
}
