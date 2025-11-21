import { useEffect, useRef, useState } from 'react';
import { Navigation, MapPin } from 'lucide-react';

interface MapViewProps {
  selectedRoute?: any;
  isNavigating?: boolean;
  currentStep?: number;
  distanceRemaining?: number;
  route?: any;
}

export function MapView({ selectedRoute, isNavigating = false, currentStep = 0, distanceRemaining = 0, route }: MapViewProps) {
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
    ctx.fillStyle = isNavigating ? '#E8EEF2' : '#F5F5F5';
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
    ctx.fillStyle = isNavigating ? '#CFD8DC' : '#E8E8E8';
    ctx.fillRect(width * 0.1, height * 0.1, width * 0.2, height * 0.15);
    ctx.fillRect(width * 0.5, height * 0.4, width * 0.15, height * 0.2);
    ctx.fillRect(width * 0.7, height * 0.15, width * 0.2, height * 0.1);
    ctx.fillRect(width * 0.15, height * 0.75, width * 0.15, height * 0.15);

    // Draw green spaces (parks)
    ctx.fillStyle = isNavigating ? '#B2DFDB' : '#D4E7D4';
    ctx.fillRect(width * 0.45, height * 0.05, width * 0.1, height * 0.15);
    ctx.fillRect(width * 0.65, height * 0.75, width * 0.2, height * 0.15);

    // Draw route if selected or navigating
    if (selectedRoute || route) {
      // Create gradient for route
      const gradient = ctx.createLinearGradient(width * 0.5, height * 0.8, width * 0.5, height * 0.2);
      gradient.addColorStop(0, '#06b6d4');
      gradient.addColorStop(1, '#3b82f6');
      
      ctx.strokeStyle = isNavigating ? gradient : '#4285F4';
      ctx.lineWidth = isNavigating ? 8 : 6;
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
      if (!isNavigating) {
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
      } else {
        // In navigation mode, show current position along route
        const progress = Math.max(0, 1 - (distanceRemaining / 240));
        const positions = [
          { x: width * 0.5, y: height * 0.8 },
          { x: width * 0.5, y: height * 0.6 },
          { x: width * 0.4, y: height * 0.5 },
          { x: width * 0.4, y: height * 0.3 },
          { x: width * 0.5, y: height * 0.2 }
        ];
        
        // Interpolate position
        const segmentLength = 1 / (positions.length - 1);
        const currentSegment = Math.floor(progress / segmentLength);
        const segmentProgress = (progress % segmentLength) / segmentLength;
        
        if (currentSegment < positions.length - 1) {
          const start = positions[currentSegment];
          const end = positions[currentSegment + 1];
          const currentX = start.x + (end.x - start.x) * segmentProgress;
          const currentY = start.y + (end.y - start.y) * segmentProgress;
          
          // Draw current position with glow effect
          ctx.shadowBlur = 20;
          ctx.shadowColor = 'rgba(6, 182, 212, 0.6)';
          ctx.fillStyle = '#06b6d4';
          ctx.beginPath();
          ctx.arc(currentX, currentY, 10, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
          
          // White center
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(currentX, currentY, 6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

  }, [selectedRoute, isNavigating, currentStep, distanceRemaining, route]);

  return (
    <div className="relative w-full h-full">
      <canvas
        ref={canvasRef}
        className="w-full h-full"
        style={{ touchAction: 'none' }}
      />
      
      {!isNavigating && (
        <>
          {/* Current location button */}
          <button className="absolute bottom-6 right-4 bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200 border border-white/50">
            <Navigation className="w-6 h-6 text-cyan-600" />
          </button>

          {/* Map controls */}
          <div className="absolute bottom-24 right-4 flex flex-col gap-2">
            <button className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200 border border-white/50">
              <span className="block w-6 h-6 text-center text-gray-700">+</span>
            </button>
            <button className="bg-white/95 backdrop-blur-xl p-3 rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.08)] transition-all duration-200 border border-white/50">
              <span className="block w-6 h-6 text-center text-gray-700">−</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}