export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: { xp: number; streak: number; completedCount: number }) => boolean;
}

export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_task',
    title: 'First Mandate Secured',
    description: 'Complete your first mission.',
    icon: '🎯',
    check: ({ completedCount }) => completedCount >= 1
  },
  {
    id: 'streak_7',
    title: 'Consistency Master',
    description: 'Maintain a 7-day operational streak.',
    icon: '🔥',
    check: ({ streak }) => streak >= 7
  },
  {
    id: 'xp_10k',
    title: 'Elite Operative',
    description: 'Accumulate 10,000 XP.',
    icon: '💎',
    check: ({ xp }) => xp >= 10000
  },
  {
    id: 'ascended',
    title: 'Ascended Operative',
    description: 'Reach Level 100.',
    icon: '👑',
    check: ({ xp }) => xp >= 100000
  }
];

export const checkNewAchievements = (
  stats: { xp: number; streak: number; completedCount: number },
  existingIds: string[]
) => {
  return ACHIEVEMENTS.filter(a => a.check(stats) && !existingIds.includes(a.id));
};
