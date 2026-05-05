'use client';

export function LoadingSkeleton(props: { height?: number; className?: string }) {
  const h = props.height ?? 420;
  return (
    <div
      className={`rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-950 ${props.className || ''}`}
    >
      <div className="mb-2 h-4 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
      <div
        className="flex-1 animate-pulse rounded-lg bg-neutral-100 dark:bg-neutral-900"
        style={props.className ? {} : { height: h }}
      />
    </div>
  );
}
