export type Priority = 'low' | 'medium' | 'high';
export type Status = 'todo' | 'in-progress' | 'done';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: string;
  dueDate?: string;
  createdAt: string;
  completedAt?: string;
  image_url?: string;
  notes?: string;
  module?: string;
}
