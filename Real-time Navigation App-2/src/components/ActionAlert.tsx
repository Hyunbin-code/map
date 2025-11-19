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
          bg: 'bg-gradient-to-r from-red-500 to-pink-500',
          icon: Zap,
          iconColor: 'text-white',
          border: 'border-red-300/30'
        };
      case 'warning':
        return {
          bg: 'bg-gradient-to-r from-orange-500 to-amber-500',
          icon: AlertCircle,
          iconColor: 'text-white',
          border: 'border-orange-300/30'
        };
      case 'info':
      default:
        return {
          bg: 'bg-gradient-to-r from-cyan-500 to-blue-500',
          icon: Info,
          iconColor: 'text-white',
          border: 'border-cyan-300/30'
        };
    }
  };

  const { bg, icon: Icon, iconColor, border } = getAlertStyle();

  return (
    <motion.div
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -100, opacity: 0 }}
      className="absolute top-20 left-4 right-4 z-30"
    >
      <div className={`${bg} text-white rounded-2xl p-5 shadow-[0_8px_32px_rgba(0,0,0,0.2)] backdrop-blur-xl border ${border}`}>
        <div className="flex items-center gap-3.5">
          <div className="shrink-0 w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
          <div className="flex-1">
            <p className="leading-snug">{message}</p>
          </div>
          <button
            onClick={onDismiss}
            className="shrink-0 hover:bg-white/20 rounded-xl p-2 transition-all duration-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {type === 'urgent' && (
          <motion.div
            className="mt-4 pt-4 border-t border-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center justify-between">
              <span>권장 행동:</span>
              <span className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                🏃 빠르게 걷기
              </span>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}