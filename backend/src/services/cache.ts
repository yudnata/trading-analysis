/**
 * Redis cache helpers — implementasi di slice Redis.
 * Jangan buka koneksi baru per request; gunakan singleton pool (slice berikutnya).
 */
export async function pingCache(): Promise<boolean> {
  try {
    return false;
  } catch {
    return false;
  }
}
