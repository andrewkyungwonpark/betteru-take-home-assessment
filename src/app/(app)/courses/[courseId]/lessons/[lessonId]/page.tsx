import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getCourseById } from "@/lib/courses";
import { findLesson } from "@/lib/course-utils";
import { LessonView } from "@/components/courses/lesson-view";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[courseId]/lessons/[lessonId]">): Promise<Metadata> {
  const { courseId, lessonId } = await params;
  const course = await getCourseById(courseId);
  const lesson = course ? findLesson(course, lessonId) : null;
  return {
    title: lesson ? `${lesson.title} — ${course!.title}` : "Lesson not found",
  };
}

export default async function LessonPage({
  params,
}: PageProps<"/courses/[courseId]/lessons/[lessonId]">) {
  const { courseId, lessonId } = await params;
  const course = await getCourseById(courseId);
  if (!course) notFound();

  const lesson = findLesson(course, lessonId);
  if (!lesson) notFound();

  return <LessonView course={course} lesson={lesson} />;
}
