/**
 * A tiny external store for lesson-completion state, read through React's
 * `useSyncExternalStore` from the progress provider.
 *
 * This (rather than calling `setState` inside an effect after reading
 * `localStorage`) is the pattern React recommends for syncing component
 * state with an external system: the store owns the data, components
 * subscribe to it, and writes go through a couple of small functions that
 * both update the cached snapshot and persist to `localStorage`. It also
 * means progress made in one tab shows up in another via the native
 * `storage` event, for free.
 */

export type ProgressMap = Record<string, true>;

type Listener = () => void;

const listeners = new Set<Listener>();

let activeUserId = "guest";
let cache: ProgressMap = {};

/** Stable empty snapshot for SSR. `setActiveUser`/`setLessonComplete` are
 * only ever called from browser-side effects and event handlers, so the
 * module-level `cache` above is never mutated during a server render —
 * this just keeps the SSR snapshot referentially stable. */
const EMPTY_SNAPSHOT: ProgressMap = {};

function storageKey(userId: string) {
  return `betterU:lesson-progress:${userId}`;
}

function readFromStorage(userId: string): ProgressMap {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(storageKey(userId));
    return raw ? (JSON.parse(raw) as ProgressMap) : {};
  } catch {
    return {};
  }
}

function persist() {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(
      storageKey(activeUserId),
      JSON.stringify(cache),
    );
  } catch {
    // localStorage can be unavailable (private browsing, quota exceeded);
    // progress just won't survive a reload in that case.
  }
}

function emitChange() {
  for (const listener of listeners) listener();
}

/** Point the store at a (possibly new) signed-in user and load their data. */
export function setActiveUser(userId: string) {
  if (userId === activeUserId) return;
  activeUserId = userId;
  cache = readFromStorage(userId);
  emitChange();
}

export function getSnapshot(): ProgressMap {
  return cache;
}

export function getServerSnapshot(): ProgressMap {
  return EMPTY_SNAPSHOT;
}

export function subscribe(listener: Listener) {
  listeners.add(listener);

  function onStorage(event: StorageEvent) {
    if (event.key === storageKey(activeUserId)) {
      cache = readFromStorage(activeUserId);
      listener();
    }
  }
  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function setLessonComplete(lessonId: string, complete: boolean) {
  const isComplete = Boolean(cache[lessonId]);
  if (isComplete === complete) return;

  if (complete) {
    cache = { ...cache, [lessonId]: true };
  } else {
    const next = { ...cache };
    delete next[lessonId];
    cache = next;
  }
  persist();
  emitChange();
}

export function toggleLessonComplete(lessonId: string) {
  setLessonComplete(lessonId, !cache[lessonId]);
}
