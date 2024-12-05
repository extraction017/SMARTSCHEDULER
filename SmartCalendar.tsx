import React, { useEffect } from 'react';
import { Provider } from 'react-redux';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { EventInput } from '@fullcalendar/core';

import { store, useAppDispatch, useAppSelector, fetchTasks, autoScheduleTasks } from './TaskReduxStore';
import { EnhancedTaskFormModal } from './EnhancedTaskFormModal';
import { Task, TaskType, TaskPriority } from './TaskModel';

// Color mapping for task priorities and types
const TASK_COLORS = {
  [TaskPriority.HIGH]: '#FF6B6B',     // Bright Red
  [TaskPriority.MEDIUM]: '#4ECDC4',   // Teal
  [TaskPriority.LOW]: '#A8DADC',      // Light Blue
  [TaskType.FIXED]: '#FFD700',        // Gold
  [TaskType.ROUTINE]: '#6A5ACD',      // Slate Blue
  [TaskType.FLEXIBLE]: '#2A9D8F'      // Ocean Green
};

export const SmartCalendar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { tasks, loading, error } = useAppSelector(state => state.tasks);
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [selectedTask, setSelectedTask] = React.useState<Task | null>(null);

  // Load tasks on component mount
  useEffect(() => {
    dispatch(fetchTasks());
  }, [dispatch]);

  // Convert tasks to FullCalendar events
  const calendarEvents: EventInput[] = tasks.map(task => ({
    id: task.id,
    title: task.name,
    start: task.startTime,
    end: task.endTime,
    backgroundColor: TASK_COLORS[task.priority] || TASK_COLORS[task.type],
    extendedProps: { 
      type: task.type, 
      priority: task.priority 
    }
  }));

  // Handle task creation/edit modal
  const handleTaskSave = (task: Task) => {
    // Dispatch create or update action based on whether task exists
    if (task.id) {
      // TODO: Implement updateExistingTask action from Redux store
      // dispatch(updateExistingTask(task));
    } else {
      // dispatch(createTask(task));
    }
    
    setIsTaskModalOpen(false);
    setSelectedTask(null);
  };

  // Auto-schedule tasks
  const handleAutoSchedule = () => {
    dispatch(autoScheduleTasks());
  };

  // Event click handler
  const handleEventClick = (clickInfo: any) => {
    const taskId = clickInfo.event.id;
    const task = tasks.find(t => t.id === taskId);
    
    if (task) {
      setSelectedTask(task);
      setIsTaskModalOpen(true);
    }
  };

  // Error and loading states
  if (loading) return <div>Loading tasks...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between mb-4">
        <button 
          onClick={() => setIsTaskModalOpen(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Task
        </button>
        <button 
          onClick={handleAutoSchedule}
          className="bg-green-500 text-white px-4 py-2 rounded"
        >
          Auto Schedule
        </button>
      </div>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="timeGridWeek"
        headerToolbar=
        {{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay'
        }}
        events={calendarEvents}
        editable={true}
        eventClick={handleEventClick}
      />

      {isTaskModalOpen && (
        <EnhancedTaskFormModal 
          isOpen={isTaskModalOpen}
          task={selectedTask}
          onSave={handleTaskSave}
          onClose={() => {
            setIsTaskModalOpen(false);
            setSelectedTask(null);
          }}
        />
      )}
    </div>
  );
};

// Wrapper component to provide Redux context
export const SmartCalendarApp: React.FC = () => {
  return (
    <Provider store={store}>
      <SmartCalendar />
    </Provider>
  );
};
