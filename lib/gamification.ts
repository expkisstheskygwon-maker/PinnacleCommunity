/**
 * Gamification Logic for Pinnacle Community
 */

export interface LevelInfo {
  level: number;
  title: string;
  minScore: number;
  nextScore: number;
  progress: number;
  color: string;
  badgeColor: string;
}

/**
 * Calculates level based on score
 * Formula: Required Score for Level N = (N-1) * N * 50
 */
export function calculateLevel(score: number): number {
  if (score < 100) return 1;
  // Solving (N-1)*N*50 = score  => 50N^2 - 50N - score = 0
  // N = (50 + sqrt(2500 + 4 * 50 * score)) / 100
  // Simplified: N = (1 + sqrt(1 + 0.08 * score)) / 2
  const level = Math.floor((1 + Math.sqrt(1 + 0.08 * score)) / 2);
  return Math.max(1, level);
}

/**
 * Gets required score for a specific level
 */
export function getRequiredScore(level: number): number {
  if (level <= 1) return 0;
  return (level - 1) * level * 50;
}

/**
 * Gets detailed level information
 */
export function getLevelInfo(score: number): LevelInfo {
  const level = calculateLevel(score);
  const minScore = getRequiredScore(level);
  const nextScore = getRequiredScore(level + 1);
  
  const progress = level >= 99 ? 100 : Math.min(100, Math.max(0, ((score - minScore) / (nextScore - minScore)) * 100));
  
  let title = "루키";
  let color = "text-muted-foreground";
  let badgeColor = "bg-white/10";

  if (level >= 20) {
    title = "마스터";
    color = "text-[hsl(var(--gold))]";
    badgeColor = "bg-[hsl(var(--gold))]/20 text-[hsl(var(--gold))] border-[hsl(var(--gold))]/30";
  } else if (level >= 10) {
    title = "프로";
    color = "text-emerald-400";
    badgeColor = "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
  } else if (level >= 5) {
    title = "애널리스트";
    color = "text-primary";
    badgeColor = "bg-primary/20 text-primary border-primary/30";
  }

  return { level, title, minScore, nextScore, progress, color, badgeColor };
}
