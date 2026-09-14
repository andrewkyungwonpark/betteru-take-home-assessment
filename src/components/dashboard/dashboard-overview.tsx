"use client";

import Link from "next/link";
import { useMemo, type ComponentType } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Flame, GraduationCap } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCard } from "@/components/courses/course-card";
import { CourseCover } from "@/components/courses/course-cover";
import { useProgress } from "@/components/providers/progress-provider";
import {
  flattenLessons,
  totalLessonCount,
} from "@/lib/course-utils";
import type { Course } from "@/lib/types";

export function DashboardOverview({ courses }: { courses: Course[] }) {
  const { getCourseProgress, isLessonComplete, isLoaded } = useProgress();

  const stats = useMemo(() => {
    const withProgress = courses.map((course) => ({
      course,
      progress: getCourseProgress(course),
    }));

    const totals = withProgress.reduce(
      (acc, { progress }) => ({
        totalLessons: acc.totalLessons + progress.total,
        completedLessons: acc.completedLessons + progress.completed,
        completedCount:
          acc.completedCount + (progress.total > 0 && progress.percent === 100 ? 1 : 0),
        inProgressCount:
          acc.inProgressCount +
          (progress.percent > 0 && progress.percent < 100 ? 1 : 0),
      }),
      { totalLessons: 0, completedLessons: 0, completedCount: 0, inProgressCount: 0 }
    );

    const overallPercent =
      totals.totalLessons === 0
        ? 0
        : Math.round((totals.completedLessons / totals.totalLessons) * 100);

    const continueLearning = withProgress
      .filter(({ progress }) => progress.percent > 0 && progress.percent < 100)
      .sort((a, b) => b.progress.percent - a.progress.percent)
      .slice(0, 4);

    return {
      inProgressCount: totals.inProgressCount,
      completedCount: totals.completedCount,
      overallPercent,
      continueLearning,
    };
  }, [courses, getCourseProgress]);

  const recentlyAdded = courses.slice(0, 3);

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={BookOpen}
          label="Courses available"
          value={courses.length}
        />
        <StatCard
          icon={Flame}
          label="In progress"
          value={stats.inProgressCount}
          isLoading={!isLoaded}
        />
        <StatCard
          icon={CheckCircle2}
          label="Completed"
          value={stats.completedCount}
          isLoading={!isLoaded}
        />
        <StatCard
          icon={GraduationCap}
          label="Overall completion"
          value={`${stats.overallPercent}%`}
          isLoading={!isLoaded}
        />
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Continue learning
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              Browse catalog <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>

        {!isLoaded ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[0, 1].map((i) => (
              <Card key={i} className="flex-row items-center gap-4 p-4">
                <Skeleton className="size-16 shrink-0 rounded-lg" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                  <Skeleton className="h-1.5 w-full rounded-full" />
                </div>
                <Skeleton className="h-8 w-16 shrink-0 rounded-md" />
              </Card>
            ))}
          </div>
        ) : stats.continueLearning.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="font-medium">You haven&apos;t started a course yet</p>
              <p className="text-sm text-muted-foreground">
                Browse the catalog and open a lesson to get going — your
                progress will show up here.
              </p>
              <Button asChild className="mt-1">
                <Link href="/courses">
                  Browse the catalog <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {stats.continueLearning.map(({ course, progress }) => {
              const nextLesson = flattenLessons(course).find(
                (l) => !isLessonComplete(l.id)
              );
              const total = totalLessonCount(course);
              return (
                <Card key={course.id} className="flex-row items-center gap-4 p-4">
                  <CourseCover
                    thumbnail={course.thumbnail}
                    category={course.category}
                    alt={course.title}
                    sizes="64px"
                    className="size-16 shrink-0 rounded-lg"
                  />
                  <div className="flex min-w-0 flex-1 flex-col gap-2">
                    <div>
                      <p className="truncate font-medium leading-tight">
                        {course.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {progress.completed}/{total} lessons · {progress.percent}%
                      </p>
                    </div>
                    <Progress value={progress.percent} className="h-1.5" />
                  </div>
                  <Button size="sm" asChild>
                    <Link
                      href={
                        nextLesson
                          ? `/courses/${course.id}/lessons/${nextLesson.id}`
                          : `/courses/${course.id}`
                      }
                    >
                      Resume
                    </Link>
                  </Button>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold tracking-tight">
            Recently added
          </h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/courses">
              View all <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {recentlyAdded.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  isLoading = false,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  isLoading?: boolean;
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Icon className="size-5" />
        </span>
        <div className="flex-1">
          {isLoading ? (
            <Skeleton className="mb-1 h-7 w-10" />
          ) : (
            <p className="text-2xl font-semibold leading-none">{value}</p>
          )}
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}
