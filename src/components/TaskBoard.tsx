import { useState } from 'react';
import { MoreVertical, Trash2, Clock } from 'lucide-react';
import type { Task, Status } from '../types';

interface TaskBoardProps {
  tasks: Task[];
  onUpdateStatus: (id: string, status: Status) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void;
}

const COLUMNS: { id: Status; label: string; color: string }[] = [
  { id: 'todo', label: 'OPERATIONAL', color: '#666' },
  { id: 'in-progress', label: 'ACTIVE', color: '#00f2ff' },
  { id: 'done', label: 'SECURED', color: '#00ff88' },
];

export default function TaskBoard({ tasks, onUpdateStatus, onEditTask, onDeleteTask }: TaskBoardProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {COLUMNS.map((column) => (
        <div key={column.id} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="label-caps" style={{ color: column.color, opacity: 0.6 }}>{column.label}</span>
            <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#444' }}>{tasks.filter(t => t.status === column.id).length}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {tasks.filter(t => t.status === column.id).map((task) => (
              <TaskCard 
                key={task.id} 
                task={task} 
                onUpdateStatus={onUpdateStatus}
                onEditTask={onEditTask}
                onDeleteTask={onDeleteTask}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function TaskCard({ task, onUpdateStatus, onEditTask, onDeleteTask }: any) {
  const [showActions, setShowActions] = useState(false);
  const isHigh = task.priority === 'high';
  const isActive = task.status === 'in-progress';

  return (
    <div 
      className={`glass-card task-item ${isHigh ? 'high' : ''} ${isActive ? 'active' : ''}`}
      onClick={() => setShowActions(!showActions)}
      style={{ padding: '20px', cursor: 'pointer' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '2px', height: '10px', background: isHigh ? '#ff3b30' : '#666' }}></div>
          <span className="label-caps" style={{ color: isHigh ? '#ff3b30' : '#666', fontSize: '10px' }}>
            {task.priority === 'high' ? 'CRITICAL' : task.priority === 'medium' ? 'ROUTINE' : 'LOW PRIO'}
          </span>
        </div>
        <MoreVertical size={18} style={{ color: '#444' }} />
      </div>

      <div style={{ marginBottom: '16px' }}>
        <h4 style={{ fontSize: '22px', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>{task.title}</h4>
        {task.description && (
          <p style={{ fontSize: '13px', color: '#999', lineHeight: 1.4 }}>{task.description}</p>
        )}
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {task.status === 'todo' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, 'in-progress'); }}
              style={{ flex: 1, padding: '12px', background: '#00f2ff', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '11px' }}
            >
              INITIALIZE
            </button>
          )}
          {task.status === 'in-progress' && (
            <button 
              onClick={(e) => { e.stopPropagation(); onUpdateStatus(task.id, 'done'); }}
              style={{ flex: 1, padding: '12px', background: '#34c759', border: 'none', borderRadius: '12px', fontWeight: 900, fontSize: '11px' }}
            >
              SECURE
            </button>
          )}
          <button 
            onClick={(e) => { e.stopPropagation(); onEditTask(task); }}
            style={{ padding: '12px', background: '#222', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
          >
            EDIT
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); onDeleteTask(task.id); }}
            style={{ padding: '12px', background: '#331111', border: 'none', borderRadius: '12px', color: '#ff3b30' }}
          >
            <Trash2 size={16} />
          </button>
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #222', paddingTop: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#666' }}>
          <Clock size={14} />
          <span style={{ fontSize: '11px', fontWeight: 'bold', fontFamily: 'monospace' }}>
            {task.dueDate ? new Date(task.dueDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) + ' ZULU' : 'ANYTIME'}
          </span>
        </div>
        <div style={{ padding: '4px 8px', background: '#111', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', color: '#00f2ff', border: '1px solid #222' }}>
          +{task.priority === 'high' ? '500' : task.priority === 'medium' ? '150' : '50'} XP
        </div>
      </div>
    </div>
  );
}
