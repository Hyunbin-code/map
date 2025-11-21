import { Bus, Train, Footprints, Clock, DollarSign } from 'lucide-react';

interface RouteStep {
  type: 'walk' | 'bus' | 'subway';
  duration: string;
  distance?: string;
  line?: string;
  detail: string;
}

interface RouteCardProps {
  title: string;
  time: string;
  arrivalTime: string;
  steps: RouteStep[];
  price: string;
  onSelect: () => void;
  badge?: string;
}

export function RouteCard({
  title,
  time,
  arrivalTime,
  steps,
  price,
  onSelect,
  badge
}: RouteCardProps) {
  
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'walk':
        return <Footprints className="w-4 h-4" />;
      case 'bus':
        return <Bus className="w-4 h-4" />;
      case 'subway':
        return <Train className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'walk':
        return 'text-gray-600 bg-gray-100';
      case 'bus':
        return 'text-green-600 bg-green-100';
      case 'subway':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div 
      onClick={onSelect}
      className="bg-white/95 backdrop-blur-xl rounded-2xl p-5 shadow-[0_2px_16px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_24px_rgba(0,0,0,0.1)] transition-all duration-300 cursor-pointer border border-white/50 hover:scale-[1.01] active:scale-[0.99]"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2.5 mb-2">
            <h3 className="text-gray-900">{title}</h3>
            {badge && (
              <span className="px-2.5 py-1 bg-gradient-to-r from-cyan-50 to-blue-50 text-cyan-700 rounded-lg">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4 text-gray-400" />
            <span>{time}</span>
            <span className="text-gray-300">·</span>
            <span>{arrivalTime} 도착</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-900">{price}</div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2.5 overflow-x-auto pb-2 scrollbar-hide">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2.5 shrink-0">
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl ${getStepColor(step.type)}`}>
              {getStepIcon(step.type)}
              <span className="whitespace-nowrap">
                {step.line || step.duration}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="text-gray-300">→</div>
            )}
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center shrink-0 mt-0.5">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          </div>
          <div className="flex-1">
            <p className="text-cyan-700 mb-1.5">
              당신의 걷기 속도로 예측한 최적 경로입니다
            </p>
            <p className="text-gray-500">
              신호등 대기 2분 · 날씨 맑음
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}