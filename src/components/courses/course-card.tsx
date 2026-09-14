"use client";

import Link from "next/link";
import { Star, Users, Clock, CheckCircle2 } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CourseCover } from "@/components/courses/course-cover";
import { LevelBadge } from "@/components/courses/level-badge";
import { useCourseProgress } from "@/components/providers/progress-provider";
import { totalLessonCount, formatMinutes } from "@/lib/course-utils";
import type { Course } from "@/lib/types";

export function CourseCard({ course }: { course: Course }) {
  const progress = useCourseProgress(course);
  const lessonCount = totalLessonCount(course);
  const isComplete = progress.isLoaded && progress.percent === 100;

  return (
    <Link href={`/courses/${course.id}`} className="group block h-full">
      <Card className="h-full gap-0 overflow-hidden py-0 transition-shadow group-hover:shadow-md">
        <CourseCover
          thumbnail={course.thumbnail}
          category={course.category}
          alt={course.title}
          className="h-28 w-full"
        />
        <CardHeader className="gap-2 pt-5">
          <div className="flex items-center gap-2">
            <Badge variant="outline">{course.category}</Badge>
            <LevelBadge level={course.difficulty} />
            {isComplete && (
              <Badge variant="success" className="ml-auto">
                <CheckCircle2 className="size-3" />
                Completed
              </Badge>
            )}
          </div>
          <CardTitle className="line-clamp-2 text-base leading-snug">
            {course.title}
          </CardTitle>
          <CardDescription className="line-clamp-2">
            {course.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-4 pt-4 pb-5">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="size-3.5 fill-amber-400 text-amber-400" />
              {course.rating.toFixed(1)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="size-3.5" />
              {course.enrolledCount.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-3.5" />
              {formatMinutes(course.durationMinutes)}
            </span>
          </div>

          <div className="mt-auto space-y-1.5">
            {!progress.isLoaded ? (
              <Skeleton className="h-4 w-28" />
            ) : progress.percent > 0 ? (
              <>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {progress.completed}/{lessonCount} lessons
                  </span>
                  <span className="font-medium">{progress.percent}%</span>
                </div>
                <Progress value={progress.percent} className="h-1.5" />
              </>
            ) : (
              <p className="text-xs text-muted-foreground">
                {lessonCount} lessons · Not started
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
