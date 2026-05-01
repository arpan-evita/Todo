import { OperativeState } from './stateDetection';

export interface CoachingResponse {
  insight: string;
  action: string;
  urgency: string;
  tone: string;
}

const TONE_MAP: Record<OperativeState, any> = {
  driven: {
    prefix: "STATUS: DOMINATING.",
    tone: "Aggressive, Competitive",
    example: "You’re ahead of the pack. Push harder. Don't let the momentum fade."
  },
  peak: {
    prefix: "STATUS: ASCENDANT.",
    tone: "High Intensity, Urgent",
    example: "Neural synchronization at 100%. Maximize output now while the window is open."
  },
  overwhelmed: {
    prefix: "STATUS: COMPROMISED.",
    tone: "Calm, Simplifying, Directive",
    example: "Cognitive load exceeded. We are stripping the mission to its core. Focus on one."
  },
  frustrated: {
    prefix: "STATUS: UNSTABLE.",
    tone: "Logical, Corrective, Objective",
    example: "Emotional variance detected. Disregard friction. Focus on the system logic."
  },
  demotivated: {
    prefix: "STATUS: STALLED.",
    tone: "Identity-Driven, Reseting",
    example: "Operative identity fading. Reset sequence required. One task to reconnect."
  },
  lazy: {
    prefix: "STATUS: PASSIVE.",
    tone: "Direct, Harsh, Confrontational",
    example: "You are wasting prime execution hours. Deploy immediately or accept stagnation."
  },
  neutral: {
    prefix: "STATUS: NOMINAL.",
    tone: "Balanced, Consistent",
    example: "Steady rhythm detected. Maintain course and secure the next mandate."
  }
};

export const generateCoachingResponse = async (
  state: OperativeState, 
  data: { xp: number; streak: number; pending: number; level: number }
): Promise<CoachingResponse> => {
  const config = TONE_MAP[state];
  
  // Logic for dynamic content based on state
  let insight = "";
  let action = "";
  let urgency = "";

  switch (state) {
    case 'driven':
      insight = `You've secured a ${data.streak}-day streak and XP is climbing. You are in a flow state.`;
      action = "Select your most difficult 'Boss' mandate and crush it now.";
      urgency = "Level up is within reach. Don't let your guard down.";
      break;
    case 'overwhelmed':
      insight = `You have ${data.pending} pending mandates. Your cognitive processing is fragmented.`;
      action = "Ignore the list. Pick the TOP task and spend exactly 20 minutes on it.";
      urgency = "Indecision is the enemy. Act now or the backlog will bury the mission.";
      break;
    case 'lazy':
      insight = "Activity logs show significant idle time. You are operating at 20% capacity.";
      action = "Complete one 5-minute task right now. No excuses.";
      urgency = "Your discipline is eroding. Secure a win before the day is lost.";
      break;
    case 'frustrated':
      insight = "Inconsistent behavior detected. You are fighting the system instead of using it.";
      action = "Clear one small task to regain tactical control.";
      urgency = "Emotion is a signal, not a command. Return to execution.";
      break;
    case 'demotivated':
      insight = "Your streak is dead and your Level is stagnating. Remember why you started.";
      action = "Set one small goal for today. Just one.";
      urgency = "Every hour of silence makes the restart harder. Deploy now.";
      break;
    case 'peak':
      insight = "You are currently outperforming 95% of operatives. Momentum is extreme.";
      action = "Double down. Complete 3 tasks in the next hour.";
      urgency = "This state is temporary. Extract maximum value before the dip.";
      break;
    default:
      insight = `You are maintaining a ${data.streak}-day streak. Stability is good.`;
      action = "Continue your planned mandates. Stay the course.";
      urgency = "Consistency is the foundation of elite performance.";
  }

  return { insight, action, urgency, tone: config.prefix };
};
