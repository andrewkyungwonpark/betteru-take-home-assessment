"use client";

import { useState } from "react";
import Image from "next/image";
import { BookOpen } from "lucide-react";

import { getCategoryGradient } from "@/lib/course-utils";
import { cn } from "@/lib/utils";

export function CourseCover({
  thumbnail,
  category,
  alt,
  className,
  sizes,
}: {
  thumbnail?: string;
  category: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (thumbnail && !failed) {
    return (
      <div className={cn("relative overflow-hidden", className)}>
        <Image
          src={thumbnail}
          alt={alt}
          fill
          sizes={sizes ?? "(min-width: 1280px) 360px, (min-width: 640px) 50vw, 100vw"}
          className="object-cover"
          onError={() => setFailed(true)}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-gradient-to-br text-white/90",
        getCategoryGradient(category),
        className
      )}
    >
      <BookOpen className="size-8" strokeWidth={1.5} />
    </div>
  );
}
