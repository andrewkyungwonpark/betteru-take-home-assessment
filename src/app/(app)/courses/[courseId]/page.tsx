import { CourseDetail } from "@/components/courses/course-detail";
import type { Metadata } from "next";
import { getCourseById } from "@/lib/courses";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: PageProps<"/courses/[courseId]">): Promise<Metadata> {
  const { courseId } = await params;
  const course = await getCourseById(courseId);
  return { title: course ? `${course.title} — BetterU` : "Course not found" };
}

export default async function CourseDetailPage({
  params,
}: PageProps<"/courses/[courseId]">) {
  const { courseId } = await params;
  const course = await getCourseById(courseId);

  if (!course) {
    notFound();
  }

  return <CourseDetail course={course} />;
}
