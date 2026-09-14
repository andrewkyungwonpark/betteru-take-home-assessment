import type { ReactNode } from "react";

import { AppSidebar } from "@/components/layout/sidebar";
import { AppTopbar } from "@/components/layout/topbar";

export function AppShell({
  userFirstName,
  children,
}: {
  userFirstName: string;
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-svh flex-1">
      <AppSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <AppTopbar userFirstName={userFirstName} />
        <main className="flex-1 overflow-y-auto bg-muted/20 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
