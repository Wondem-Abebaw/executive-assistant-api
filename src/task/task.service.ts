import { Injectable, Logger, NotFoundException } from '@nestjs/common';

export interface Task {
  id: string;
  title: string;
  description?: string;
  dueDate: Date;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  assignedTo?: string;
  createdAt: Date;
  updatedAt: Date;
  reminderSent?: boolean;
  tags?: string[];
}

@Injectable()
export class TaskService {
  private readonly logger = new Logger(TaskService.name);
  private tasks: Map<string, Task> = new Map();

  async createTask(
    taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<Task> {
    const task: Task = {
      id: this.generateId(),
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date(),
      reminderSent: false,
    };

    this.tasks.set(task.id, task);
    this.logger.log(`Task created: ${task.id}`);
    return task;
  }

  async getAllTasks(filters?: {
    status?: string;
    priority?: string;
    assignedTo?: string;
  }): Promise<Task[]> {
    let tasks = Array.from(this.tasks.values());

    if (filters) {
      if (filters.status) {
        tasks = tasks.filter((t) => t.status === filters.status);
      }
      if (filters.priority) {
        tasks = tasks.filter((t) => t.priority === filters.priority);
      }
      if (filters.assignedTo) {
        tasks = tasks.filter((t) => t.assignedTo === filters.assignedTo);
      }
    }

    return tasks.sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  async getTaskById(id: string): Promise<Task> {
    const task = this.tasks.get(id);
    if (!task) {
      throw new NotFoundException(`Task with ID ${id} not found`);
    }
    return task;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<Task> {
    const task = await this.getTaskById(id);

    const updatedTask = {
      ...task,
      ...updates,
      id: task.id, // Prevent ID modification
      createdAt: task.createdAt, // Prevent createdAt modification
      updatedAt: new Date(),
    };

    this.tasks.set(id, updatedTask);
    this.logger.log(`Task updated: ${id}`);
    return updatedTask;
  }

  async deleteTask(id: string): Promise<void> {
    const task = await this.getTaskById(id);
    this.tasks.delete(id);
    this.logger.log(`Task deleted: ${id}`);
  }

  async getUpcomingTasks(hours: number = 24): Promise<Task[]> {
    const now = new Date();
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);

    return Array.from(this.tasks.values()).filter(
      (task) =>
        task.status !== 'completed' &&
        task.status !== 'cancelled' &&
        task.dueDate >= now &&
        task.dueDate <= futureTime,
    );
  }

  async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values()).filter(
      (task) =>
        task.status !== 'completed' &&
        task.status !== 'cancelled' &&
        task.dueDate < now,
    );
  }

  async markReminderSent(id: string): Promise<void> {
    const task = await this.getTaskById(id);
    task.reminderSent = true;
    task.updatedAt = new Date();
    this.tasks.set(id, task);
  }

  async getTasksByPriority(
    priority: 'low' | 'medium' | 'high',
  ): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (t) => t.priority === priority,
    );
  }

  async getTaskStats(): Promise<{
    total: number;
    pending: number;
    inProgress: number;
    completed: number;
    overdue: number;
    byPriority: { high: number; medium: number; low: number };
  }> {
    const tasks = Array.from(this.tasks.values());
    const now = new Date();

    return {
      total: tasks.length,
      pending: tasks.filter((t) => t.status === 'pending').length,
      inProgress: tasks.filter((t) => t.status === 'in-progress').length,
      completed: tasks.filter((t) => t.status === 'completed').length,
      overdue: tasks.filter(
        (t) =>
          t.status !== 'completed' &&
          t.status !== 'cancelled' &&
          t.dueDate < now,
      ).length,
      byPriority: {
        high: tasks.filter((t) => t.priority === 'high').length,
        medium: tasks.filter((t) => t.priority === 'medium').length,
        low: tasks.filter((t) => t.priority === 'low').length,
      },
    };
  }

  private generateId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
