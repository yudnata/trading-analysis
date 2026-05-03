/**
 * BullMQ queue wiring — implementasi di slice Redis / cron.
 */
export function getQueueStatus(): { configured: boolean } {
  try {
    return { configured: Boolean(process.env.REDIS_URL) };
  } catch {
    return { configured: false };
  }
}
