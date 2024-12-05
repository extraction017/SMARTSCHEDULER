import { Task, TaskType, TaskPriority } from './TaskModel';

interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

export class TaskScheduler {
  private tasks: Task[];
  private workdayStart: Date;
  private workdayEnd: Date;

  constructor(tasks: Task[]) {
    this.tasks = tasks;
    // Default workday from 8 AM to 8 PM
    this.workdayStart = new Date();
    this.workdayStart.setHours(8, 0, 0, 0);
    this.workdayEnd = new Date();
    this.workdayEnd.setHours(20, 0, 0, 0);
  }

  // Primary auto-scheduling method
  autoSchedule(): Task[] {
    // Sort tasks by priority and type
    const sortedTasks = this.prioritizeTasks();
    const scheduledTasks: Task[] = [];

    // Generate available time slots
    const availableSlots = this.generateTimeSlots();

    for (const task of sortedTasks) {
      const scheduledTask = this.scheduleTask(task, availableSlots);
      if (scheduledTask) {
        scheduledTasks.push(scheduledTask);
      }
    }

    return scheduledTasks;
  }

  // Prioritize tasks for scheduling
  private prioritizeTasks(): Task[] {
    return this.tasks.sort((a, b) => {
      // Priority order: Fixed > High Priority > Routine > Flexible
      const priorityOrder = {
        [TaskType.FIXED]: 4,
        [TaskPriority.HIGH]: 3,
        [TaskType.ROUTINE]: 2,
        [TaskType.FLEXIBLE]: 1
      };

      const aPriority = priorityOrder[a.type] || priorityOrder[a.priority] || 0;
      const bPriority = priorityOrder[b.type] || priorityOrder[b.priority] || 0;

      return bPriority - aPriority;
    });
  }

  // Generate available time slots
  private generateTimeSlots(): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentTime = new Date(this.workdayStart);

    while (currentTime < this.workdayEnd) {
      const slotEnd = new Date(currentTime);
      slotEnd.setMinutes(currentTime.getMinutes() + 30); // 30-minute slots

      slots.push({
        start: new Date(currentTime),
        end: slotEnd,
        available: true
      });

      currentTime = slotEnd;
    }

    return slots;
  }

  // Schedule a single task
  private scheduleTask(task: Task, availableSlots: TimeSlot[]): Task | null {
    // Handle fixed tasks first
    if (task.type === TaskType.FIXED && task.startTime) {
      return this.scheduleFixedTask(task);
    }

    // Handle tasks with preferred time range
    if (task.preferredTimeRange) {
      return this.scheduleTaskWithPreference(task, availableSlots);
    }

    // Default scheduling for flexible tasks
    return this.scheduleFlexibleTask(task, availableSlots);
  }

  // Schedule a fixed task
  private scheduleFixedTask(task: Task): Task {
    // Ensure fixed task is within workday
    if (task.startTime && this.isWithinWorkday(task.startTime)) {
      return {
        ...task,
        endTime: this.calculateEndTime(task)
      };
    }
    throw new Error('Fixed task outside of workday');
  }

  // Schedule task with preferred time range
  private scheduleTaskWithPreference(task: Task, availableSlots: TimeSlot[]): Task | null {
    if (!task.preferredTimeRange) return null;

    const preferredSlots = availableSlots.filter(slot => 
      slot.start >= task.preferredTimeRange!.start && 
      slot.end <= task.preferredTimeRange!.end &&
      slot.available
    );

    if (preferredSlots.length > 0) {
      const selectedSlot = preferredSlots.find(slot => 
        this.canFitTask(slot, task)
      );

      if (selectedSlot) {
        selectedSlot.available = false;
        return {
          ...task,
          startTime: selectedSlot.start,
          endTime: this.calculateEndTime(task, selectedSlot.start)
        };
      }
    }

    return null;
  }

  // Schedule flexible task
  private scheduleFlexibleTask(task: Task, availableSlots: TimeSlot[]): Task | null {
    const availableForTask = availableSlots.filter(slot => 
      slot.available && this.canFitTask(slot, task)
    );

    if (availableForTask.length > 0) {
      const selectedSlot = availableForTask[0];
      selectedSlot.available = false;

      return {
        ...task,
        startTime: selectedSlot.start,
        endTime: this.calculateEndTime(task, selectedSlot.start)
      };
    }

    return null;
  }

  // Check if task can fit in a time slot
  private canFitTask(slot: TimeSlot, task: Task): boolean {
    const requiredMinutes = task.duration;
    const slotDuration = (slot.end.getTime() - slot.start.getTime()) / (1000 * 60);
    return slotDuration >= requiredMinutes;
  }

  // Calculate end time based on task duration
  private calculateEndTime(task: Task, startTime?: Date): Date {
    const end = startTime ? new Date(startTime) : new Date();
    end.setMinutes(end.getMinutes() + task.duration);
    return end;
  }

  // Validate if time is within workday
  private isWithinWorkday(time: Date): boolean {
    return time >= this.workdayStart && time <= this.workdayEnd;
  }

  // Additional method to handle routine tasks
  private handleRoutineTask(task: Task): Task {
    // TODO: Implement routine task logic
    // Consider previous scheduling history
    return task;
  }
}

// Scheduling Configuration
export interface SchedulingConfig {
  workdayStart?: Date;
  workdayEnd?: Date;
  breakBetweenTasks?: number;
}

// Scheduling Utility to create and configure scheduler
export class SchedulingUtility {
  static createScheduler(
    tasks: Task[], 
    config?: SchedulingConfig
  ): TaskScheduler {
    const scheduler = new TaskScheduler(tasks);
    
    // Apply custom configuration if provided
    if (config) {
      // Placeholder for configuration application
    }

    return scheduler;
  }
}
