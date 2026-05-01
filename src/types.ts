export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: string;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  image_url?: string;
  notes?: string;
  module?: string;
}
