import type { TechStack } from '@/types/database';

const CATEGORIES: (keyof TechStack)[] = [
  'frontend', 'backend', 'ai_engine', 'visualization',
  'security', 'integration', 'deployment',
];

/**
 * Convert TechStack object to flat TEXT[] for DB storage.
 * Format: ["frontend:React", "backend:Supabase", "deployment:Vercel"]
 */
export function techStackToArray(techStack: TechStack): string[] {
  const result: string[] = [];
  for (const category of CATEGORIES) {
    const items = techStack[category];
    if (items) {
      for (const item of items) {
        result.push(`${category}:${item}`);
      }
    }
  }
  return result;
}

/**
 * Convert flat TEXT[] from DB back to TechStack object.
 * Handles both "category:value" format and legacy plain values.
 */
export function arrayToTechStack(arr: string[]): TechStack {
  const result: TechStack = {};
  for (const entry of arr) {
    const colonIndex = entry.indexOf(':');
    if (colonIndex > 0) {
      const category = entry.substring(0, colonIndex) as keyof TechStack;
      const value = entry.substring(colonIndex + 1);
      if (CATEGORIES.includes(category)) {
        if (!result[category]) result[category] = [];
        result[category]!.push(value);
        continue;
      }
    }
    // Legacy plain value → put in frontend by default
    if (!result.frontend) result.frontend = [];
    result.frontend.push(entry);
  }
  return result;
}
