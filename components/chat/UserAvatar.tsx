'use client';

interface UserAvatarProps {
  name: string;
  photoURL?: string | null;
}

export default function UserAvatar({ name }: UserAvatarProps) {
  const initial = name?.[0]?.toUpperCase() || '?';

  return (
    <div className="h-8 w-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
      {initial}
    </div>
  );
}
