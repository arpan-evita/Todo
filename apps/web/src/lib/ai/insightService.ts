import { supabase } from '../supabase';
import { calculateLevel } from '../gameLogic';

export interface Insight {
  text: string;
  type: 'warning' | 'opportunity' | 'performance';
}

export const generateInsights = async (userId: string) => {
  const insights: Insight[] = [];

  try {
    // 1. Fetch recent activity logs (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const { data: logs } = await supabase
      .from('UserActivityLog')
      .select('*')
      .eq('userId', userId)
      .gte('timestamp', sevenDaysAgo);

    // 2. Fetch profile for XP/Level info
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (!logs || !profile) return [];

    // --- RULE-BASED INSIGHT GENERATION ---

    // A. XP Analysis (Opportunity)
    const xp = profile.xp || 0;
    const xpToNext = 1000 - (xp % 1000);
    if (xpToNext < 300) {
      insights.push({
        text: `You're only ${xpToNext} XP away from Level ${calculateLevel(xp) + 1}. Just a couple more tasks and you'll level up!`,
        type: 'opportunity'
      });
    }

    // B. Productivity Patterns (Performance)
    const completions = logs.filter(l => l.action === 'task_completed');
    
    // Velocity Check
    const today = new Date().toDateString();
    const completionsToday = completions.filter(l => new Date(l.timestamp).toDateString() === today).length;
    const avgCompletions = completions.length / 7;

    if (completionsToday > avgCompletions && completionsToday > 0) {
      insights.push({
        text: `You're crushing it today! You've already done ${completionsToday} tasks, which is better than your usual daily average.`,
        type: 'performance'
      });
    }

    if (completions.length > 0) {
      const hours = completions.map(l => new Date(l.timestamp).getHours());
      const peakHour = mode(hours);
      insights.push({
        text: `I've noticed you're usually most productive around ${peakHour}:00. Maybe try to schedule your hardest tasks for then?`,
        type: 'performance'
      });
    }

    // C. Mode Analysis (Strategy)
    const moneyModeTasks = logs.filter(l => l.action === 'task_completed' && l.metadata?.mode === 'Money');
    if (profile.mode === 'Money' && moneyModeTasks.length === 0) {
      insights.push({
        text: "You're in Money Mode but haven't checked off any revenue-focused tasks today. Want to pick one to work on?",
        type: 'warning'
      });
    }

    // D. Streak Warning (Urgency)
    if (profile.streak > 0) {
      const lastActive = new Date(profile.last_active);
      const diffHours = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
      if (diffHours > 20) {
        insights.push({
          text: `Don't let that ${profile.streak}-day streak slip away! Try to get just one task done in the next few hours to keep it going.`,
          type: 'warning'
        });
      }
    }

    // 3. Save generated insights to DB (optional, but good for persistence)
    for (const insight of insights) {
      await supabase.from('AIInsight').insert([{
        userId,
        text: insight.text,
        type: nsideTypeMap[insight.type] || 'performance'
      }]);
    }

    return insights;
  } catch (err) {
    console.error('INSIGHT_GENERATION_FAILURE:', err);
    return [];
  }
};

// Helper to find most frequent value
function mode(arr: number[]) {
  return arr.sort((a, b) =>
    arr.filter(v => v === a).length - arr.filter(v => v === b).length
  ).pop();
}

const nsideTypeMap: any = {
  'warning': 'warning',
  'opportunity': 'opportunity',
  'performance': 'performance'
};
