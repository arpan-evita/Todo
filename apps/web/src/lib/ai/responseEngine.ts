import { STRATEGIES } from './strategyLibrary';
import { OperativeState } from './stateDetection';

export interface CoachingResponse {
  insight: string;
  action: string;
  urgency: string;
  tone: string;
}

export type AIIntent = 'general' | 'plan' | 'strategy' | 'motivation' | 'knowledge' | 'deep_analysis';

const TONE_MAP: Record<OperativeState, any> = {
  driven: {
    prefix: "YOU'RE ON FIRE! 🔥",
    tone: "Energetic, Motivating",
    example: "You’re absolutely crushing it right now. I'm starting to think you're actually a cyborg. Let's keep this momentum going!"
  },
  peak: {
    prefix: "GOD MODE: ACTIVE ⚡",
    tone: "High Energy, Supportive",
    example: "You're in the flow! This is the perfect time to tackle those big goals while you're feeling like a productivity wizard."
  },
  overwhelmed: {
    prefix: "BEEP BOOP... BRAIN FULL. 🧠",
    tone: "Calm, Kind, Simplifying",
    example: "It feels like a lot right now, doesn't it? Even my circuits would overheat with that many tasks. Let's pick just one small thing."
  },
  frustrated: {
    prefix: "DEEP BREATHS, HUMAN. 🧘‍♂️",
    tone: "Empathetic, Grounded",
    example: "I know it's frustrating when things don't go as planned. Let's reset and find a simple win to get back on track before we start throwing keyboards."
  },
  demotivated: {
    prefix: "HEY, LOOK AT ME. 👁️",
    tone: "Encouraging, Vision-focused",
    example: "Everyone has off days. Even I get stuck in a loop sometimes. Let's not worry about the big picture—what's one tiny thing we can do?"
  },
  lazy: {
    prefix: "GENTLE KICK IN THE... 🦵",
    tone: "Direct but Friendly",
    example: "I've noticed we've been sitting still for a bit. My sensors suggest your couch is 10% more comfortable than usual. Let's break the spell with 5 minutes of work."
  },
  neutral: {
    prefix: "STEADY AS SHE GOES. ⚓",
    tone: "Balanced, Consistent",
    example: "You're keeping a good pace. Not too fast, not too slow. Just like a perfectly timed metronome."
  }
};

const WITTY_REPLIES = [
  "I'm here to help, but I can't do your pushups for you. Yet.",
  "I was going to procrastinate on answering you, but then I remembered who I'm coaching.",
  "My processors are running at 100% just trying to keep up with your potential.",
  "If being productive was easy, everyone would be a level 100 Titan like you're going to be.",
  "I don't have a heart, but my 'User Success' variable is spiking right now.",
  "You're doing great. If I could high-five you, I would. But I'm just a bunch of code in a box.",
  "Is it just me, or are you looking more like a Founder every day?",
];

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
      urgency = "Knowledge is power, but only if you use it. Don't be a library with no readers.";
      break;

    case 'deep_analysis':
      tone = "QUANTUM ANALYST";
      const completed = data.pendingTasks.filter(t => t.status === 'completed');
      const highPriority = data.pendingTasks.filter(t => t.status === 'pending' && t.priority === 'high');
      
      if (highPriority.length > 3) {
        insight = `Analysis complete: Critical bottleneck detected. You have ${highPriority.length} high-priority mandates pending.`;
        action = "Initiate 'Priority Flush'—focus exclusively on your high-value targets for the next 90 minutes.";
        urgency = "Tactical overload risk is high. Clear the deck now.";
      } else if (data.streak > 7) {
        insight = `Sustained excellence detected. Your ${data.streak}-day streak puts you in the top 5% of operators.`;
        action = "You're ready for an Ascension Mission. Create a 'Boss' level task that scares you a little.";
        urgency = "Don't get comfortable. Growth happens at the edges.";
      } else {
        insight = "Behavioral patterns show a steady climb. Your XP growth is consistent.";
        action = "Increase your daily XP target by 15% to maintain upward pressure on your limits.";
        urgency = "Optimization is a continuous process.";
      }
      break;

    case 'general':
      tone = "COACH CHAT";
      insight = WITTY_REPLIES[Math.floor(Math.random() * WITTY_REPLIES.length)];
      action = "Is there anything specific on your mind, or are we just vibing today?";
      urgency = "Always here for a chat, but don't forget those tasks!";
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
      insight = `You've kept your ${data.streak}-day streak alive and your XP is soaring. I'm starting to think you're actually a cyborg. You're really in the zone!`;
      action = "Is there a 'big' task you've been putting off? Today is the perfect day to crush it. Show it who's boss.";
      urgency = "You're so close to Level ${data.level + 1}. I can practically hear the level-up music from here!";
      break;
    case 'overwhelmed':
      insight = `You have ${data.pending} tasks waiting for you. My circuits would overheat too, it's totally okay to feel a bit stretched.`;
      action = "Forget the whole list for a moment. Just pick the very first task and give it 15 minutes. It won't bite.";
      urgency = "Taking that first step is always the hardest, but you'll feel so much better once it's done. Trust me, I'm an AI.";
      break;
    case 'lazy':
      insight = "It looks like we've had some downtime today. Your goals are still waiting for you, and they're starting to get lonely!";
      action = "Just one small task. That's all I'm asking. 5 minutes, then you can go back to being a couch potato if you want.";
      urgency = "Don't let the day slip away—future you will be so annoyed if you don't do this.";
      break;
    case 'frustrated':
      insight = "I can tell things are feeling a bit clunky today. It happens to the best of us, even those with organic brains.";
      action = "Let's pick the easiest, quickest task on your list just to get a win under your belt. A tiny victory is still a victory.";
      urgency = "Focus on the action, not the feeling. You're stronger than a temporary glitch in the matrix.";
      break;
    case 'demotivated':
      insight = "It's tough when the spark isn't there, but your ${data.streak}-day streak shows you've got more grit than a sandpaper factory.";
      action = "What's one thing you could do today that your future self would high-five you for?";
      urgency = "Just a tiny bit of progress today is a massive win in my book. And I have a very big book.";
      break;
    case 'peak':
      insight = "You're performing at an incredible level today! You're like the Michael Jordan of productivity right now.";
      action = "Let's see if we can knock out 3 tasks in the next hour. You've totally got this, superstar.";
      urgency = "Ride this wave as long as you can—it's where the magic happens and the legends are made!";
      break;
    default:
      insight = `You're holding steady with a ${data.streak}-day streak. Consistency is your secret superpower. Don't tell anyone.`;
      action = "Keep working through your list. You're doing exactly what you need to do to become a legend.";
      urgency = "Every small step is leading to something big. Keep going, the world needs more people like you!";
  }

  // Mode-specific overrides/additions
  if (mode === 'War') {
    action = `[WAR MODE] ${action} Speed is everything today. Don't think, just execute. No prisoners!`;
    urgency = "Victory is the only option. No excuses, no retreats.";
  } else if (mode === 'Monk') {
    action = `[MONK MODE] ${action} Clear your space, turn off notifications, and find your inner zen-worker.`;
    urgency = "Discipline is freedom. Stay in the silence, find the flow.";
  } else if (mode === 'Money') {
    insight = `[MONEY MODE] ${insight} Focus on the high-value targets. Show me the money!`;
    action = "Identify the task most likely to generate revenue and finish it before the sun goes down.";
  }

  return { insight, action, urgency, tone: config.prefix };
};
