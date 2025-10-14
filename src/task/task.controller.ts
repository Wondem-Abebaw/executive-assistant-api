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
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { TaskService } from './task.service';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto';

@ApiTags('tasks')
@Controller('tasks')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.taskService.createTask(createTaskDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiQuery({ name: 'status', required: false })
  @ApiQuery({ name: 'priority', required: false })
  @ApiQuery({ name: 'assignedTo', required: false })
  async getAllTasks(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
  ) {
    return this.taskService.getAllTasks({ status, priority, assignedTo });
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get task statistics' })
  async getTaskStats() {
    return this.taskService.getTaskStats();
  }

  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming tasks' })
  @ApiQuery({ name: 'hours', required: false })
  async getUpcomingTasks(@Query('hours') hours?: number) {
    return this.taskService.getUpcomingTasks(
      hours ? parseInt(hours.toString()) : 24,
    );
  }

  @Get('overdue')
  @ApiOperation({ summary: 'Get overdue tasks' })
  async getOverdueTasks() {
    return this.taskService.getOverdueTasks();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a task by ID' })
  async getTaskById(@Param('id') id: string) {
    return this.taskService.getTaskById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a task' })
  async updateTask(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ) {
    return this.taskService.updateTask(id, updateTaskDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a task' })
  async deleteTask(@Param('id') id: string) {
    await this.taskService.deleteTask(id);
    return { success: true, message: 'Task deleted successfully' };
  }
}
