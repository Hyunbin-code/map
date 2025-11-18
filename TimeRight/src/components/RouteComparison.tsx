import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { RouteStep } from './RouteCard';

interface Route {
  id: number;
  title: string;
  time: string;
  arrivalTime: string;
  steps: RouteStep[];
  price: string;
  badge?: string;
}

interface RouteComparisonProps {
  route1: Route;
  route2: Route;
  onSelect: (routeId: number) => void;
  onClose: () => void;
}

export function RouteComparison({
  route1,
  route2,
  onSelect,
  onClose,
}: RouteComparisonProps) {
  // Parse time to minutes for comparison
  const parseTime = (time: string): number => {
    const match = time.match(/(\d+)분/);
    return match ? parseInt(match[1]) : 0;
  };

  // Parse price for comparison
  const parsePrice = (price: string): number => {
    const match = price.match(/(\d+)/);
    return match ? parseInt(match[1]) : 0;
  };

  const time1 = parseTime(route1.time);
  const time2 = parseTime(route2.time);
  const price1 = parsePrice(route1.price);
  const price2 = parsePrice(route2.price);

  // Calculate walking distance
  const getWalkingDistance = (steps: RouteStep[]): number => {
    return steps
      .filter((s) => s.type === 'walk')
      .reduce((sum, s) => {
        const dist = s.distance?.match(/(\d+)m/);
        return sum + (dist ? parseInt(dist[1]) : 0);
      }, 0);
  };

  const walk1 = getWalkingDistance(route1.steps);
  const walk2 = getWalkingDistance(route2.steps);

  const renderComparisonRow = (
    label: string,
    value1: string,
    value2: string,
    isBetter1: boolean,
    isBetter2: boolean
  ) => (
    <View style={styles.comparisonRow}>
      <Text style={styles.comparisonLabel}>{label}</Text>
      <View style={styles.comparisonValues}>
        <View style={styles.comparisonValueContainer}>
          <Text
            style={[
              styles.comparisonValue,
              isBetter1 && styles.comparisonValueBetter,
            ]}
          >
            {value1}
          </Text>
          {isBetter1 && <View style={styles.betterDot} />}
        </View>
        <View style={styles.comparisonDivider} />
        <View style={styles.comparisonValueContainer}>
          <Text
            style={[
              styles.comparisonValue,
              isBetter2 && styles.comparisonValueBetter,
            ]}
          >
            {value2}
          </Text>
          {isBetter2 && <View style={styles.betterDot} />}
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>경로 비교</Text>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.closeButton}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Route Names */}
        <View style={styles.routeNames}>
          <View style={styles.routeNameContainer}>
            <Text style={styles.routeName}>{route1.title}</Text>
            {route1.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{route1.badge}</Text>
              </View>
            )}
          </View>
          <View style={styles.routeNameContainer}>
            <Text style={styles.routeName}>{route2.title}</Text>
            {route2.badge && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{route2.badge}</Text>
              </View>
            )}
          </View>
        </View>

        {/* Comparison Table */}
        <View style={styles.comparisonTable}>
          {renderComparisonRow('소요 시간', route1.time, route2.time, time1 < time2, time2 < time1)}
          {renderComparisonRow(
            '도착 시간',
            route1.arrivalTime,
            route2.arrivalTime,
            false,
            false
          )}
          {renderComparisonRow('요금', route1.price, route2.price, price1 < price2, price2 < price1)}
          {renderComparisonRow(
            '도보 거리',
            `${walk1}m`,
            `${walk2}m`,
            walk1 < walk2,
            walk2 < walk1
          )}
          {renderComparisonRow(
            '환승 횟수',
            `${route1.steps.filter((s) => s.type !== 'walk').length}회`,
            `${route2.steps.filter((s) => s.type !== 'walk').length}회`,
            route1.steps.filter((s) => s.type !== 'walk').length <
              route2.steps.filter((s) => s.type !== 'walk').length,
            route2.steps.filter((s) => s.type !== 'walk').length <
              route1.steps.filter((s) => s.type !== 'walk').length
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onSelect(route1.id)}
          >
            <Text style={styles.selectButtonText}>{route1.title} 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.selectButton}
            onPress={() => onSelect(route2.id)}
          >
            <Text style={styles.selectButtonText}>{route2.title} 선택</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 50,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
  },
  closeButton: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  content: {
    padding: 20,
    gap: 24,
  },
  routeNames: {
    flexDirection: 'row',
    gap: 12,
  },
  routeNameContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
  },
  routeName: {
    fontSize: 16,
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
    fontSize: 11,
    color: '#1D4ED8',
    fontWeight: '600',
  },
  comparisonTable: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
  },
  comparisonRow: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  comparisonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  comparisonValues: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  comparisonDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E5E7EB',
  },
  comparisonValueContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  comparisonValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
  },
  comparisonValueBetter: {
    color: '#2563EB',
    fontWeight: '600',
  },
  betterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#2563EB',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  selectButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
