'use client';

import { useState, useRef } from 'react';
import { Mic, StopCircle } from 'lucide-react';

export default function VoiceRecorder({ onSend }: { onSend: (url: string) => void }) {
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunks: Blob[] = [];

  const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.start();
    setRecording(true);

    mediaRecorder.ondataavailable = (e) => {
      chunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      const blob = new Blob(chunks, { type: 'audio/webm' });
      const url = URL.createObjectURL(blob);
      onSend(url);
    };
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  };

  return (
    <button
      onClick={recording ? stopRecording : startRecording}
      className="text-white bg-indigo-700 p-2 rounded-full"
    >
      {recording ? <StopCircle className="animate-pulse" /> : <Mic />}
    </button>
  );
}
