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

export const getIdentity = (level: number) => {
  const levels = Object.keys(IDENTITY_TITLES).map(Number).sort((a, b) => b - a);
  const found = levels.find(l => level >= l);
  return IDENTITY_TITLES[found || 1];
};

export const getPhase = (level: number) => {
  return PHASES.find(p => level >= p.range[0] && level <= p.range[1]) || PHASES[PHASES.length - 1];
};

export const calculateLevel = (xp: number) => {
  // Constant 1000 XP per level for clear, sequential progression
  return Math.floor(xp / 1000) + 1;
};

export const getNextLevelXp = (level: number) => {
  return 1000;
};
