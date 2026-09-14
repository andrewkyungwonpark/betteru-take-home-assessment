"use client";

import { CheckCircle2, GraduationCap } from "lucide-react";

import Link from "next/link";
import { NavLinks } from "@/components/layout/nav-links";
import { Skeleton } from "@/components/ui/skeleton";
import { useProgress } from "@/components/providers/progress-provider";

export function AppSidebar() {
  const { completedLessonCount, isLoaded } = useProgress();

  return (
    <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar lg:flex">
      <div className="flex h-16 items-center gap-2 border-b px-6 font-semibold">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <GraduationCap className="size-4.5" />
          </span>
          BetterU
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <NavLinks />
      </div>
      <div className="border-t p-4">
        {isLoaded ? (
          <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2 text-xs text-muted-foreground">
            <CheckCircle2 className="size-4 shrink-0 text-success" />
            <span>
              {completedLessonCount} lesson
              {completedLessonCount === 1 ? "" : "s"} completed
            </span>
          </div>
        ) : (
          <Skeleton className="h-8 w-full rounded-md" />
        )}
      </div>
    </aside>
  );
}
