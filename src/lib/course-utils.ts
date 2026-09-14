import type { Course, FlatLesson } from "@/lib/types";

/** Pure helpers for working with a Course's nested modules/lessons.
 * Safe to import from both server and client components. */

export function totalLessonCount(course: Course): number {
  return course.modules.reduce((sum, m) => sum + m.lessons.length, 0);
}

/** Flattens a course's modules into an ordered list of lessons for
 * sequential prev/next navigation in the lesson viewer. */
export function flattenLessons(course: Course): FlatLesson[] {
  const flat: FlatLesson[] = [];
  let index = 0;
  for (const courseModule of course.modules) {
    for (const l of courseModule.lessons) {
      flat.push({
        ...l,
        courseId: course.id,
        moduleId: courseModule.id,
        moduleTitle: courseModule.title,
        index,
      });
      index += 1;
    }
  }
  return flat;
}

export function findLesson(course: Course, lessonId: string): FlatLesson | null {
  return flattenLessons(course).find((l) => l.id === lessonId) ?? null;
}

export function formatMinutes(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes}m`;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h ${minutes}m`;
}

/** Up to two initials from a person's name, for avatar fallbacks. */
export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/** Cover-art gradients, keyed by category, for courses whose thumbnail is
 * missing or fails to load. Falls back to a deterministic hash-based pick
 * for any category not in the map, so a new category never breaks. */
const CATEGORY_GRADIENTS: Record<string, string> = {
  "Web Development": "from-sky-500 to-indigo-600",
  Design: "from-fuchsia-500 to-pink-600",
  "Data Science": "from-emerald-500 to-teal-600",
  Business: "from-amber-500 to-orange-600",
  DevOps: "from-cyan-500 to-blue-600",
  Mobile: "from-violet-500 to-purple-700",
};

const FALLBACK_GRADIENTS = [
  "from-rose-500 to-red-600",
  "from-lime-500 to-green-600",
  "from-slate-500 to-slate-700",
];

export function getCategoryGradient(category: string): string {
  if (CATEGORY_GRADIENTS[category]) return CATEGORY_GRADIENTS[category];
  let hash = 0;
  for (let i = 0; i < category.length; i++) {
    hash = (hash * 31 + category.charCodeAt(i)) >>> 0;
  }
  return FALLBACK_GRADIENTS[hash % FALLBACK_GRADIENTS.length];
}
