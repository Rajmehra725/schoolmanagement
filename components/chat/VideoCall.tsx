'use client';

import React, { useEffect, useRef, useState } from 'react';
import { db } from '@/firebase/config';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  addDoc,
  onSnapshot,
  deleteDoc,
  query,
  getDocs,
} from 'firebase/firestore';
import { motion } from 'framer-motion';

const ICE_SERVERS = {
  iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],
};

export default function VideoCall() {
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  const [pc, setPc] = useState<RTCPeerConnection | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callId, setCallId] = useState<string>('');
  const [inputCallId, setInputCallId] = useState<string>('');
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isCameraOff, setIsCameraOff] = useState(false);
  const [callActive, setCallActive] = useState(false);
  const [status, setStatus] = useState<string>('Idle');

  // Setup local stream and peer connection
  const setupConnection = async () => {
    setStatus('Setting up local media...');
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    setLocalStream(stream);
    if (localVideoRef.current) localVideoRef.current.srcObject = stream;

    const peerConnection = new RTCPeerConnection(ICE_SERVERS);
    setPc(peerConnection);

    // Add local tracks to peer connection
    stream.getTracks().forEach((track) => peerConnection.addTrack(track, stream));

    // Create remote stream and set on remote video
    const remoteStream = new MediaStream();
    setRemoteStream(remoteStream);
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;

    // When remote track arrives, add to remoteStream
    peerConnection.ontrack = (event) => {
      event.streams[0].getTracks().forEach((track) => {
        remoteStream.addTrack(track);
      });
    };

    return peerConnection;
  };

  // Start call - Caller
  const startCall = async () => {
    setStatus('Starting call...');
    const peerConnection = await setupConnection();

    // Firestore refs
    const callDoc = doc(collection(db, 'calls'));
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    setCallId(callDoc.id);

    // Collect ICE candidates and store in Firestore
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(offerCandidates, event.candidate.toJSON());
      }
    };

    // Create offer
    const offerDescription = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offerDescription);

    // Save offer to Firestore
    const offer = {
      sdp: offerDescription.sdp,
      type: offerDescription.type,
    };
    await setDoc(callDoc, { offer });

    // Listen for answer
    onSnapshot(callDoc, (snapshot) => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data?.answer) {
        const answerDescription = new RTCSessionDescription(data.answer);
        peerConnection.setRemoteDescription(answerDescription);
        setStatus('Call connected');
        setCallActive(true);
      }
    });

    // Listen for remote ICE candidates
    onSnapshot(answerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });
  };

  // Answer call - Callee
  const answerCall = async () => {
    if (!inputCallId) {
      alert('Please enter a valid Call ID');
      return;
    }
    setStatus('Answering call...');
    const peerConnection = await setupConnection();

    const callDoc = doc(db, 'calls', inputCallId);
    const offerCandidates = collection(callDoc, 'offerCandidates');
    const answerCandidates = collection(callDoc, 'answerCandidates');

    setCallId(inputCallId);

    // Listen for ICE candidates from caller
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        addDoc(answerCandidates, event.candidate.toJSON());
      }
    };

    // Fetch call data
    const callData = (await getDoc(callDoc)).data();
    if (!callData) {
      alert('Call not found');
      return;
    }
    // Set offer as remote description
    await peerConnection.setRemoteDescription(new RTCSessionDescription(callData.offer));

    // Create and set answer description
    const answerDescription = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answerDescription);

    // Update call doc with answer
    await updateDoc(callDoc, { answer: { type: answerDescription.type, sdp: answerDescription.sdp } });

    // Listen for caller ICE candidates
    onSnapshot(offerCandidates, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const candidate = new RTCIceCandidate(change.doc.data());
          peerConnection.addIceCandidate(candidate);
        }
      });
    });

    setStatus('Call connected');
    setCallActive(true);
  };

  // Hang up and cleanup
  const hangUp = async () => {
    setStatus('Ending call...');
    if (pc) pc.close();
    if (localStream) {
      localStream.getTracks().forEach((track) => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach((track) => track.stop());
    }
    setPc(null);
    setLocalStream(null);
    setRemoteStream(null);
    setCallActive(false);

    if (callId) {
      // Delete firestore call document and candidate subcollections
      const callDoc = doc(db, 'calls', callId);

      const offerCandidates = collection(callDoc, 'offerCandidates');
      const answerCandidates = collection(callDoc, 'answerCandidates');

      const deleteCollection = async (colRef: any) => {
        const docs = await getDocs(colRef);
        for (const docSnap of docs.docs) {
          await deleteDoc(docSnap.ref);
        }
      };

      await deleteCollection(offerCandidates);
      await deleteCollection(answerCandidates);
      await deleteDoc(callDoc);
    }

    setCallId('');
    setInputCallId('');
    setStatus('Idle');
  };

  // Toggle mic
  const toggleMic = () => {
    if (!localStream) return;
    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicMuted(!track.enabled);
    });
  };

  // Toggle camera
  const toggleCamera = () => {
    if (!localStream) return;
    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraOff(!track.enabled);
    });
  };

  return (
    <motion.div
      className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <h1 className="text-white text-3xl font-bold mb-6">🔥 Real-time Video Call Demo</h1>

      <div className="flex flex-col md:flex-row gap-6 w-full max-w-6xl bg-white bg-opacity-10 backdrop-blur-md rounded-xl shadow-xl p-6">
        {/* Local Video */}
        <div className="flex flex-col items-center">
          <h2 className="text-white font-semibold mb-2">You</h2>
          <video
            ref={localVideoRef}
            autoPlay
            muted
            playsInline
            className={`rounded-lg shadow-lg border-4 border-white transition-opacity duration-500 ${
              isCameraOff ? 'opacity-30' : 'opacity-100'
            }`}
            style={{ width: '320px', height: '240px', objectFit: 'cover' }}
          />
          <div className="flex space-x-4 mt-4">
            <button
              onClick={toggleMic}
              className={`px-4 py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
                isMicMuted ? 'bg-red-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isMicMuted ? 'Unmute Mic' : 'Mute Mic'}
            </button>
            <button
              onClick={toggleCamera}
              className={`px-4 py-2 rounded-md text-white font-semibold transition-colors duration-300 ${
                isCameraOff ? 'bg-red-600' : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isCameraOff ? 'Turn On Camera' : 'Turn Off Camera'}
            </button>
          </div>
        </div>

        {/* Remote Video */}
        <div className="flex flex-col items-center">
          <h2 className="text-white font-semibold mb-2">Peer</h2>
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="rounded-lg shadow-lg border-4 border-white"
            style={{ width: '320px', height: '240px', objectFit: 'cover' }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4 mt-8">
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={startCall}
          disabled={!!callActive}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-300 ${
            callActive ? 'bg-gray-500 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
          }`}
        >
          Start Call (Caller)
        </motion.button>

        <input
          type="text"
          placeholder="Enter Call ID to answer"
          value={inputCallId}
          onChange={(e) => setInputCallId(e.target.value)}
          className="px-4 py-3 rounded-lg text-gray-800 font-medium w-64 focus:outline-none"
          disabled={!!callActive}
        />

        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={answerCall}
          disabled={!!callActive || !inputCallId}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-300 ${
            callActive || !inputCallId
              ? 'bg-gray-500 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700'
          }`}
        >
          Answer Call (Callee)
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={hangUp}
          disabled={!callActive}
          className={`px-6 py-3 rounded-lg font-semibold text-white transition-colors duration-300 ${
            !callActive ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
          }`}
        >
          Hang Up
        </motion.button>
      </div>

      {/* Call ID display */}
      {callId && (
        <div className="mt-6 p-4 bg-white bg-opacity-20 rounded-lg text-white font-mono">
          <p className="mb-1">Share this Call ID with peer to join:</p>
          <p className="break-all">{callId}</p>
        </div>
      )}

      {/* Status */}
      <div className="mt-4 text-white font-semibold">{status}</div>
    </motion.div>
  );
}
