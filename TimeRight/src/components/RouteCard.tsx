import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

export interface RouteStep {
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
  weather?: {
    icon: string;
    conditionKo: string;
    temperature: number;
  };
  signalWaitTime?: number;
}

export function RouteCard({
  title,
  time,
  arrivalTime,
  steps,
  price,
  onSelect,
  badge,
  weather,
  signalWaitTime = 2,
}: RouteCardProps) {
  const getStepIcon = (type: string) => {
    switch (type) {
      case 'walk':
        return '🚶';
      case 'bus':
        return '🚌';
      case 'subway':
        return '🚇';
      default:
        return '🚶';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'walk':
        return { bg: '#F3F4F6', text: '#4B5563' };
      case 'bus':
        return { bg: '#D1FAE5', text: '#059669' };
      case 'subway':
        return { bg: '#DBEAFE', text: '#2563EB' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563' };
    }
  };

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onSelect}
      activeOpacity={0.7}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{title}</Text>
            {badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{badge}</Text>
              </View>
            )}
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoIcon}>⏱️</Text>
            <Text style={styles.infoText}>{time}</Text>
            <Text style={styles.separator}>·</Text>
            <Text style={styles.infoText}>{arrivalTime} 도착</Text>
          </View>
        </View>
        <View style={styles.headerRight}>
          <Text style={styles.price}>{price}</Text>
        </View>
      </View>

      {/* Steps */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.stepsContainer}
        contentContainerStyle={styles.stepsContent}
      >
        {steps.map((step, index) => {
          const colors = getStepColor(step.type);
          return (
            <View key={index} style={styles.stepRow}>
              <View
                style={[
                  styles.stepChip,
                  { backgroundColor: colors.bg },
                ]}
              >
                <Text style={styles.stepIcon}>{getStepIcon(step.type)}</Text>
                <Text style={[styles.stepText, { color: colors.text }]}>
                  {step.line || step.duration}
                </Text>
              </View>
              {index < steps.length - 1 && (
                <Text style={styles.arrow}>→</Text>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* AI Insights */}
      <View style={styles.insights}>
        <View style={styles.insightRow}>
          <View style={styles.insightDot} />
          <View style={styles.insightContent}>
            <Text style={styles.insightTitle}>
              당신의 걷기 속도로 예측한 최적 경로입니다
            </Text>
            <Text style={styles.insightDetail}>
              신호등 대기 {signalWaitTime}분
              {weather && (
                <Text> · {weather.icon} {weather.conditionKo} {weather.temperature}°C</Text>
              )}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  headerLeft: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  badge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  infoIcon: {
    fontSize: 14,
  },
  infoText: {
    fontSize: 14,
    color: '#6B7280',
  },
  separator: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  headerRight: {
    justifyContent: 'flex-start',
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  stepsContainer: {
    marginBottom: 12,
  },
  stepsContent: {
    gap: 8,
    paddingVertical: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  stepIcon: {
    fontSize: 16,
  },
  stepText: {
    fontSize: 14,
    fontWeight: '500',
  },
  arrow: {
    fontSize: 14,
    color: '#9CA3AF',
  },
  insights: {
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  insightRow: {
    flexDirection: 'row',
    gap: 8,
  },
  insightDot: {
    width: 8,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
    marginTop: 6,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
    marginBottom: 4,
  },
  insightDetail: {
    fontSize: 14,
    color: '#9CA3AF',
  },
});
