export const PHASES = [
  { name: 'Awakening', range: [1, 10], xpGoal: 1000, color: '#00ff88' },
  { name: 'Growth', range: [11, 25], xpGoal: 5000, color: '#00f2ff' },
  { name: 'Dominance', range: [26, 50], xpGoal: 25000, color: '#7000ff' },
  { name: 'Empire', range: [51, 75], xpGoal: 100000, color: '#ff3b30' },
  { name: 'Legacy', range: [76, 100], xpGoal: 500000, color: '#ffcc00' },
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

export const getIdentity = (level: number) => {
  const levels = Object.keys(IDENTITY_TITLES).map(Number).sort((a, b) => b - a);
  const found = levels.find(l => level >= l);
  return IDENTITY_TITLES[found || 1];
};

export const getPhase = (level: number) => {
  return PHASES.find(p => level >= p.range[0] && level <= p.range[1]) || PHASES[PHASES.length - 1];
};

export const calculateLevel = (xp: number) => {
  // Phase 1: 0-1000 (Levels 1-10) -> 100 XP per level
  if (xp <= 1000) return Math.min(10, Math.floor(xp / 100) + 1);
  // Phase 2: 1001-5000 (Levels 11-25) -> 266 XP per level
  if (xp <= 5000) return Math.min(25, 11 + Math.floor((xp - 1000) / 266));
  // Phase 3: 5001-25000 (Levels 26-50) -> 800 XP per level
  if (xp <= 25000) return Math.min(50, 26 + Math.floor((xp - 5000) / 800));
  // Phase 4: 25001-100000 (Levels 51-75) -> 3000 XP per level
  if (xp <= 100000) return Math.min(75, 51 + Math.floor((xp - 25000) / 3000));
  // Phase 5: 100001-500000 (Levels 76-100) -> 16000 XP per level
  return Math.min(100, 76 + Math.floor((xp - 100000) / 16000));
};

export const getNextLevelXp = (level: number) => {
  if (level < 10) return 100;
  if (level < 25) return 266;
  if (level < 50) return 800;
  if (level < 75) return 3000;
  return 16000;
};
