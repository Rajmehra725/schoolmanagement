'use client';

interface Props {
  count: number;
}

export default function NotificationBadge({ count }: Props) {
  if (count === 0) return null;

  return (
    <div
      className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full
        animate-pulse shadow-lg font-semibold"
    >
      {count > 99 ? '99+' : count}
    </div>
  );
}
