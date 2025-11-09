import React, { useRef, useEffect, useState } from 'react';
import { XIcon, CameraIcon } from './icons';

interface ReceiptScannerModalProps {
  onClose: () => void;
  onCapture: (imageBase64: string) => void;
}

const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({ onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let currentStream: MediaStream | null = null;

    const getCameraStream = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
          audio: false,
        });
        
        currentStream = mediaStream;
        
        if (mounted) {
          if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
          }
          setStream(mediaStream);
        } else {
          // Component unmounted during async operation, cleanup immediately
          mediaStream.getTracks().forEach(track => track.stop());
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        if (mounted) {
          setError("Could not access the camera. Please check permissions.");
          setTimeout(() => {
            if (mounted) onClose();
          }, 2000);
        }
      }
    };

    getCameraStream();

    return () => {
      mounted = false;
      if (currentStream) {
        currentStream.getTracks().forEach(track => track.stop());
      }
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []); // Empty dependency array - only run once

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      // Ensure video has dimensions
      if (video.videoWidth === 0 || video.videoHeight === 0) {
        setError("Camera is not ready. Please wait a moment.");
        return;
      }
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      
      if (context) {
        context.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        // Stop the stream before capturing
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }
        
        onCapture(dataUrl);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-base-100 z-50 flex flex-col">
      <header className="flex items-center justify-between p-4 bg-base-200/80 backdrop-blur-sm">
        <h2 className="text-lg font-semibold text-base-content">Scan Receipt</h2>
        <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-full transition-colors">
          <XIcon className="w-6 h-6" />
        </button>
      </header>
      <main className="flex-grow relative flex items-center justify-center">
        {error ? (
          <div className="text-center p-8 bg-red-500/20 rounded-lg m-4">
            <p className="text-white text-lg">{error}</p>
          </div>
        ) : (
          <>
            <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
            <canvas ref={canvasRef} className="hidden"></canvas>
            <div className="absolute inset-0 border-8 sm:border-[20px] border-black/30 rounded-lg m-4 pointer-events-none"></div>
            <p className="absolute top-4 text-white bg-black/50 px-3 py-1 rounded-full text-sm">Position receipt within the frame</p>
          </>
        )}
      </main>
      <footer className="p-4 bg-base-200/80 backdrop-blur-sm flex justify-center">
        <button 
          onClick={handleCapture} 
          disabled={!!error || !stream}
          className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-base-300 transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed" 
          aria-label="Capture receipt"
        >
          <CameraIcon className="w-8 h-8 text-base-100" />
        </button>
      </footer>
    </div>
  );
};

export default ReceiptScannerModal;
