import { redirect } from "next/navigation";
import { currentUser } from "@clerk/nextjs/server";

import { AppShell } from "@/components/layout/app-shell";
import { ProgressProvider } from "@/components/providers/progress-provider";

export default async function AppGroupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The middleware already protects everything in this route group; this is
  // a defensive second check, and also where we read the user's name for
  // the topbar greeting.
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const firstName = user.firstName ?? user.username ?? "there";

  return (
    <ProgressProvider>
      <AppShell userFirstName={firstName}>{children}</AppShell>
    </ProgressProvider>
  );
}
