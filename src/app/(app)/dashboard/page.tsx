import { DashboardOverview } from "@/components/dashboard/dashboard-overview";
import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { getCourses } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Dashboard — BetterU",
};

export default async function DashboardPage() {
  const [courses, user] = await Promise.all([getCourses(), currentUser()]);
  const firstName = user?.firstName ?? user?.username ?? "there";

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back, {firstName}
        </h1>
        <p className="text-sm text-muted-foreground">
          Here&apos;s where you left off, and what&apos;s new in the catalog.
        </p>
      </div>
      <DashboardOverview courses={courses} />
    </div>
  );
}
