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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
        <div className="max-w-md w-full">
          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-[2rem] mb-6 shadow-[0_8px_32px_rgba(6,182,212,0.3)]">
              <Footprints className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-gray-900 mb-3">TimeRight에 오신 것을 환영합니다</h1>
            <p className="text-gray-600 leading-relaxed">
              당신의 걷기 속도를 측정하여 맞춤형 길안내를 제공합니다
            </p>
          </div>

          <div className="space-y-3 mb-10">
            <div className="flex items-start gap-4 p-5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-100 to-cyan-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Zap className="w-6 h-6 text-cyan-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1.5">정확한 도착 시간</h3>
                <p className="text-gray-600 leading-relaxed">당신의 걷기 속도로 계산된 실제 도착 시간</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <Timer className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1.5">실시간 행동 알림</h3>
                <p className="text-gray-600 leading-relaxed">지금 뛰어야 할지, 여유있게 걸어도 될지 알려드립니다</p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_2px_16px_rgba(0,0,0,0.04)] border border-white/50">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-50 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                <CheckCircle className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="text-gray-900 mb-1.5">환승 타이밍</h3>
                <p className="text-gray-600 leading-relaxed">환승할 지하철/버스 도착 시간 실시간 확인</p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setStep('measuring')}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-cyan-50 via-white to-blue-50 p-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-10">
            <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full mb-6 relative shadow-[0_8px_32px_rgba(6,182,212,0.3)]">
              <Footprints className="w-14 h-14 text-white animate-pulse" />
              <div className="absolute inset-0 bg-cyan-400 rounded-full animate-ping opacity-30"></div>
            </div>
            <h2 className="text-gray-900 mb-3">걷기 속도 측정 중...</h2>
            <p className="text-gray-600 leading-relaxed">
              평소대로 편안하게 걸어주세요
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] mb-8 border border-white/50">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-gray-600">측정 진행도</span>
                <span className="text-cyan-600">{progress}%</span>
              </div>
              <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            <p className="text-gray-500 leading-relaxed">
              GPS를 사용하여 정확한 속도를 측정하고 있습니다
            </p>
          </div>

          <div className="text-gray-500 bg-cyan-50/50 rounded-2xl p-4">
            <p>💡 팁: 이 측정은 한 번만 하면 됩니다</p>
            <p className="mt-1">설정에서 언제든 재측정할 수 있습니다</p>
          </div>
        </div>
      </div>
    );
  }

  const speedInfo = getSpeedCategory(measuredSpeed);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-emerald-50 via-white to-cyan-50 p-6">
      <div className="max-w-md w-full text-center">
        <div className="mb-10">
          <div className="inline-flex items-center justify-center w-28 h-28 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full mb-6 shadow-[0_8px_32px_rgba(16,185,129,0.3)]">
            <CheckCircle className="w-14 h-14 text-white" />
          </div>
          <h2 className="text-gray-900 mb-3">측정 완료!</h2>
          <p className="text-gray-600 leading-relaxed">
            당신의 걷기 속도가 측정되었습니다
          </p>
        </div>

        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-[0_2px_16px_rgba(0,0,0,0.04)] mb-6 border border-white/50">
          <div className="text-center mb-5">
            <div className="text-gray-600 mb-3">당신의 걷기 속도</div>
            <div className="flex items-baseline justify-center gap-2 mb-3">
              <span className="text-gray-900" style={{ fontSize: '3rem' }}>{measuredSpeed}</span>
              <span className="text-gray-600">m/s</span>
            </div>
            <div className={`inline-flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-gray-50 to-white border border-gray-100 ${speedInfo.color}`}>
              <span style={{ fontSize: '1.5rem' }}>{speedInfo.emoji}</span>
              <span>{speedInfo.label} 걷는 스타일</span>
            </div>
          </div>

          <div className="pt-5 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-gray-50 rounded-xl p-3">
                <div className="text-gray-600 mb-1.5">평균 속도</div>
                <div className="text-gray-900">1.2 m/s</div>
              </div>
              <div className="bg-gradient-to-br from-cyan-50 to-blue-50 rounded-xl p-3">
                <div className="text-cyan-700 mb-1.5">당신</div>
                <div className="text-cyan-700">{measuredSpeed} m/s</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-5 mb-6 border border-cyan-100">
          <p className="text-cyan-800 leading-relaxed">
            🎯 이제 당신에게 딱 맞는 경로 안내를 제공합니다!
          </p>
        </div>

        <button
          onClick={() => onComplete(measuredSpeed)}
          className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 text-white py-4 rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
        >
          TimeRight 시작하기
        </button>
      </div>
    </div>
  );
}