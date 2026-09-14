import type { Course, Difficulty, Lesson } from "@/lib/types";

import raw from "./courses.json";

/** Shape of the dummy data as it comes from `courses.json`. */
interface RawLesson {
  id: string;
  title: string;
  durationMinutes: number;
}

interface RawModule {
  id: string;
  title: string;
  lessons: RawLesson[];
}

interface RawCourse {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: Difficulty;
  durationMinutes: number;
  thumbnail: string;
  instructor: string;
  rating: number;
  enrolledCount: number;
  modules: RawModule[];
}

/** The source data has no lesson `type` or body copy — both are UI
 * concerns, not content the catalog actually provides — so we fill in
 * reasonable placeholders here, once, at load time. Everything else is
 * passed straight through. */
function toLesson(raw: RawLesson): Lesson {
  return {
    id: raw.id,
    title: raw.title,
    durationMinutes: raw.durationMinutes,
  };
}

function toCourse(raw: RawCourse): Course {
  return {
    id: raw.id,
    title: raw.title,
    description: raw.description,
    category: raw.category,
    difficulty: raw.difficulty,
    durationMinutes: raw.durationMinutes,
    instructor: raw.instructor,
    rating: raw.rating,
    enrolledCount: raw.enrolledCount,
    thumbnail: raw.thumbnail,
    modules: raw.modules.map((m) => ({
      id: m.id,
      title: m.title,
      lessons: m.lessons.map(toLesson),
    })),
  };
}

export const COURSES: Course[] = (raw as RawCourse[]).map(toCourse);
