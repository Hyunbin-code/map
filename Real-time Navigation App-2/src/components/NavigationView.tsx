import { useState, useEffect } from 'react';
import { X, Navigation, AlertCircle, Clock, Footprints, Train } from 'lucide-react';
import { ActionAlert } from './ActionAlert';
import { MapView } from './MapView';

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
    <div className="relative h-full w-full">
      {/* Map area with navigation mode enabled */}
      <MapView
        route={route}
        isNavigating={true}
        currentStep={currentStep}
        distanceRemaining={distanceRemaining}
      />

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
        <div className="bg-gradient-to-b from-black/40 via-black/20 to-transparent backdrop-blur-sm p-5">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5 bg-white/10 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-white/20">
              <Clock className="w-5 h-5 text-white" />
              <span className="text-white">
                {minutes}분 {seconds}초
              </span>
            </div>
            <button
              onClick={onStop}
              className="bg-red-500/90 backdrop-blur-sm text-white p-2.5 rounded-2xl hover:bg-red-600 transition-all duration-200 border border-white/20 hover:scale-105 active:scale-95"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="text-white/90 ml-1">
            14:35 도착 예정
          </div>
        </div>
      </div>

      {/* Bottom instruction card */}
      <div className="absolute bottom-0 left-0 right-0 z-20">
        <div className="bg-white/95 backdrop-blur-xl rounded-t-[2rem] p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.12)] border-t border-white/50">
          {/* Distance remaining */}
          <div className="flex items-baseline gap-2.5 mb-4">
            <span className="text-gray-900">{distanceRemaining}m</span>
            <span className="text-gray-500">남음</span>
          </div>

          {/* Main instruction */}
          <div className="mb-5">
            <div className="flex items-start gap-4">
              {currentStepData.type === 'walk' && (
                <div className="w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Footprints className="w-6 h-6 text-gray-600" />
                </div>
              )}
              {currentStepData.type === 'subway' && (
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Train className="w-6 h-6 text-blue-600" />
                </div>
              )}
              {currentStepData.type === 'transfer' && (
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-gray-900 mb-2">
                  {currentStepData.instruction}
                </h3>
                {currentStepData.detail && (
                  <p className="text-gray-600">{currentStepData.detail}</p>
                )}
              </div>
            </div>
          </div>

          {/* Progress indicator */}
          <div className="flex items-center gap-2 mb-5">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${
                  index <= currentStep ? 'bg-gradient-to-r from-cyan-500 to-blue-500' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          {/* Next step preview */}
          {currentStep < steps.length - 1 && (
            <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-4 border border-gray-100">
              <div className="flex items-center gap-2.5 text-gray-600">
                <span className="text-gray-500">다음:</span>
                <span>{steps[currentStep + 1].instruction}</span>
              </div>
            </div>
          )}

          {/* Real-time insights */}
          <div className="mt-5 pt-5 border-t border-gray-100">
            <div className="flex items-center gap-2.5">
              <div className="w-2 h-2 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full animate-pulse"></div>
              <span className="text-cyan-700">실시간 교통 상황 반영 중</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}