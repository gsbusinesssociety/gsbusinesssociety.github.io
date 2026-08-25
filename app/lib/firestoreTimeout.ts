/**
 * Columbia's network blocks WebSockets, which forces Firestore onto long-polling
 * (see firebase/config.ts). Reads are therefore slow far more often than they are
 * actually broken, so callers need a deadline they can surface as "retry" rather
 * than hanging forever.
 *
 * Unlike a bare `Promise.race` against a `setTimeout`, this clears the timer once
 * the race settles, so a fast read doesn't leave a pending timeout behind.
 */
export class FirestoreTimeoutError extends Error {
  constructor(ms: number) {
    super(`Firestore request exceeded ${ms}ms`);
    this.name = "FirestoreTimeoutError";
  }
}

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const deadline = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new FirestoreTimeoutError(ms)), ms);
  });

  return Promise.race([promise, deadline]).finally(() => {
    if (timer !== undefined) clearTimeout(timer);
  });
}
