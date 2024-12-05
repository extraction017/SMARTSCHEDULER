import { v4 as uuidv4 } from 'uuid';

// Enums for Task Classification
export enum TaskType {
  FIXED = 'fixed',
  ROUTINE = 'routine',
  FLEXIBLE = 'flexible'
}

export enum TaskPriority {
  HIGH = 'high',
  MEDIUM = 'medium', 
  LOW = 'low'
}

// Task Interface Definition
export interface Task {
  id: string;
  name: string;
  type: TaskType;
  priority: TaskPriority;
  duration: number; // minutes
  startTime?: Date;
  endTime?: Date;
  preferredTimeRange?: {
    start: Date;
    end: Date;
  };
  frequency?: string; // for routine tasks
  createdAt: Date;
  updatedAt: Date;
}

// Task Creation Utility
export class TaskFactory {
  static createTask(partial: Partial<Task>): Task {
    const now = new Date();
    return {
      id: partial.id || uuidv4(),
      name: partial.name || 'Untitled Task',
      type: partial.type || TaskType.FLEXIBLE,
      priority: partial.priority || TaskPriority.MEDIUM,
      duration: partial.duration || 30,
      createdAt: partial.createdAt || now,
      updatedAt: now,
      ...partial
    };
  }
}

// Storage Service for Task Management
export class TaskStorageService {
  private static STORAGE_KEY = 'smart-calendar-tasks';

  // Save tasks to local storage
  static saveTasks(tasks: Task[]): void {
    try {
      localStorage.setItem(
        this.STORAGE_KEY, 
        JSON.stringify(tasks)
      );
    } catch (error) {
      console.error('Failed to save tasks', error);
    }
  }

  // Load tasks from local storage
  static loadTasks(): Task[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const parsedTasks = JSON.parse(stored) as Task[];
        // Reconstruct dates which are serialized to strings
        return parsedTasks.map(task => ({
          ...task,
          createdAt: new Date(task.createdAt),
          updatedAt: new Date(task.updatedAt),
          startTime: task.startTime ? new Date(task.startTime) : undefined,
          endTime: task.endTime ? new Date(task.endTime) : undefined,
          preferredTimeRange: task.preferredTimeRange ? {
            start: new Date(task.preferredTimeRange.start),
            end: new Date(task.preferredTimeRange.end)
          } : undefined
        }));
      }
      return [];
    } catch (error) {
      console.error('Failed to load tasks', error);
      return [];
    }
  }

  // Add a single task
  static addTask(task: Task): void {
    const tasks = this.loadTasks();
    tasks.push(task);
    this.saveTasks(tasks);
  }

  // Update an existing task
  static updateTask(updatedTask: Task): void {
    const tasks = this.loadTasks();
    const index = tasks.findIndex(t => t.id === updatedTask.id);
    
    if (index !== -1) {
      tasks[index] = {
        ...updatedTask,
        updatedAt: new Date()
      };
      this.saveTasks(tasks);
    }
  }

  // Remove a task by ID
  static removeTask(taskId: string): void {
    const tasks = this.loadTasks();
    const filteredTasks = tasks.filter(t => t.id !== taskId);
    this.saveTasks(filteredTasks);
  }

  // Clear all tasks
  static clearTasks(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }
}

// Task Validation Utility
export class TaskValidator {
  static validate(task: Task): boolean {
    // Basic validation rules
    if (!task.name || task.name.trim() === '') return false;
    if (task.duration <= 0) return false;
    
    // Additional type-specific validations
    if (task.type === TaskType.FIXED && !task.startTime) return false;
    
    return true;
  }
}
