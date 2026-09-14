"use client";

import Link from "next/link";
import { CheckCircle2, Circle } from "lucide-react";

import { useProgress } from "@/components/providers/progress-provider";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

export function LessonSidebar({
  course,
  currentLessonId,
  onNavigate,
}: {
  course: Course;
  currentLessonId: string;
  onNavigate?: () => void;
}) {
  const { isLessonComplete } = useProgress();

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Course
        </p>
        <Link
          href={`/courses/${course.id}`}
          onClick={onNavigate}
          className="font-medium hover:underline"
        >
          {course.title}
        </Link>
      </div>

      <div className="flex flex-col gap-4">
        {course.modules.map((module, moduleIndex) => (
          <div key={module.id}>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">
              Module {moduleIndex + 1}: {module.title}
            </p>
            <div className="flex flex-col gap-0.5">
              {module.lessons.map((lesson) => {
                const complete = isLessonComplete(lesson.id);
                const isActive = lesson.id === currentLessonId;
                return (
                  <Link
                    key={lesson.id}
                    href={`/courses/${course.id}/lessons/${lesson.id}`}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    )}
                  >
                    {complete ? (
                      <CheckCircle2
                        className={cn(
                          "size-3.5 shrink-0",
                          isActive ? "text-primary-foreground" : "text-success"
                        )}
                      />
                    ) : (
                      <Circle
                        className={cn(
                          "size-3.5 shrink-0",
                          isActive
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground/40"
                        )}
                      />
                    )}
                    <span className="line-clamp-1 flex-1">{lesson.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
