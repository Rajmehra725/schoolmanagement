// components/ui/Tooltip.tsx
'use client';

import { ReactNode, useState } from 'react';

export default function Tooltip({
  content,
  children,
}: {
  content: string;
  children: ReactNode;
}) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative flex items-center"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded shadow z-50">
          {content}
        </div>
      )}
    </div>
  );
}
