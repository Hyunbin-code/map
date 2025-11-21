import { AlertCircle, Zap, Info, X } from 'lucide-react';
import { motion } from 'motion/react';

interface ActionAlertProps {
  message: string;
  type: 'info' | 'warning' | 'urgent';
  onDismiss: () => void;
}

export function ActionAlert({ message, type, onDismiss }: ActionAlertProps) {
  const getAlertStyle = () => {
    switch (type) {
      case 'urgent':
        return {
          bg: 'bg-red-600',
          icon: Zap,
          iconColor: 'text-white'
        };
      case 'warning':
        return {
          bg: 'bg-orange-500',
          icon: AlertCircle,
          iconColor: 'text-white'
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-600',
          icon: Info,
          iconColor: 'text-white'
        };
    }
  };

  const { bg, icon: Icon, iconColor } = getAlertStyle();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-20 left-4 right-4 z-30"
    >
      <div className={`${bg} text-white rounded-2xl p-4 shadow-2xl`}>
        <div className="flex items-center gap-3">
          <div className="shrink-0">
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="leading-tight">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {type === 'urgent' && (
          <motion.div
            className="mt-3 pt-3 border-t border-white/30"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <span>권장 행동:</span>
              <span className="bg-white/20 px-3 py-1 rounded-full">
                🏃 빠르게 걷기
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
