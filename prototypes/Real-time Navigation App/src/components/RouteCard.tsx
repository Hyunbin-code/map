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
      className="bg-white rounded-2xl p-4 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-gray-900">{title}</h3>
            {badge && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                {badge}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
            <span className="text-gray-400">·</span>
            <span>{arrivalTime} 도착</span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-gray-900">{price}</div>
        </div>
      </div>

      {/* Steps */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <div key={index} className="flex items-center gap-2 shrink-0">
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full ${getStepColor(step.type)}`}>
              {getStepIcon(step.type)}
              <span className="whitespace-nowrap">
                {step.line || step.duration}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className="text-gray-400">→</div>
            )}
          </div>
        ))}
      </div>

      {/* AI Insights */}
      <div className="mt-3 pt-3 border-t border-gray-100">
        <div className="flex items-start gap-2">
          <div className="w-2 h-2 bg-blue-600 rounded-full mt-1.5"></div>
          <div className="flex-1">
            <p className="text-blue-600">
              당신의 걷기 속도로 예측한 최적 경로입니다
            </p>
            <p className="text-gray-500 mt-1">
              신호등 대기 2분 · 날씨 맑음
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
