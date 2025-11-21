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
          accentColor: '#DC2626',
          label: '긴급',
          recommendedAction: '빠르게 이동',
        };
      case 'warning':
        return {
          accentColor: '#F97316',
          label: '주의',
          recommendedAction: '조금 서두르기',
        };
      case 'info':
      default:
        return {
          accentColor: '#2563EB',
          label: '안내',
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
      <View style={styles.card}>
        <View style={[styles.accentBar, { backgroundColor: alertStyle.accentColor }]} />

        <View style={styles.cardContent}>
          <View style={styles.header}>
            <View style={styles.labelContainer}>
              <View style={[styles.labelDot, { backgroundColor: alertStyle.accentColor }]} />
              <Text style={styles.label}>{alertStyle.label}</Text>
            </View>
            <TouchableOpacity onPress={onDismiss} style={styles.closeButton}>
              <Text style={styles.closeIcon}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.message}>{message}</Text>

          {type === 'urgent' && alertStyle.recommendedAction && (
            <View style={styles.actionContainer}>
              <View style={[styles.actionBadge, { backgroundColor: alertStyle.accentColor }]}>
                <Text style={styles.actionText}>{alertStyle.recommendedAction}</Text>
              </View>
            </View>
          )}
        </View>
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
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  accentBar: {
    width: 4,
  },
  cardContent: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  labelDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1F2937',
    letterSpacing: 0.3,
  },
  message: {
    color: '#374151',
    fontSize: 15,
    lineHeight: 21,
    fontWeight: '500',
  },
  closeButton: {
    padding: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  closeIcon: {
    color: '#9CA3AF',
    fontSize: 18,
    fontWeight: '600',
  },
  actionContainer: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  actionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
});
