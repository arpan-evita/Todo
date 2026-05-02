import { supabase } from '../supabase';

export type OperativeState = 'driven' | 'neutral' | 'lazy' | 'overwhelmed' | 'frustrated' | 'demotivated' | 'peak';

export interface StateDetectionResult {
  state: OperativeState;
  confidence: number;
  signals: string[];
}

export const detectOperativeState = async (userId: string, textInput?: string): Promise<StateDetectionResult> => {
  try {
    // 1. Fetch recent behavioral data
    const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single();
    const { data: tasks } = await supabase.from('tasks').select('*').eq('userId', userId).eq('status', 'todo');
    const { data: logs } = await supabase.from('UserActivityLog').select('*').eq('userId', userId).order('timestamp', { ascending: false }).limit(20);

    if (!profile) return { state: 'neutral', confidence: 0.5, signals: ['No profile data'] };

    const signals: string[] = [];
    const pendingCount = tasks?.length || 0;
    const streak = profile.streak || 0;
    const lastActive = new Date(profile.last_active || Date.now());
    const inactivityHours = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);

    // 2. Behavioral Detection Logic
    let state: OperativeState = 'neutral';
    
    // DEMOTIVATED: No streak + long inactivity
    if (streak === 0 && inactivityHours > 24) {
      state = 'demotivated';
      signals.push('Critical streak loss + 24h+ silence');
    }
    // OVERWHELMED: Too many pending tasks
    else if (pendingCount > 8) {
      state = 'overwhelmed';
      signals.push(`Large backlog: ${pendingCount} tasks pending`);
    }
    // PEAK: High XP today or intense recent activity
    else if (profile.xp_today > 300 || (logs && logs.filter(l => l.action === 'task_completed').length > 3)) {
      state = 'peak';
      signals.push('Excellent momentum');
    }
    // DRIVEN: Healthy streak + recent completion
    else if (streak > 3 && inactivityHours < 4) {
      state = 'driven';
      signals.push('Strong, consistent pace');
    }
    // LAZY: Inactive for several hours during daytime
    else if (inactivityHours > 4 && inactivityHours < 12) {
      state = 'lazy';
      signals.push('Low activity period');
    }
    // FRUSTRATED: Multiple mode changes or task deletions (simulated)
    else if (logs && logs.filter(l => l.action === 'mode_change').length > 2) {
      state = 'frustrated';
      signals.push('Mode instability detected');
    }

    // 3. Textual Signal Refinement (Keyword check)
    if (textInput) {
      const lowerText = textInput.toLowerCase();
      if (lowerText.match(/tired|lazy|boring|don't want/)) state = 'lazy';
      if (lowerText.match(/hard|stressed|too much|help/)) state = 'overwhelmed';
      if (lowerText.match(/angry|stupid|wrong|fix/)) state = 'frustrated';
      if (lowerText.match(/done|ready|lets go|push/)) state = 'driven';
      signals.push('Text sentiment analyzed');
    }

    // 4. Update State in DB
    await supabase.from('UserState').upsert({
      userId,
      state,
      confidenceScore: 0.8,
      updatedAt: new Date().toISOString()
    }, { onConflict: 'userId' });

    return { state, confidence: 0.8, signals };
  } catch (err) {
    console.error('STATE_DETECTION_FAILURE:', err);
    return { state: 'neutral', confidence: 0.5, signals: ['System error'] };
  }
};
