import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const XP_PER_LEVEL = 100;

function todayKey(): string {
  return new Date().toISOString().slice(0, 10); // YYYY-MM-DD
}

function dayDiff(a: string, b: string): number {
  const ms = new Date(b).getTime() - new Date(a).getTime();
  return Math.round(ms / 86_400_000);
}

interface ProgressState {
  xp: number;
  completedLessons: string[];
  completedChallenges: string[];
  playedSongs: string[];
  /** Best star rating (0..3) per challenge id. */
  challengeStars: Record<string, number>;
  totalStars: number;
  streakDays: number;
  lastActiveDay: string | null;

  addXp: (amount: number) => void;
  markActiveToday: () => void;
  completeLesson: (id: string, xp?: number) => void;
  completeChallenge: (id: string, stars: number, xp?: number) => void;
  recordSong: (id: string, xp?: number) => void;
  reset: () => void;
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      xp: 0,
      completedLessons: [],
      completedChallenges: [],
      playedSongs: [],
      challengeStars: {},
      totalStars: 0,
      streakDays: 0,
      lastActiveDay: null,

      addXp: (amount) => set((s) => ({ xp: s.xp + amount })),

      markActiveToday: () => {
        const today = todayKey();
        const { lastActiveDay, streakDays } = get();
        if (lastActiveDay === today) return;
        let nextStreak = 1;
        if (lastActiveDay) {
          const diff = dayDiff(lastActiveDay, today);
          nextStreak = diff === 1 ? streakDays + 1 : 1;
        }
        set({ streakDays: nextStreak, lastActiveDay: today });
      },

      completeLesson: (id, xp = 20) => {
        get().markActiveToday();
        set((s) => ({
          completedLessons: s.completedLessons.includes(id)
            ? s.completedLessons
            : [...s.completedLessons, id],
          xp: s.xp + (s.completedLessons.includes(id) ? 0 : xp),
        }));
      },

      completeChallenge: (id, stars, xp = 15) => {
        get().markActiveToday();
        set((s) => {
          const prevStars = s.challengeStars[id] ?? 0;
          const bestStars = Math.max(prevStars, stars);
          const starDelta = bestStars - prevStars;
          const isNew = !s.completedChallenges.includes(id);
          return {
            completedChallenges: isNew ? [...s.completedChallenges, id] : s.completedChallenges,
            challengeStars: { ...s.challengeStars, [id]: bestStars },
            totalStars: s.totalStars + starDelta,
            xp: s.xp + (isNew ? xp : 0) + starDelta * 5,
          };
        });
      },

      recordSong: (id, xp = 10) => {
        get().markActiveToday();
        set((s) => ({
          playedSongs: s.playedSongs.includes(id) ? s.playedSongs : [...s.playedSongs, id],
          xp: s.xp + (s.playedSongs.includes(id) ? 0 : xp),
        }));
      },

      reset: () =>
        set({
          xp: 0,
          completedLessons: [],
          completedChallenges: [],
          playedSongs: [],
          challengeStars: {},
          totalStars: 0,
          streakDays: 0,
          lastActiveDay: null,
        }),
    }),
    { name: 'pianolab-progress' },
  ),
);

/** Current level (1-based) derived from total XP. */
export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

/** XP still needed to reach the next level. */
export function xpToNextLevel(xp: number): number {
  return XP_PER_LEVEL - (xp % XP_PER_LEVEL);
}

/** Progress (0..1) within the current level. */
export function levelProgress(xp: number): number {
  return (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
}
