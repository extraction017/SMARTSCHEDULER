import React, { useState, useEffect } from 'react';
import { 
  Task, 
  TaskType, 
  TaskPriority, 
  TaskFactory, 
  TaskValidator 
} from './TaskModel';

interface EnhancedTaskFormModalProps {
  isOpen: boolean;
  task?: Task | null;
  onSave: (task: Task) => void;
  onClose: () => void;
}

export const EnhancedTaskFormModal: React.FC<EnhancedTaskFormModalProps> = ({
  isOpen, 
  task, 
  onSave, 
  onClose
}) => {
  const [formData, setFormData] = useState<Partial<Task>>(task || {});
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Reset form when task changes or modal opens
  useEffect(() => {
    setFormData(task || {});
    setValidationErrors([]);
  }, [task, isOpen]);

  const handleInputChange = (field: keyof Task, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Create a full task object
    const taskToValidate = TaskFactory.createTask(formData);
    
    // Validate the task
    const isValid = TaskValidator.validate(taskToValidate);
    
    if (isValid) {
      onSave(taskToValidate);
      setValidationErrors([]);
    } else {
      const errors : string[] = [];
      if (!taskToValidate.name || taskToValidate.name.trim() === '') {
        errors.push('Task name is required');
      }
      if (taskToValidate.duration <= 0) {
        errors.push('Task duration must be greater than 0 minutes');
      }
      if (taskToValidate.type === TaskType.FIXED && !taskToValidate.startTime) {
        errors.push('Fixed tasks require a start time');
      }
      setValidationErrors(errors);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-lg w-[500px] max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl mb-4 font-bold">
          {task ? 'Edit Task' : 'Create New Task'}
        </h2>

        {validationErrors.length > 0 && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <ul className="list-disc list-inside">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Task Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Task Name
            </label>
            <input 
              type="text"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              placeholder="Enter task name"
              required
            />
          </div>

          {/* Task Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Task Type
            </label>
            <select
              value={formData.type || TaskType.FLEXIBLE}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {Object.values(TaskType).map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Task Priority */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Task Priority
            </label>
            <select
              value={formData.priority || TaskPriority.MEDIUM}
              onChange={(e) => handleInputChange('priority', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            >
              {Object.values(TaskPriority).map(priority => (
                <option key={priority} value={priority}>
                  {priority.charAt(0).toUpperCase() + priority.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Duration (minutes)
            </label>
            <input 
              type="number"
              value={formData.duration || 30}
              onChange={(e) => handleInputChange('duration', Number(e.target.value))}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              min="1"
              max="480"
            />
          </div>

          {/* Start Time (for Fixed Tasks) */}
          {formData.type === TaskType.FIXED && (
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input 
                type="datetime-local"
                value={formData.startTime ? new Date(formData.startTime).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('startTime', new Date(e.target.value))}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
                required
              />
            </div>
          )}

          {/* Preferred Time Range */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Preferred Time Range
            </label>
            <div className="flex space-x-2">
              <input 
                type="datetime-local"
                placeholder="Start"
                value={formData.preferredTimeRange?.start ? new Date(formData.preferredTimeRange.start).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('preferredTimeRange', {
                  ...formData.preferredTimeRange,
                  start: new Date(e.target.value)
                })}
                className="mt-1 block w-1/2 border border-gray-300 rounded-md shadow-sm p-2"
              />
              <input 
                type="datetime-local"
                placeholder="End"
                value={formData.preferredTimeRange?.end ? new Date(formData.preferredTimeRange.end).toISOString().slice(0, 16) : ''}
                onChange={(e) => handleInputChange('preferredTimeRange', {
                  ...formData.preferredTimeRange,
                  end: new Date(e.target.value)
                })}
                className="mt-1 block w-1/2 border border-gray-300 rounded-md shadow-sm p-2"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between mt-6">
            <button 
              type="submit" 
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
            >
              {task ? 'Update Task' : 'Create Task'}
            </button>
            <button 
              type="button" 
              onClick={onClose}
              className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
