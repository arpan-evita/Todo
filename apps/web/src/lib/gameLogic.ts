export const PHASES = [
  { name: 'Awakening', range: [1, 10], xpGoal: 10000, color: '#00ff88' },
  { name: 'Growth', range: [11, 25], xpGoal: 25000, color: '#00f2ff' },
  { name: 'Dominance', range: [26, 50], xpGoal: 50000, color: '#7000ff' },
  { name: 'Empire', range: [51, 75], xpGoal: 75000, color: '#ff3b30' },
  { name: 'Legacy', range: [76, 100], xpGoal: 100000, color: '#ffcc00' },
];

export const IDENTITY_TITLES: Record<number, string> = {
  1: 'Initiate', 2: 'Starter', 3: 'Explorer', 4: 'Operator', 5: 'Disciplined',
  6: 'Executor', 7: 'Focused Mind', 8: 'Consistent', 9: 'Builder', 10: 'Rising Player',
  11: 'Hustler', 12: 'Strategist', 13: 'Planner', 14: 'System Thinker', 15: 'Problem Solver',
  16: 'Action Taker', 17: 'Closer', 18: 'Value Creator', 19: 'Performer', 20: 'Growth Engine',
  26: 'Authority', 27: 'Negotiator', 28: 'Deal Maker', 29: 'Revenue Driver', 30: 'Elite Operator',
  51: 'Founder', 52: 'System Owner', 53: 'Wealth Builder', 54: 'Team Leader', 55: 'Scale Master',
  76: 'Titan', 77: 'Legend', 78: 'Icon', 79: 'Market King', 80: 'Industry Titan',
  95: 'Unstoppable', 96: 'Apex Predator', 97: 'World-Class', 98: 'Dominator', 99: 'Myth', 100: 'Ascended'
};

export const MODES = {
  BUILDER: { name: 'Builder', multiplier: 1.0, focus: 'Balanced Growth' },
  MONEY: { name: 'Money', multiplier: 1.5, focus: 'Revenue Generation' },
  MONK: { name: 'Monk', multiplier: 1.2, focus: 'Deep Work & Discipline' },
  WAR: { name: 'War', multiplier: 2.0, focus: 'High Intensity Execution' }
};

export const getIdentity = (level: number) => {
  const levels = Object.keys(IDENTITY_TITLES).map(Number).sort((a, b) => b - a);
  const found = levels.find(l => level >= l);
  return IDENTITY_TITLES[found || 1];
};

export const getPhase = (level: number) => {
  return PHASES.find(p => level >= p.range[0] && level <= p.range[1]) || PHASES[PHASES.length - 1];
};

export const calculateLevel = (xp: number) => {
  return Math.floor(xp / 1000) + 1;
};

export const getNextLevelXp = (level: number) => {
  return 1000;
};

export const calculateFinalXp = (baseXp: number, mode: string, streak: number) => {
  let multiplier = 1.0;
  
  // Mode Multiplier
  const modeData = Object.values(MODES).find(m => m.name.toLowerCase() === mode.toLowerCase());
  if (modeData) multiplier *= modeData.multiplier;
  
  // Streak Multiplier
  if (streak >= 30) multiplier *= 1.5;
  else if (streak >= 7) multiplier *= 1.25;
  else if (streak >= 3) multiplier *= 1.1;
  
  return Math.round(baseXp * multiplier);
};

export const checkStreakAndPenalties = (lastActive: string, currentXp: number, currentStreak: number) => {
  if (!lastActive) return { newStreak: currentStreak, penaltyXp: 0, status: 'active' };

  const last = new Date(lastActive);
  const now = new Date();
  
  // Reset time to start of day for accurate day diff
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

  let newStreak = currentStreak;
  let penaltyXp = 0;
  let status = 'active';

  if (diffDays > 2) {
    // Missed more than 2 days
    newStreak = 0;
    penaltyXp = Math.min(currentXp, 1000); // Max 1000 XP penalty
    status = 'reset';
  } else if (diffDays === 2) {
    // Missed 1 full day
    newStreak = 0;
    penaltyXp = 500;
    status = 'broken';
  } else if (diffDays === 1) {
    // Current day (no action yet) or just 1 day diff
    status = 'warning';
  }

  return { newStreak, penaltyXp, status };
};

export const calculateNewStreak = (lastActive: string | undefined, currentStreak: number) => {
  if (!lastActive) return 1;

  const last = new Date(lastActive);
  const now = new Date();
  
  // Reset time to start of day for accurate day diff
  const lastDay = new Date(last.getFullYear(), last.getMonth(), last.getDate());
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const diffDays = Math.floor((today.getTime() - lastDay.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already active today. 
    // If streak is 0, it means it was recently reset (e.g. by initialize). 
    // Completing a task should make it 1.
    if (currentStreak === 0) return 1;
    return currentStreak;
  } else if (diffDays === 1) {
    // Active yesterday, increment streak
    return currentStreak + 1;
  } else {
    // Missed days, start new streak
    return 1;
  }
};
