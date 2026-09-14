"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChevronLeft,
  ListChecks,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LessonSidebar } from "@/components/courses/lesson-sidebar";
import { MockVideoPlayer } from "@/components/courses/mock-video-player";
import { useProgress } from "@/components/providers/progress-provider";
import { flattenLessons } from "@/lib/course-utils";
import { cn } from "@/lib/utils";
import type { Course, FlatLesson } from "@/lib/types";

export function LessonView({
  course,
  lesson,
}: {
  course: Course;
  lesson: FlatLesson;
}) {
  const router = useRouter();
  const { isLessonComplete, toggleLesson } = useProgress();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const lessons = flattenLessons(course);
  const prevLesson = lessons[lesson.index - 1] ?? null;
  const nextLesson = lessons[lesson.index + 1] ?? null;
  const complete = isLessonComplete(lesson.id);
  // The sample dataset doesn't include lesson body copy — it's generated
  // here, at render time, instead of being invented and stored on the
  // `Lesson` type itself.
  const placeholderCopy = `This lesson, "${lesson.title}," is part of ${lesson.moduleTitle}. Full lesson content isn't included in the sample dataset — this placeholder stands in for it.`;

  function goToNext() {
    if (nextLesson) {
      router.push(`/courses/${course.id}/lessons/${nextLesson.id}`);
    } else {
      router.push(`/courses/${course.id}`);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-6xl grid-cols-1 gap-6 lg:grid-cols-[1fr_280px]">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            href={`/courses/${course.id}`}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="size-4" />
            {course.title}
          </Link>

          <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="lg:hidden">
                <ListChecks className="size-4" />
                Outline
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80 overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Course outline</SheetTitle>
              </SheetHeader>
              <div className="px-4 pb-4">
                <LessonSidebar
                  course={course}
                  currentLessonId={lesson.id}
                  onNavigate={() => setMobileNavOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <Card>
          <CardContent className="flex flex-col gap-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {lesson.moduleTitle} · {lesson.durationMinutes} min
              </span>
              {complete && (
                <Badge variant="success" className="ml-auto">
                  <CheckCircle2 className="size-3" /> Completed
                </Badge>
              )}
            </div>

            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              {lesson.title}
            </h1>

            <MockVideoPlayer
              title={lesson.title}
              durationMinutes={lesson.durationMinutes}
            />

            <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
              {placeholderCopy}
            </p>

            <div className="flex flex-col gap-3 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
              <Button
                variant={complete ? "outline" : "default"}
                onClick={() => toggleLesson(lesson.id)}
                className={cn(complete && "border-success text-success")}
              >
                <CheckCircle2 className="size-4" />
                {complete ? "Marked as complete" : "Mark as complete"}
              </Button>

              <div className="flex items-center gap-2">
                {prevLesson ? (
                  <Button variant="ghost" asChild>
                    <Link
                      href={`/courses/${course.id}/lessons/${prevLesson.id}`}
                    >
                      <ArrowLeft className="size-4" /> Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="ghost" disabled>
                    <ArrowLeft className="size-4" /> Previous
                  </Button>
                )}
                <Button onClick={goToNext}>
                  {nextLesson ? "Next lesson" : "Finish course"}
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <aside className="hidden lg:block">
        <div className="sticky top-6 max-h-[calc(100svh-3rem)] overflow-y-auto rounded-lg border p-4">
          <LessonSidebar course={course} currentLessonId={lesson.id} />
        </div>
      </aside>
    </div>
  );
}
