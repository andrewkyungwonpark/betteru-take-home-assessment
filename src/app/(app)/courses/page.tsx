import { getCategories, getCourses, getLevels } from "@/lib/courses";

import { CourseCatalog } from "@/components/courses/course-catalog";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Course catalog — BetterU",
};

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string | string[] }>;
}) {
  const [courses, categories, levels, params] = await Promise.all([
    getCourses(),
    getCategories(),
    getLevels(),
    searchParams,
  ]);

  const initialQuery =
    typeof params.q === "string" ? params.q : (params.q?.[0] ?? "");

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Course catalog
        </h1>
        <p className="text-sm text-muted-foreground">
          Browse every course, then search or filter to find what you need.
        </p>
      </div>
      <CourseCatalog
        courses={courses}
        categories={categories}
        levels={levels}
        initialQuery={initialQuery}
      />
    </div>
  );
}
