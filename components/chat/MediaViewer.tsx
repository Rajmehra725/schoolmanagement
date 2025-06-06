'use client';

import { X } from 'lucide-react';
import Image from 'next/image';

interface MediaViewerProps {
  imageUrl: string;
  onClose: () => void;
}

export default function MediaViewer({ imageUrl, onClose }: MediaViewerProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center">
      <button
        className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full"
        onClick={onClose}
      >
        <X />
      </button>
      <Image
        src={imageUrl}
        alt="Media"
        width={600}
        height={600}
        className="rounded-xl max-w-full max-h-[90vh] object-contain"
      />
    </div>
  );
}
