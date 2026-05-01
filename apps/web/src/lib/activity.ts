import { supabase } from './supabase';

export type ActivityAction = 
  | 'task_completed' 
  | 'task_created' 
  | 'login' 
  | 'mode_change' 
  | 'streak_check'
  | 'achievement_unlocked';

export const logActivity = async (userId: string, action: ActivityAction, metadata: any = {}) => {
  try {
    const { error } = await supabase
      .from('UserActivityLog')
      .insert([
        { 
          userId, 
          action, 
          metadata,
          timestamp: new Date().toISOString() 
        }
      ]);
    
    if (error) console.error('LOGGING_ERROR:', error.message);
  } catch (err) {
    console.error('CRITICAL_LOGGING_FAILURE:', err);
  }
};
