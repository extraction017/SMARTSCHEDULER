import { createSlice, PayloadAction, configureStore } from '@reduxjs/toolkit';
import { Task, TaskType, TaskPriority, TaskFactory, TaskStorageService } from './TaskModel';
import { TaskScheduler } from './TaskScheduler'
import { ThunkAction } from 'redux-thunk';
import { Action } from 'redux';

// Task State Interface
export interface TaskState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
}

// Initial State
const initialState: TaskState = {
  tasks: [],
  loading: false,
  error: null
};

// Task Slice
export const taskSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    // Synchronous Actions
    setTasks: (state, action: PayloadAction<Task[]>) => {
      state.tasks = action.payload;
      state.loading = false;
      state.error = null;
    },
    addTask: (state, action: PayloadAction<Task>) => {
      state.tasks.push(action.payload);
    },
    updateTask: (state, action: PayloadAction<Task>) => {
      const index = state.tasks.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.tasks[index] = action.payload;
      }
    },
    removeTask: (state, action: PayloadAction<string>) => {
      state.tasks = state.tasks.filter(t => t.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    }
  }
});

// Thunk Actions for Async Operations
export const fetchTasks = (): ThunkAction<void, RootState, unknown, Action<string>> => 
  (dispatch) => {
    dispatch(taskSlice.actions.setLoading(true));
    try {
      const tasks = TaskStorageService.loadTasks();
      dispatch(taskSlice.actions.setTasks(tasks));
    } catch (error) {
      dispatch(taskSlice.actions.setError('Failed to load tasks'));
    }
};

export const createTask = (taskData: Partial<Task>): 
  ThunkAction<void, RootState, unknown, Action<string>> => 
  (dispatch) => {
    try {
      const newTask = TaskFactory.createTask(taskData);
      TaskStorageService.addTask(newTask);
      dispatch(taskSlice.actions.addTask(newTask));
    } catch (error) {
      dispatch(taskSlice.actions.setError('Failed to create task'));
    }
};

export const updateExistingTask = (taskData: Task): 
  ThunkAction<void, RootState, unknown, Action<string>> => 
  (dispatch) => {
    try {
      TaskStorageService.updateTask(taskData);
      dispatch(taskSlice.actions.updateTask(taskData));
    } catch (error) {
      dispatch(taskSlice.actions.setError('Failed to update task'));
    }
};

export const deleteTask = (taskId: string): 
  ThunkAction<void, RootState, unknown, Action<string>> => 
  (dispatch) => {
    try {
      TaskStorageService.removeTask(taskId);
      dispatch(taskSlice.actions.removeTask(taskId));
    } catch (error) {
      dispatch(taskSlice.actions.setError('Failed to delete task'));
    }
};

export const autoScheduleTasks = (): 
  ThunkAction<void, RootState, unknown, Action<string>> => 
  (dispatch, getState) => {
    try {
      const { tasks } = getState().tasks;
      const scheduler = new TaskScheduler(tasks);
      const scheduledTasks = scheduler.autoSchedule();
      
      // Update each scheduled task
      scheduledTasks.forEach(task => {
        TaskStorageService.updateTask(task);
        dispatch(taskSlice.actions.updateTask(task));
      });
    } catch (error) {
      dispatch(taskSlice.actions.setError('Failed to auto-schedule tasks'));
    }
};

// Root Reducer and Store Configuration
export const rootReducer = {
  tasks: taskSlice.reducer
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware({
      serializableCheck: {
        // Ignore these action types
        ignoredActions: [
          'tasks/setTasks', 
          'tasks/addTask', 
          'tasks/updateTask'
        ],
        // Ignore these paths in the state
        ignoredPaths: [
          'tasks.tasks.startTime', 
          'tasks.tasks.endTime', 
          'tasks.tasks.createdAt', 
          'tasks.tasks.updatedAt'
        ]
      }
    })
});

// Type Definitions for Redux
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Redux Hooks
export const useAppDispatch = () => store.dispatch;
export const useAppSelector = <TSelected = unknown>(
  selector: (state: RootState) => TSelected
): TSelected => selector(store.getState());

// Export Actions
export const { 
  setTasks, 
  addTask, 
  updateTask, 
  removeTask 
} = taskSlice.actions;
