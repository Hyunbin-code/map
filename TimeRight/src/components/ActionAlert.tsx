import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';

export type AlertType = 'info' | 'warning' | 'urgent';

interface ActionAlertProps {
  message: string;
  type: AlertType;
  onDismiss: () => void;
  visible: boolean;
}

export function ActionAlert({
  message,
  type,
  onDismiss,
  visible,
}: ActionAlertProps) {
  const slideAnim = new Animated.Value(-100);
  const opacityAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  if (!visible) return null;

  const getAlertStyle = () => {
    switch (type) {
      case 'urgent':
        return {
          backgroundColor: '#DC2626',
          icon: '⚡',
          recommendedAction: '🏃 빠르게 걷기',
        };
      case 'warning':
        return {
          backgroundColor: '#F97316',
          icon: '⚠️',
          recommendedAction: '🚶 조금 서두르기',
        };
      case 'info':
      default:
        return {
          backgroundColor: '#2563EB',
          icon: 'ℹ️',
          recommendedAction: null,
        };
    }
  };

  const alertStyle = getAlertStyle();

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [{ translateY: slideAnim }],
          opacity: opacityAnim,
        },
      ]}
    >
      <View style={[styles.card, { backgroundColor: alertStyle.backgroundColor }]}>
        <View style={styles.content}>
          <Text style={styles.icon}>{alertStyle.icon}</Text>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
            <Text style={styles.closeIcon}>✕</Text>
          </TouchableOpacity>
        </View>

        {type === 'urgent' && alertStyle.recommendedAction && (
          <View style={styles.actionContainer}>
            <Text style={styles.actionLabel}>권장 행동:</Text>
            <View style={styles.actionBadge}>
              <Text style={styles.actionText}>{alertStyle.recommendedAction}</Text>
            </View>
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    zIndex: 1000,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  icon: {
    fontSize: 24,
  },
  message: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
  },
  closeIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  actionContainer: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.3)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  actionBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
