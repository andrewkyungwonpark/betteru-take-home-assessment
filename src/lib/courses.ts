import "server-only";

import type { Course, Difficulty } from "@/lib/types";

import { COURSES } from "@/lib/data/courses";

/**
 * Data-access layer for courses.
 *
 * Every function here is async and reads from an in-memory mock array today.
 * The signatures are written the way they would be if they hit a real API
 * or database, so swapping the implementation later (e.g. for a `fetch`
 * call or an ORM query) shouldn't require touching any call sites.
 */

export async function getCourses(): Promise<Course[]> {
  return COURSES;
}

export async function getCourseById(id: string): Promise<Course | null> {
  return COURSES.find((course) => course.id === id) ?? null;
}

export async function getCategories(): Promise<string[]> {
  return Array.from(new Set(COURSES.map((c) => c.category))).sort();
}

export async function getLevels(): Promise<Difficulty[]> {
  return ["Beginner", "Intermediate", "Advanced"];
}
