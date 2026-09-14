import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  LineChart,
  SearchCheck,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Show } from "@clerk/nextjs";

const features = [
  {
    icon: BookOpen,
    title: "Browse the catalog",
    description:
      "Explore every course on offer with cover art, level, duration, and instructor at a glance.",
  },
  {
    icon: SearchCheck,
    title: "Search & filter",
    description:
      "Narrow the catalog instantly by keyword, category, difficulty, or your enrollment status.",
  },
  {
    icon: GraduationCap,
    title: "Work through lessons",
    description:
      "Move module by module with a distraction-free lesson viewer and quick prev/next navigation.",
  },
  {
    icon: LineChart,
    title: "Track progress live",
    description:
      "Every completed lesson updates your course and account-wide progress the moment you finish it.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <GraduationCap className="size-4.5" />
            </span>
            BetterU Learning
          </div>
          <nav className="flex items-center gap-2">
            <Show when="signed-out">
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">
                  Get started <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button asChild>
                <Link href="/dashboard">
                  Go to dashboard <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Show>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-6 py-20">
          {/* <span className="rounded-full border bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
            Frontend take-home wireframe
          </span> */}
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight sm:text-5xl">
            One dashboard to browse, learn, and track every course.
          </h1>
          <p className="max-w-xl text-lg text-muted-foreground">
            This is a learning management dashboard for BetterU where signed-in
            learners discover courses, search and filter the catalog, work
            through lesson modules, and watch their completion progress update
            in real time.
          </p>
          <div className="flex flex-wrap gap-3">
            <Show when="signed-out">
              <Button size="lg" asChild>
                <Link href="/sign-up">
                  Create your account <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/sign-in">I already have an account</Link>
              </Button>
            </Show>
            <Show when="signed-in">
              <Button size="lg" asChild>
                <Link href="/dashboard">
                  Continue learning <ArrowRight className="size-4" />
                </Link>
              </Button>
            </Show>
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="mx-auto grid w-full max-w-6xl gap-4 px-6 py-16 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="mb-2 size-6 text-primary" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
                <CardContent />
              </Card>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-6">
        <div className="mx-auto w-full max-w-6xl px-6 text-sm text-muted-foreground">
          Built with Next.js, TypeScript, Tailwind CSS, shadcn/ui, and Clerk.
        </div>
      </footer>
    </div>
  );
}
