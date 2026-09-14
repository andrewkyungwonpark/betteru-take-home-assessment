"use client";

import type { Course, Difficulty } from "@/lib/types";
import { Search, SlidersHorizontal, X } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMemo, useState } from "react";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/courses/course-card";
import { Input } from "@/components/ui/input";
import { useProgress } from "@/components/providers/progress-provider";

const ALL = "all";

type CompletionFilter = "all" | "not-started" | "in-progress" | "completed";

const COMPLETION_OPTIONS: { value: CompletionFilter; label: string }[] = [
  { value: ALL, label: "All progress" },
  { value: "not-started", label: "Not started" },
  { value: "in-progress", label: "In progress" },
  { value: "completed", label: "Completed" },
];

export function CourseCatalog({
  courses,
  categories,
  levels,
  initialQuery = "",
}: {
  courses: Course[];
  categories: string[];
  levels: Difficulty[];
  initialQuery?: string;
}) {
  const [query, setQuery] = useState(initialQuery);
  const [category, setCategory] = useState<string>(ALL);
  const [level, setLevel] = useState<string>(ALL);
  const [completion, setCompletion] = useState<CompletionFilter>(ALL);
  // Filtering runs off the debounced value so a fast typist doesn't
  // re-filter the whole grid on every keystroke; the input itself still
  // updates immediately via `query`.
  const debouncedQuery = useDebouncedValue(query, 300);

  // Completion status lives in per-user progress state, not on the course
  // itself, so it's read from the same store every course card reads from.
  const { getCourseProgress, isLoaded: progressLoaded } = useProgress();

  const filtered = useMemo(() => {
    const q = debouncedQuery.trim().toLowerCase();
    return courses.filter((course) => {
      const matchesQuery =
        q.length === 0 ||
        course.title.toLowerCase().includes(q) ||
        course.description.toLowerCase().includes(q) ||
        course.instructor.toLowerCase().includes(q);
      const matchesCategory = category === ALL || course.category === category;
      const matchesLevel = level === ALL || course.difficulty === level;

      // Until we know which user we're tracking, don't hide anything based
      // on a filter we can't evaluate yet.
      let matchesCompletion = true;
      if (completion !== ALL && progressLoaded) {
        const { percent } = getCourseProgress(course);
        if (completion === "not-started") matchesCompletion = percent === 0;
        else if (completion === "in-progress")
          matchesCompletion = percent > 0 && percent < 100;
        else if (completion === "completed") matchesCompletion = percent === 100;
      }

      return matchesQuery && matchesCategory && matchesLevel && matchesCompletion;
    });
  }, [courses, debouncedQuery, category, level, completion, progressLoaded, getCourseProgress]);

  const hasActiveFilters =
    query.length > 0 || category !== ALL || level !== ALL || completion !== ALL;

  function clearFilters() {
    setQuery("");
    setCategory(ALL);
    setLevel(ALL);
    setCompletion(ALL);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by title, topic, or instructor…"
            className="pl-9"
            aria-label="Search courses"
          />
        </div>

        <div className="flex gap-3">
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-40">
              <SlidersHorizontal className="size-3.5 text-muted-foreground" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger className="w-37.5">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All levels</SelectItem>
              {levels.map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={completion}
            onValueChange={(v) => setCompletion(v as CompletionFilter)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Progress" />
            </SelectTrigger>
            <SelectContent>
              {COMPLETION_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="icon"
              onClick={clearFilters}
              title="Clear filters"
            >
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {filtered.length} course{filtered.length === 1 ? "" : "s"}
        {hasActiveFilters ? " matching your filters" : " available"}
      </p>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed py-20 text-center">
          <p className="font-medium">No courses match your search</p>
          <p className="text-sm text-muted-foreground">
            Try a different keyword or clear your filters.
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="mt-2"
          >
            Clear filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      )}
    </div>
  );
}
