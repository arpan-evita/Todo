export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'completed';
export type MissionType = 'daily' | 'weekly' | 'boss';

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  type: MissionType;
  due_date?: string;
  created_at: string;
  completed_at?: string;
  image_url?: string;
  link?: string;
  module?: string;
  xp: number;
}

export interface UserProfile {
  id: string;
  full_name: string;
  avatar_url: string;
  level: number;
  xp: number;
  streak: number;
  mode: string;
  custom_modules: string[];
  social_links: any;
}
