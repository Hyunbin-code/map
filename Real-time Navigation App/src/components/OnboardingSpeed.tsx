import { useState, useEffect } from 'react';
import { Footprints, Timer, Zap, CheckCircle } from 'lucide-react';

interface OnboardingSpeedProps {
  onComplete: (speed: number) => void;
}

export function OnboardingSpeed({ onComplete }: OnboardingSpeedProps) {
  const [step, setStep] = useState<'welcome' | 'measuring' | 'result'>('welcome');
  const [progress, setProgress] = useState(0);
  const [measuredSpeed, setMeasuredSpeed] = useState(0);

  useEffect(() => {
    if (step === 'measuring') {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('result');
            // Simulate measured speed (1.0 - 1.5 m/s)
            const speed = 1.0 + Math.random() * 0.5;
            setMeasuredSpeed(parseFloat(speed.toFixed(2)));
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      return () => clearInterval(interval);
    }
  }, [step]);

  const getSpeedCategory = (speed: number) => {
    if (speed < 1.1) return { label: '여유롭게', emoji: '🚶', color: 'text-blue-600' };
    if (speed < 1.3) return { label: '보통', emoji: '🚶‍♂️', color: 'text-green-600' };
    return { label: '빠르게', emoji: '🏃', color: 'text-orange-600' };
  };

  if (step === 'welcome') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-blue-600 rounded-3xl mb-6">
              <Footprints className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-gray-900 mb-3">TimeRight에 오신 것을 환영합니다</h1>
            <p className="text-gray-600">
              당신의 걷기 속도를 측정하여 맞춤형 길안내를 제공합니다
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                <Zap className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">정확한 도착 시간</h3>
                <p className="text-gray-600">당신의 걷기 속도로 계산된 실제 도착 시간</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center shrink-0">
                <Timer className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">실시간 행동 알림</h3>
                <p className="text-gray-600">지금 뛰어야 할지, 여유있게 걸어도 될지 알려드립니다</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-4 bg-white rounded-2xl shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1">환승 타이밍</h3>
                <p className="text-gray-600">환승할 지하철/버스 도착 시간 실시간 확인</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('measuring')}
            className="w-full bg-blue-600 text-white py-4 rounded-xl hover:bg-blue-700 transition-colors"
          >
            걷기 속도 측정 시작
          </button>

          <button
            onClick={() => onComplete(1.2)}
            className="w-full mt-3 text-gray-500 py-3 hover:text-gray-700 transition-colors"
          >
            나중에 하기
          </button>
        </div>
      </div>
    );
  }

  if (step === 'measuring') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-blue-600 rounded-full mb-6 relative">
              <Footprints className="w-12 h-12 text-white animate-pulse" />
              <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-50"></div>
            </div>
            <h2 className="text-gray-900 mb-3">걷기 속도 측정 중...</h2>
            <p className="text-gray-600">
              평소대로 편안하게 걸어주세요
            </p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
            <div className="mb-3">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-600">측정 진행도</span>
                <span className="text-blue-600">{progress}%</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-gray-500">
              GPS를 사용하여 정확한 속도를 측정하고 있습니다
            </p>
          </div>

          <div className="text-gray-500">
            <p>💡 팁: 이 측정은 한 번만 하면 됩니다</p>
            <p className="mt-1">설정에서 언제든 재측정할 수 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

  const speedInfo = getSpeedCategory(measuredSpeed);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-green-50 to-white p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-green-600 rounded-full mb-6">
            <CheckCircle className="w-12 h-12 text-white" />
          </div>
          <h2 className="text-gray-900 mb-3">측정 완료!</h2>
          <p className="text-gray-600">
            당신의 걷기 속도가 측정되었습니다
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-lg mb-6">
          <div className="text-center mb-4">
            <div className="text-gray-600 mb-2">당신의 걷기 속도</div>
            <div className="flex items-baseline justify-center gap-2 mb-2">
              <span className="text-gray-900" style={{ fontSize: '3rem' }}>{measuredSpeed}</span>
              <span className="text-gray-600">m/s</span>
            </div>
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-50 ${speedInfo.color}`}>
              <span style={{ fontSize: '1.5rem' }}>{speedInfo.emoji}</span>
              <span>{speedInfo.label} 걷는 스타일</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <div className="text-gray-600 mb-1">평균 속도</div>
                <div className="text-gray-900">1.2 m/s</div>
              </div>
              <div>
                <div className="text-gray-600 mb-1">당신</div>
                <div className="text-blue-600">{measuredSpeed} m/s</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 rounded-2xl p-4 mb-6">
          <p className="text-blue-800">
            🎯 이제 당신에게 딱 맞는 경로 안내를 제공합니다!
          </p>
        </div>

        <button
          onClick={() => onComplete(measuredSpeed)}
          className="w-full bg-green-600 text-white py-4 rounded-xl hover:bg-green-700 transition-colors"
        >
          TimeRight 시작하기
        </button>
      </div>
    </div>
  );
}
