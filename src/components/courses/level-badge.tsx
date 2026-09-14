import { Badge } from "@/components/ui/badge";
import type { Difficulty } from "@/lib/types";

const LEVEL_VARIANT: Record<Difficulty, "secondary" | "default" | "outline"> = {
  Beginner: "secondary",
  Intermediate: "default",
  Advanced: "outline",
};

export function LevelBadge({ level }: { level: Difficulty }) {
  return <Badge variant={LEVEL_VARIANT[level]}>{level}</Badge>;
}
