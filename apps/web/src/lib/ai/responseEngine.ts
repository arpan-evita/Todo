import { STRATEGIES } from './strategyLibrary';
import { OperativeState } from './stateDetection';

export interface CoachingResponse {
  insight: string;
  action: string;
  urgency: string;
  tone: string;
}

export type AIIntent = 'general' | 'plan' | 'strategy' | 'motivation' | 'knowledge';

const TONE_MAP: Record<OperativeState, any> = {
  driven: {
    prefix: "YOU'RE ON A ROLL!",
    tone: "Energetic, Motivating",
    example: "You’re absolutely crushing it right now. Let's keep this momentum going!"
  },
  peak: {
    prefix: "UNSTOPPABLE MODE!",
    tone: "High Energy, Supportive",
    example: "You're in the flow! This is the perfect time to tackle those big goals while you're feeling this sharp."
  },
  overwhelmed: {
    prefix: "LET'S BREATHE.",
    tone: "Calm, Kind, Simplifying",
    example: "It feels like a lot right now, doesn't it? Let's take a step back and just focus on one small thing first."
  },
  frustrated: {
    prefix: "STAY WITH ME.",
    tone: "Empathetic, Grounded",
    example: "I know it's frustrating when things don't go as planned. Let's reset and find a simple win to get back on track."
  },
  demotivated: {
    prefix: "WE'VE GOT THIS.",
    tone: "Encouraging, Vision-focused",
    example: "Everyone has off days. Let's not worry about the big picture for a second—what's one tiny thing we can do right now?"
  },
  lazy: {
    prefix: "GENTLE PUSH.",
    tone: "Direct but Friendly",
    example: "I've noticed we've been sitting still for a bit. How about we just do 5 minutes of work to break the ice?"
  },
  neutral: {
    prefix: "STEADY PROGRESS.",
    tone: "Balanced, Consistent",
    example: "You're keeping a good pace. Let's just keep ticking those boxes one by one."
  }
};

export const generateIntelligentResponse = async (
  intent: AIIntent,
  state: OperativeState,
  data: { 
    xp: number; 
    streak: number; 
    pendingTasks: any[]; 
    level: number; 
    mode?: string;
    name?: string;
  }
): Promise<CoachingResponse> => {
  const mode = data.mode || 'Builder';
  const name = data.name || 'Arpan';
  
  let insight = "";
  let action = "";
  let urgency = "";
  let tone = "COACHING MODE";

  switch (intent) {
    case 'plan':
      tone = "MISSION PLANNER";
      const topTasks = [...data.pendingTasks]
        .sort((a, b) => (b.xpReward || 0) - (a.xpReward || 0))
        .slice(0, 3);
      
      if (topTasks.length === 0) {
        insight = `Everything is secure, ${name}. Your list is clear.`;
        action = "Take some time for strategic thinking or add a new 'Boss' level mission.";
        urgency = "Use this calm to prepare for the next push.";
      } else {
        insight = `I've analyzed your ${data.pendingTasks.length} pending tasks. Based on your current ${mode} mode, here's the optimal sequence.`;
        action = topTasks.map((t, i) => `${i + 1}. ${t.title} (+${t.xpReward} XP)`).join(' → ');
        urgency = `Focus on '${topTasks[0].title}' first. It has the highest impact on your growth.`;
      }
      break;

    case 'strategy':
      tone = "STRATEGIST";
      const randomStrat = STRATEGIES.PRODUCTIVITY[Math.floor(Math.random() * STRATEGIES.PRODUCTIVITY.length)];
      insight = `Let's use the ${randomStrat.name} approach. ${randomStrat.description}`;
      action = `Apply this now: ${randomStrat.tip}`;
      urgency = `Strategic thinking is what separates an Operator from a Legend.`;
      break;

    case 'motivation':
      tone = "MENTOR";
      const quotes = data.streak === 0 ? STRATEGIES.MOTIVATION.STREAK_RECOVERY : STRATEGIES.MOTIVATION.LOW;
      insight = quotes[Math.floor(Math.random() * quotes.length)];
      action = "Just do one 2-minute task. Don't think about the rest.";
      urgency = "I'm with you, let's just get this one win.";
      break;

    case 'knowledge':
      tone = "KNOWLEDGE BASE";
      const model = STRATEGIES.MENTAL_MODELS[Math.floor(Math.random() * STRATEGIES.MENTAL_MODELS.length)];
      insight = `${model.name}: ${model.description}`;
      action = `Productivity Tip: ${model.tip}`;
      urgency = "Applying this knowledge effectively will double your output.";
      break;

    default:
      return generateCoachingResponse(state, { 
        xp: data.xp, 
        streak: data.streak, 
        pending: data.pendingTasks.length, 
        level: data.level,
        mode 
      });
  }

  return { insight, action, urgency, tone };
};

export const generateCoachingResponse = async (
  state: OperativeState, 
  data: { xp: number; streak: number; pending: number; level: number; mode?: string }
): Promise<CoachingResponse> => {
  const config = TONE_MAP[state];
  const mode = data.mode || 'Builder';
  
  let insight = "";
  let action = "";
  let urgency = "";

  // Base Logic
  switch (state) {
    case 'driven':
      insight = `You've kept your ${data.streak}-day streak alive and your XP is soaring. You're really in the zone!`;
      action = "Is there a 'big' task you've been putting off? Today is the perfect day to crush it.";
      urgency = "You're so close to Level ${data.level + 1}. Let's make it happen!";
      break;
    case 'overwhelmed':
      insight = `You have ${data.pending} tasks waiting for you. It's totally okay to feel a bit stretched.`;
      action = "Forget the whole list for a moment. Just pick the very first task and give it 15 minutes.";
      urgency = "Taking that first step is always the hardest, but you'll feel so much better once it's done.";
      break;
    case 'lazy':
      insight = "It looks like we've had some downtime today. Your goals are still waiting for you!";
      action = "Just one small task. That's all I'm asking. 5 minutes, then you can decide if you want to stop.";
      urgency = "Don't let the day slip away—you'll be so glad you did this tomorrow.";
      break;
    case 'frustrated':
      insight = "I can tell things are feeling a bit clunky today. It happens to the best of us.";
      action = "Let's pick the easiest, quickest task on your list just to get a win under your belt.";
      urgency = "Focus on the action, not the feeling. You're stronger than the frustration.";
      break;
    case 'demotivated':
      insight = "It's tough when the spark isn't there, but your streak shows how much effort you've put in.";
      action = "What's one thing you could do today that your future self would thank you for?";
      urgency = "Just a tiny bit of progress today is a massive win in my book.";
      break;
    case 'peak':
      insight = "You're performing at an incredible level today! This is your peak time.";
      action = "Let's see if we can knock out 3 tasks in the next hour. You've totally got this.";
      urgency = "Ride this wave as long as you can—it's where the magic happens!";
      break;
    default:
      insight = `You're holding steady with a ${data.streak}-day streak. Consistency is your superpower.`;
      action = "Keep working through your list. You're doing exactly what you need to do.";
      urgency = "Every small step is leading to something big. Keep going!";
  }

  // Mode-specific overrides/additions
  if (mode === 'War') {
    action = `[WAR MODE] ${action} Speed is everything today. Don't think, just execute.`;
    urgency = "Victory is the only option. No excuses.";
  } else if (mode === 'Monk') {
    action = `[MONK MODE] ${action} Clear your space, turn off notifications, and find your focus.`;
    urgency = "Discipline is freedom. Stay in the silence.";
  } else if (mode === 'Money') {
    insight = `[MONEY MODE] ${insight} Focus on the high-value targets that move the needle.`;
    action = "Identify the task most likely to generate revenue and finish it before anything else.";
  }

  return { insight, action, urgency, tone: config.prefix };
};
