"use client";

import { useEffect, useRef, useState } from "react";
import { Clapperboard, Pause, Play, RotateCcw } from "lucide-react";

function formatClock(totalSeconds: number): string {
  const s = Math.max(0, Math.round(totalSeconds));
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return `${m}:${rem.toString().padStart(2, "0")}`;
}

/**
 * A mock video player for the lesson viewer.
 *
 * There's no real media file in the sample dataset, so playback is
 * simulated: the seek bar and clock advance on a timer that's scaled to
 * the lesson's real duration but compressed into a short, demoable
 * wall-clock window (8-45s) instead of actually taking as long as the
 * lesson claims to run. `elapsedRef` is the source of truth for playback
 * position — `elapsed` state exists only to trigger re-renders — so the
 * animation-frame effect below never needs to read `elapsed` itself and
 * doesn't need to restart every time playback position changes.
 */
export function MockVideoPlayer({
  title,
  durationMinutes,
}: {
  title: string;
  durationMinutes: number;
}) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0); // 0..1
  const elapsedRef = useRef(0);
  const startRef = useRef<number | null>(null);
  const frameRef = useRef<number | null>(null);

  const totalRealSeconds = Math.min(45, Math.max(8, durationMinutes));
  const totalVideoSeconds = durationMinutes * 60;
  const finished = elapsed >= 1;

  useEffect(() => {
    if (!playing) return;

    startRef.current = performance.now() - elapsedRef.current * totalRealSeconds * 1000;

    function tick(now: number) {
      const start = startRef.current;
      if (start === null) return;
      const next = Math.min(1, (now - start) / (totalRealSeconds * 1000));
      elapsedRef.current = next;
      setElapsed(next);
      if (next >= 1) {
        setPlaying(false);
        return;
      }
      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  }, [playing, totalRealSeconds]);

  function togglePlay() {
    if (!playing && finished) {
      elapsedRef.current = 0;
      setElapsed(0);
    }
    setPlaying((p) => !p);
  }

  function seekTo(fraction: number) {
    const clamped = Math.min(1, Math.max(0, fraction));
    elapsedRef.current = clamped;
    setElapsed(clamped);
    if (playing) {
      startRef.current = performance.now() - clamped * totalRealSeconds * 1000;
    }
  }

  function handleSeekClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    seekTo((e.clientX - rect.left) / rect.width);
  }

  function handleSeekKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "ArrowRight") seekTo(elapsedRef.current + 0.05);
    else if (e.key === "ArrowLeft") seekTo(elapsedRef.current - 0.05);
    else if (e.key === "Home") seekTo(0);
    else if (e.key === "End") seekTo(1);
    else return;
    e.preventDefault();
  }

  function handleRestart() {
    elapsedRef.current = 0;
    setElapsed(0);
    if (playing) startRef.current = performance.now();
  }

  return (
    <div className="relative aspect-video overflow-hidden rounded-lg bg-neutral-900">
      <div className="absolute inset-0 flex items-center justify-center">
        <Clapperboard className="size-16 text-white/15" />
      </div>

      <button
        type="button"
        onClick={togglePlay}
        className="absolute inset-0 flex items-center justify-center"
        aria-label={playing ? "Pause" : finished ? "Replay" : "Play"}
      >
        <span className="flex size-16 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur-sm transition-colors hover:bg-white/20">
          {playing ? (
            <Pause className="size-7 fill-current" />
          ) : finished ? (
            <RotateCcw className="size-7" />
          ) : (
            <Play className="size-7 translate-x-0.5 fill-current" />
          )}
        </span>
      </button>

      <div className="absolute inset-x-0 bottom-0 z-10 flex flex-col gap-1.5 bg-gradient-to-t from-black/75 to-transparent px-3 pt-8 pb-2.5">
        <div
          role="slider"
          aria-label="Seek"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(elapsed * 100)}
          tabIndex={0}
          onClick={handleSeekClick}
          onKeyDown={handleSeekKeyDown}
          className="relative h-1.5 w-full cursor-pointer rounded-full bg-white/25"
        >
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${elapsed * 100}%` }}
          />
        </div>
        <div className="flex items-center justify-between gap-3 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlay}
              className="rounded p-0.5 hover:text-white"
              aria-label={playing ? "Pause" : finished ? "Replay" : "Play"}
            >
              {playing ? (
                <Pause className="size-3.5 fill-current" />
              ) : finished ? (
                <RotateCcw className="size-3.5" />
              ) : (
                <Play className="size-3.5 fill-current" />
              )}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="rounded p-0.5 hover:text-white"
              aria-label="Restart"
            >
              <RotateCcw className="size-3.5" />
            </button>
            <span>
              {formatClock(elapsed * totalVideoSeconds)} /{" "}
              {formatClock(totalVideoSeconds)}
            </span>
          </div>
          <span className="hidden truncate sm:inline">{title}</span>
        </div>
      </div>
    </div>
  );
}
