"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Circle, Star, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { CourseCover } from "@/components/courses/course-cover";
import { LevelBadge } from "@/components/courses/level-badge";
import {
  useCourseProgress,
  useProgress,
} from "@/components/providers/progress-provider";
import {
  flattenLessons,
  formatMinutes,
  getInitials,
} from "@/lib/course-utils";
import { cn } from "@/lib/utils";
import type { Course } from "@/lib/types";

export function CourseDetail({ course }: { course: Course }) {
  const progress = useCourseProgress(course);
  const { isLessonComplete, toggleLesson } = useProgress();
  const lessons = flattenLessons(course);
  const nextLesson = lessons.find((l) => !isLessonComplete(l.id)) ?? lessons[0];
  const hasStarted = progress.isLoaded && progress.completed > 0;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
      <div className="overflow-hidden rounded-xl border">
        <CourseCover
          thumbnail={course.thumbnail}
          category={course.category}
          alt={course.title}
          className="h-40 w-full sm:h-48"
        />
        <div className="flex flex-col gap-4 p-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{course.category}</Badge>
            <LevelBadge level={course.difficulty} />
            {progress.isLoaded && progress.percent === 100 && (
              <Badge variant="success">
                <CheckCircle2 className="size-3" /> Completed
              </Badge>
            )}
          </div>

          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {course.title}
            </h1>
            <p className="mt-1 text-muted-foreground">{course.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Avatar className="size-6">
                <AvatarFallback className="text-[10px]">
                  {getInitials(course.instructor)}
                </AvatarFallback>
              </Avatar>
              {course.instructor}
            </span>
            <span className="flex items-center gap-1">
              <Star className="size-4 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-4" />
              {course.enrolledCount.toLocaleString()} students
            </span>
            <span>{formatMinutes(course.durationMinutes)} total</span>
          </div>

          <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
            {progress.isLoaded ? (
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {progress.completed}/{progress.total} lessons complete
                  </span>
                  <span className="font-medium">{progress.percent}%</span>
                </div>
                <Progress value={progress.percent} />
              </div>
            ) : (
              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-4 w-8" />
                </div>
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            )}
            {progress.isLoaded ? (
              <Button asChild size="lg" className="sm:ml-4">
                <Link href={`/courses/${course.id}/lessons/${nextLesson.id}`}>
                  {hasStarted
                    ? progress.percent === 100
                      ? "Review course"
                      : "Continue course"
                    : "Start course"}
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            ) : (
              <Skeleton className="h-10 w-full rounded-md sm:ml-4 sm:w-36" />
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-lg font-semibold tracking-tight">
          Course content
        </h2>
        {course.modules.map((module, moduleIndex) => {
          const completedInModule = module.lessons.filter((l) =>
            isLessonComplete(l.id)
          ).length;
          return (
            <Card key={module.id} className="gap-0 py-0">
              <div className="flex items-center justify-between gap-3 border-b px-5 py-3">
                <div>
                  <p className="text-sm font-medium">
                    Module {moduleIndex + 1}: {module.title}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {completedInModule}/{module.lessons.length} lessons complete
                  </p>
                </div>
                {completedInModule === module.lessons.length && (
                  <CheckCircle2 className="size-4 shrink-0 text-success" />
                )}
              </div>
              <CardContent className="divide-y p-0">
                {module.lessons.map((lesson) => {
                  const complete = isLessonComplete(lesson.id);
                  return (
                    <div
                      key={lesson.id}
                      className="flex items-center gap-3 px-5 py-3 text-sm transition-colors hover:bg-accent/50"
                    >
                      <button
                        type="button"
                        onClick={() => toggleLesson(lesson.id)}
                        aria-pressed={complete}
                        aria-label={
                          complete
                            ? `Mark "${lesson.title}" as incomplete`
                            : `Mark "${lesson.title}" as complete`
                        }
                        className="shrink-0 cursor-pointer rounded-full transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {complete ? (
                          <CheckCircle2 className="size-4 text-success" />
                        ) : (
                          <Circle className="size-4 text-muted-foreground/40 hover:text-muted-foreground" />
                        )}
                      </button>
                      <Link
                        href={`/courses/${course.id}/lessons/${lesson.id}`}
                        className={cn(
                          "flex-1 hover:underline",
                          complete && "text-muted-foreground line-through"
                        )}
                      >
                        {lesson.title}
                      </Link>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {lesson.durationMinutes} min
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
