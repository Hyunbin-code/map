import { useState, useEffect } from 'react';
import { X, Navigation, AlertCircle, Clock, Footprints, Train } from 'lucide-react';
import { ActionAlert } from './ActionAlert';

interface NavigationViewProps {
  route: any;
  userSpeed: number;
  onStop: () => void;
}

export function NavigationView({ route, userSpeed, onStop }: NavigationViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(240);
  const [distanceRemaining, setDistanceRemaining] = useState(240);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<'info' | 'warning' | 'urgent'>('info');

  const steps = [
    { 
      type: 'walk', 
      instruction: '강남역 7번 출구 방향으로 걸어가세요',
      distance: 240,
      duration: 180
    },
    { 
      type: 'subway', 
      instruction: '2호선 잠실 방향 탑승',
      detail: '1번 칸이 가장 빠릅니다',
      duration: 720
    },
    { 
      type: 'transfer', 
      instruction: '역삼역에서 하차',
      detail: '환승 지하철 3분 후 도착',
      duration: 60
    },
    { 
      type: 'walk', 
      instruction: '2번 출구로 나와서 직진',
      distance: 720,
      duration: 540
    }
  ];

  useEffect(() => {
    // Simulate progress
    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
      setDistanceRemaining(prev => Math.max(0, prev - 2));
    }, 1000);

    // Trigger alerts based on conditions
    const alertInterval = setInterval(() => {
      const random = Math.random();
      if (random < 0.3) {
        if (currentStep === 0 && distanceRemaining < 100) {
          setAlertType('warning');
          setAlertMessage('정류장 50m 전입니다. 준비하세요!');
          setShowAlert(true);
        } else if (currentStep === 2) {
          setAlertType('urgent');
          setAlertMessage('환승 지하철 2분 후 도착! 서두르세요!');
          setShowAlert(true);
        }
      }
    }, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(alertInterval);
    };
  }, [currentStep, distanceRemaining]);

  useEffect(() => {
    if (distanceRemaining === 0 && currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep(prev => prev + 1);
        setDistanceRemaining(steps[currentStep + 1]?.distance || 100);
        setTimeRemaining(steps[currentStep + 1]?.duration || 60);
      }, 1000);
    }
  }, [distanceRemaining, currentStep]);

  const currentStepData = steps[currentStep];
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <div className="relative h-full w-full bg-gray-900">
      {/* Map area (simplified) */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-800 to-gray-900">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative">
            {/* Route line */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-64 bg-blue-500 opacity-50"></div>
            
            {/* Current location */}
            <div className="relative z-10">
              <div className="w-6 h-6 bg-blue-600 rounded-full border-4 border-white shadow-lg"></div>
              <div className="absolute inset-0 w-6 h-6 bg-blue-400 rounded-full animate-ping opacity-75"></div>
            </div>
          </div>
        </div>

        {/* Direction arrow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2">
          <Navigation className="w-16 h-16 text-blue-500" style={{ transform: 'rotate(0deg)' }} />
        </div>
      </div>

      {/* Action Alert */}
      {showAlert && (
        <ActionAlert
          message={alertMessage}
          type={alertType}
          onDismiss={() => setShowAlert(false)}
        />
      )}

      {/* Top info bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <div className="bg-gradient-to-b from-black/50 to-transparent p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white">
                {minutes}분 {seconds}초
              </span>
            </div>
            <button
              onClick={onStop}
              className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-white/80">
            14:35 도착 예정
          </div>
        </div>
      </div>

      {/* Bottom instruction card */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-white rounded-t-3xl p-6 shadow-2xl">
          {/* Distance remaining */}
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-gray-900">{distanceRemaining}m</span>
            <span className="text-gray-500">남음</span>
          </div>

          {/* Main instruction */}
          <div className="mb-4">
            <div className="flex items-start gap-3">
              {currentStepData.type === 'walk' && (
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center shrink-0">
                  <Footprints className="w-5 h-5 text-gray-600" />
                </div>
              )}
              {currentStepData.type === 'subway' && (
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                  <Train className="w-5 h-5 text-blue-600" />
                </div>
              )}
              {currentStepData.type === 'transfer' && (
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center shrink-0">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-gray-900 mb-1">
                  {currentStepData.instruction}
                </h3>
                {currentStepData.detail && (
                  <p className="text-gray-600">{currentStepData.detail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1 flex-1 rounded-full ${
                  index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Next step preview */}
          {currentStep < steps.length - 1 && (
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-2 text-gray-600">
                <span>다음:</span>
                <span>{steps[currentStep + 1].instruction}</span>
              </div>
            </div>
          )}

          {/* Real-time insights */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-blue-600">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
              <span>실시간 교통 상황 반영 중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
