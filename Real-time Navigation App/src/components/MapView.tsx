import { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin } from 'lucide-react';

interface MapViewProps {
  selectedRoute?: any;
}

export function MapView({ selectedRoute }: MapViewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [userLocation, setUserLocation] = useState({ lat: 37.5665, lng: 126.9780 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    canvas.width = canvas.offsetWidth * window.devicePixelRatio;
    canvas.height = canvas.offsetHeight * window.devicePixelRatio;
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    // Draw map background (Google Maps style)
    ctx.fillStyle = '#F5F5F5';
    ctx.fillRect(0, 0, width, height);

    // Draw roads
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    
    // Main roads
    ctx.beginPath();
    ctx.moveTo(0, height * 0.3);
    ctx.lineTo(width, height * 0.3);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(width * 0.4, 0);
    ctx.lineTo(width * 0.4, height);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);
    ctx.lineTo(width, height * 0.7);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width * 0.6, 0);
    ctx.lineTo(width * 0.6, height);
    ctx.stroke();

    // Draw some buildings
    ctx.fillStyle = '#E8E8E8';
    ctx.fillRect(width * 0.1, height * 0.1, width * 0.2, height * 0.15);
    ctx.fillRect(width * 0.5, height * 0.4, width * 0.15, height * 0.2);
    ctx.fillRect(width * 0.7, height * 0.15, width * 0.2, height * 0.1);
    ctx.fillRect(width * 0.15, height * 0.75, width * 0.15, height * 0.15);

    // Draw green spaces (parks)
    ctx.fillStyle = '#D4E7D4';
    ctx.fillRect(width * 0.45, height * 0.05, width * 0.1, height * 0.15);
    ctx.fillRect(width * 0.65, height * 0.75, width * 0.2, height * 0.15);

    // Draw route if selected
    if (selectedRoute) {
      ctx.strokeStyle = '#4285F4';
      ctx.lineWidth = 6;
      ctx.setLineDash([]);
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      
      ctx.beginPath();
      ctx.moveTo(width * 0.5, height * 0.8);
      ctx.lineTo(width * 0.5, height * 0.6);
      ctx.lineTo(width * 0.4, height * 0.5);
      ctx.lineTo(width * 0.4, height * 0.3);
      ctx.lineTo(width * 0.5, height * 0.2);
      ctx.stroke();

      // Draw dots for stops
      ctx.fillStyle = '#4285F4';
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.8, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(width * 0.4, height * 0.3, 8, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.beginPath();
      ctx.arc(width * 0.5, height * 0.2, 8, 0, Math.PI * 2);
      ctx.fill();
    }

  }, [selectedRoute]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      {/* Current location button */}
      <button className="absolute bottom-6 right-4 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
        <Navigation className="w-6 h-6 text-blue-600" />
      </button>

      {/* User location marker */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
        <div className="relative">
          <div className="w-5 h-5 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
          <div className="absolute inset-0 w-5 h-5 bg-blue-400 rounded-full animate-ping opacity-75"></div>
        </div>
      </div>

      {/* Map controls */}
      <div className="absolute bottom-24 right-4 flex flex-col gap-2">
        <button className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <span className="block w-6 h-6 text-center">+</span>
        </button>
        <button className="bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-shadow">
          <span className="block w-6 h-6 text-center">−</span>
        </button>
      </div>
    </div>
  );
}
