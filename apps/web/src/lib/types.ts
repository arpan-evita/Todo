export type Priority = 'low' | 'medium' | 'high';
export type Status = 'pending' | 'in-progress' | 'completed';
export type MissionType = 'daily' | 'weekly' | 'boss';

export interface Task {
  id: string;
  userId: string;
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
  proof_screenshot_url?: string;
  proof_video_url?: string;
  assigned_by?: string;
  mode?: string;
  assigned_role?: string;
}

export interface UserProfile {
  id: string;
  email?: string;
  full_name: string;
  avatar_url: string;
  level: number;
  xp: number;
  streak: number;
  mode: string;
  role: 'user' | 'parent';
  parent_id?: string;
  custom_modules: string[];
  social_links: any;
}
