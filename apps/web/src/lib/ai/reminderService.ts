import { supabase } from '../supabase';
import type { Task } from '../types';

export interface NeuralPing {
  id: string;
  type: 'overdue' | 'high-priority' | 'stagnant';
  message: string;
  taskTitle: string;
  urgency: 'critical' | 'high' | 'medium';
}

export const getNeuralPings = async (userId: string): Promise<NeuralPing[]> => {
  try {
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'pending');

    if (!tasks || tasks.length === 0) return [];

    const now = new Date();
    const pings: NeuralPing[] = [];

    tasks.forEach((task: Task) => {
      // 1. Overdue Check
      if (task.due_date && new Date(task.due_date) < now) {
        pings.push({
          id: task.id,
          type: 'overdue',
          message: `CRITICAL SLIPPAGE: Deadline for "${task.title}" has passed. Immediate execution required.`,
          taskTitle: task.title,
          urgency: 'critical'
        });
      }
      // 2. High Priority Check
      else if (task.priority === 'high') {
        pings.push({
          id: task.id,
          type: 'high-priority',
          message: `PRIORITY TARGET: "${task.title}" is a high-value mandate. Don't lose focus.`,
          taskTitle: task.title,
          urgency: 'high'
        });
      }
      // 3. Stagnation Check (Created more than 3 days ago and still pending)
      const createdDate = new Date(task.created_at);
      const daysSinceCreation = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
      if (daysSinceCreation > 3) {
        pings.push({
          id: task.id,
          type: 'stagnant',
          message: `STAGNATION DETECTED: "${task.title}" has been in your terminal for ${Math.floor(daysSinceCreation)} days. Clear it or terminate it.`,
          taskTitle: task.title,
          urgency: 'medium'
        });
      }
    });

    // Sort by urgency
    const urgencyWeight = { critical: 3, high: 2, medium: 1 };
    return pings.sort((a, b) => urgencyWeight[b.urgency] - urgencyWeight[a.urgency]);
  } catch (err) {
    console.error('NEURAL_PING_FAILURE:', err);
    return [];
  }
};

export const analyzeTaskPatterns = (tasks: Task[]) => {
  const completed = tasks.filter(t => t.status === 'completed');
  const pending = tasks.filter(t => t.status === 'pending');
  
  if (tasks.length === 0) return "No operational data to analyze.";

  const highPriorityRatio = pending.filter(t => t.priority === 'high').length / pending.length;
  const averageXp = completed.length > 0 ? completed.reduce((acc, t) => acc + (t.xp || 0), 0) / completed.length : 0;
  
  let insight = "";
  if (highPriorityRatio > 0.5) {
    insight = "You're heavy on high-priority mandates. Tactical overload is imminent.";
  } else if (averageXp < 100 && completed.length > 5) {
    insight = "You're focusing on low-value targets. Aim for 'Boss' level missions to accelerate growth.";
  } else if (completed.length > 0) {
    insight = "Consistent execution pattern detected. Operational efficiency is within parameters.";
  } else {
    insight = "New operator detected. Baseline performance data being established.";
  }

  return insight;
};
