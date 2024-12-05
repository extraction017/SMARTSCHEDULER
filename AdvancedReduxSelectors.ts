import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './TaskReduxStore';
import { TaskType, TaskPriority } from './TaskModel';

// Select tasks by type
export const selectTasksByType = createSelector(
  [(state: RootState) => state.tasks.tasks, (_: RootState, type: TaskType) => type],
  (tasks, type) => tasks.filter(task => task.type === type)
);

// Select tasks by priority
export const selectTasksByPriority = createSelector(
  [(state: RootState) => state.tasks.tasks, (_: RootState, priority: TaskPriority) => priority],
  (tasks, priority) => tasks.filter(task => task.priority === priority)
);

// Get tasks scheduled in the next 7 days
export const selectUpcomingTasks = createSelector(
  [
    (state: RootState) => state.tasks.tasks, 
    (_: RootState, days: number = 7) => days
  ],
  (tasks, days) => {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + days);
    
    return tasks.filter(task => 
      task.startTime && 
      task.startTime <= sevenDaysFromNow
    );
  }
);
