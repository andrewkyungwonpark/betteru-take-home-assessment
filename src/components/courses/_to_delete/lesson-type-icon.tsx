import { FileText, HelpCircle, PlayCircle } from "lucide-react";

import type { LessonType } from "@/lib/types";

export function LessonTypeIcon({
  type,
  className,
}: {
  type: LessonType;
  className?: string;
}) {
  if (type === "video") return <PlayCircle className={className} />;
  if (type === "quiz") return <HelpCircle className={className} />;
  return <FileText className={className} />;
}
