"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useUser } from "@clerk/nextjs";

import type { Course } from "@/lib/types";
import { flattenLessons, totalLessonCount } from "@/lib/course-utils";
import {
  getServerSnapshot,
  getSnapshot,
  setActiveUser,
  setLessonComplete,
  subscribe,
  toggleLessonComplete,
} from "@/lib/progress-store";

export interface CourseProgress {
  completed: number;
  total: number;
  percent: number;
}

interface ProgressContextValue {
  /** False until we know which user we're tracking progress for. */
  isLoaded: boolean;
  isLessonComplete: (lessonId: string) => boolean;
  toggleLesson: (lessonId: string) => void;
  markComplete: (lessonId: string) => void;
  markIncomplete: (lessonId: string) => void;
  getCourseProgress: (course: Course) => CourseProgress;
  /** Total number of lessons completed across every course. */
  completedLessonCount: number;
}

const ProgressContext = createContext<ProgressContextValue | null>(null);

/**
 * Tracks lesson completion for the signed-in user and keeps every consumer
 * (course cards, the dashboard, the lesson viewer) in sync in real time.
 *
 * State lives in a small external store (`@/lib/progress-store`) backed by
 * localStorage, namespaced per Clerk user id — enough for a take-home
 * wireframe. Swapping this for a real backend later means replacing that
 * store's internals with API calls; every component that calls
 * `useProgress()` stays the same.
 */
export function ProgressProvider({ children }: { children: ReactNode }) {
  const { user, isLoaded: userLoaded } = useUser();
  const userId = user?.id ?? "guest";

  // Point the store at the right user as soon as we know who's signed in.
  useEffect(() => {
    if (userLoaded) setActiveUser(userId);
  }, [userId, userLoaded]);

  const completed = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const isLessonComplete = useCallback(
    (lessonId: string) => Boolean(completed[lessonId]),
    [completed]
  );

  const getCourseProgress = useCallback(
    (course: Course): CourseProgress => {
      const total = totalLessonCount(course);
      const completedInCourse = flattenLessons(course).filter(
        (l) => completed[l.id]
      ).length;
      return {
        completed: completedInCourse,
        total,
        percent: total === 0 ? 0 : Math.round((completedInCourse / total) * 100),
      };
    },
    [completed]
  );

  const value = useMemo<ProgressContextValue>(
    () => ({
      isLoaded: userLoaded,
      isLessonComplete,
      toggleLesson: toggleLessonComplete,
      markComplete: (lessonId: string) => setLessonComplete(lessonId, true),
      markIncomplete: (lessonId: string) => setLessonComplete(lessonId, false),
      getCourseProgress,
      completedLessonCount: Object.keys(completed).length,
    }),
    [userLoaded, isLessonComplete, getCourseProgress, completed]
  );

  return (
    <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>
  );
}

export function useProgress() {
  const ctx = useContext(ProgressContext);
  if (!ctx) {
    throw new Error("useProgress must be used within a <ProgressProvider>");
  }
  return ctx;
}

/** Convenience hook for a single course's live progress. */
export function useCourseProgress(course: Course): CourseProgress & {
  isLoaded: boolean;
} {
  const { getCourseProgress, isLoaded } = useProgress();
  return useMemo(
    () => ({ ...getCourseProgress(course), isLoaded }),
    [course, getCourseProgress, isLoaded]
  );
}
