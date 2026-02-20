
import React, { useState, useEffect } from 'react';
import { X, Calendar, User as UserIcon, AlertCircle, CheckSquare } from 'lucide-react';
import { User, Request, Task, TaskPriority, TaskStatus } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  request: Request;
  adminUsers: User[];
  onCreateTask: (task: Task) => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, request, adminUsers, onCreateTask }) => {
  const [assignedToId, setAssignedToId] = useState<string>('');
  const [priority, setPriority] = useState<TaskPriority>(TaskPriority.MEDIUM);
  const [dueDate, setDueDate] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
        // Default due date to 3 days from now
        const d = new Date();
        d.setDate(d.getDate() + 3);
        setDueDate(d.toISOString().split('T')[0]);
        setDescription(`Fulfillment required for ${request.type}: ${request.item}.\nRequested by: ${request.requestedBy.fullName}`);
        
        // Default to first admin if available
        if (adminUsers.length > 0) {
            setAssignedToId(String(adminUsers[0].id));
        }
    }
  }, [isOpen, request, adminUsers]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const assignedUser = adminUsers.find(u => String(u.id) === assignedToId) || null;
    
    const newTask: Task = {
        id: `task-${Date.now()}`,
        requestId: request.id,
        title: `Fulfill: ${request.item}`,
        assignedTo: assignedUser,
        status: TaskStatus.TODO,
        priority: priority,
        dueDate: dueDate,
        description: description,
        createdDate: new Date().toISOString()
    };

    onCreateTask(newTask);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md flex flex-col" onClick={e => e.stopPropagation()}>
        
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-lg">
          <div className="flex items-center gap-2">
              <div className="bg-siteblue/10 p-2 rounded-lg text-siteblue">
                  <CheckSquare size={20} />
              </div>
              <h2 className="text-lg font-bold text-siteblue">Approve & Create Task</h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-5">
                {/* Request Context Summary */}
                <div className="bg-siteblue/5 border border-siteblue/10 rounded-md p-3 text-sm text-siteblue">
                    <div className="flex justify-between items-start">
                        <span className="font-semibold">Request Context:</span>
                        <span className="bg-siteblue/20 text-siteblue text-[10px] px-1.5 py-0.5 rounded uppercase">{request.type}</span>
                    </div>
                    <p className="mt-1 text-slate-800">{request.item}</p>
                    <p className="text-xs text-siteblue/80 mt-1">Requested by {request.requestedBy.fullName} on {request.requestDate}</p>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign To (Admin)</label>
                    <div className="relative">
                        <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                            value={assignedToId}
                            onChange={(e) => setAssignedToId(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-siteblue focus:border-siteblue"
                            required
                        >
                            {adminUsers.map(u => (
                                <option key={u.id} value={u.id}>{u.fullName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                        <select 
                            value={priority}
                            onChange={(e) => setPriority(e.target.value as TaskPriority)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-siteblue focus:border-siteblue"
                        >
                            <option value={TaskPriority.HIGH}>High</option>
                            <option value={TaskPriority.MEDIUM}>Medium</option>
                            <option value={TaskPriority.LOW}>Low</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Due Date</label>
                        <div className="relative">
                            <input 
                                type="date" 
                                value={dueDate}
                                onChange={(e) => setDueDate(e.target.value)}
                                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-siteblue focus:border-siteblue"
                                required
                            />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Task Description / Instructions</label>
                    <textarea 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-siteblue focus:border-siteblue"
                        placeholder="E.g. Verify stock, order from vendor, configure device..."
                    />
                </div>
            </div>

            <div className="p-4 bg-[rgb(248,249,250)] border-t border-slate-200 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded-md text-sm font-medium text-slate-700 hover:bg-slate-50">
                    Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-siteblue rounded-md text-sm font-medium text-white hover:opacity-90 shadow-sm flex items-center gap-2">
                    <CheckSquare size={16} /> Confirm Approval
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
