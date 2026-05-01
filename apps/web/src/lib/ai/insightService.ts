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
        text: `You are only ${xpToNext} XP away from Level ${calculateLevel(xp) + 1}. Complete 2 missions to evolve.`,
        type: 'opportunity'
      });
    }

    // B. Productivity Patterns (Performance)
    const completions = logs.filter(l => l.action === 'task_completed');
    if (completions.length > 0) {
      const hours = completions.map(l => new Date(l.timestamp).getHours());
      const peakHour = mode(hours);
      insights.push({
        text: `Neural analysis shows your peak productivity spike at ${peakHour}:00. Deploy your hardest missions then.`,
        type: 'performance'
      });
    }

    // C. Mode Analysis (Strategy)
    const moneyModeTasks = logs.filter(l => l.action === 'task_completed' && l.metadata?.mode === 'Money');
    if (profile.mode === 'Money' && moneyModeTasks.length === 0) {
      insights.push({
        text: "You are in Money Mode but haven't secured any revenue-generating mandates today. Focus on income actions.",
        type: 'warning'
      });
    }

    // D. Streak Warning (Urgency)
    if (profile.streak > 0) {
      const lastActive = new Date(profile.last_active);
      const diffHours = (Date.now() - lastActive.getTime()) / (1000 * 60 * 60);
      if (diffHours > 20) {
        insights.push({
          text: `Neural link degradation detected. Deploy a mission within 4 hours to maintain your ${profile.streak}-day streak.`,
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
