import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { ActionAlert, AlertType } from './ActionAlert';
import DecisionEngine from '../services/DecisionEngine';
import { calculateDistance, formatDistance, formatTime } from '../utils/distance';

interface Step {
  type: 'walk' | 'subway' | 'bus' | 'transfer';
  instruction: string;
  detail?: string;
  distance?: number;
  duration: number;
}

interface NavigationViewProps {
  route: any;
  userSpeed: number;
  onStop: () => void;
  currentLocation: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
}

export function NavigationView({
  route,
  userSpeed,
  onStop,
  currentLocation,
  destination,
}: NavigationViewProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(240);
  const [distanceRemaining, setDistanceRemaining] = useState(240);
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState<AlertType>('info');

  const steps: Step[] = [
    {
      type: 'walk',
      instruction: '강남역 7번 출구 방향으로 걸어가세요',
      distance: 240,
      duration: 180,
    },
    {
      type: 'subway',
      instruction: '2호선 잠실 방향 탑승',
      detail: '1번 칸이 가장 빠릅니다',
      duration: 720,
    },
    {
      type: 'transfer',
      instruction: '역삼역에서 하차',
      detail: '환승 지하철 3분 후 도착',
      duration: 60,
    },
    {
      type: 'walk',
      instruction: '2번 출구로 나와서 직진',
      distance: 720,
      duration: 540,
    },
  ];

  // 실시간 거리 계산 및 업데이트
  useEffect(() => {
    const updateInterval = setInterval(() => {
      // 실제 거리 계산
      const realDistance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        destination.latitude,
        destination.longitude
      );

      setDistanceRemaining(Math.max(0, realDistance));

      // 예상 도착 시간 계산
      const estimatedTime = realDistance / userSpeed;
      setTimeRemaining(Math.max(0, estimatedTime));
    }, 1000);

    return () => clearInterval(updateInterval);
  }, [currentLocation, destination, userSpeed]);

  // 실시간 알림 생성 (DecisionEngine 사용)
  useEffect(() => {
    const checkAlerts = () => {
      const currentStepData = steps[currentStep];

      // 걷기 단계일 때만 알림 체크
      if (currentStepData.type === 'walk' && distanceRemaining > 0) {
        // Mock 버스 도착 시간 (실제로는 API에서 가져와야 함)
        const mockBusArrival = 120; // 2분 후 도착

        // DecisionEngine으로 행동 결정
        const decision = DecisionEngine.decide(
          {
            distance: distanceRemaining,
            busArrivalTime: mockBusArrival,
            signalWaitTimes: [15, 20], // Mock 신호등 대기 시간
          },
          userSpeed
        );

        // Decision urgency를 AlertType으로 매핑
        let alertTypeMap: AlertType = 'info';
        if (decision.urgency === 'HIGH') {
          alertTypeMap = 'urgent';
        } else if (decision.urgency === 'MEDIUM') {
          alertTypeMap = 'warning';
        }

        // 상태 변경이 있을 때만 알림 표시
        if (decision.urgency === 'HIGH' || decision.urgency === 'MEDIUM') {
          setAlertType(alertTypeMap);
          setAlertMessage(decision.message);
          setShowAlert(true);
        }
      }

      // 환승 단계 알림
      if (currentStepData.type === 'transfer') {
        const transferDecision = DecisionEngine.decideTransfer(
          {
            platformDistance: 100,
            nextTrainArrival: 90,
            crowdLevel: 'MEDIUM',
          },
          userSpeed
        );

        if (transferDecision.urgency === 'HIGH') {
          setAlertType('urgent');
          setAlertMessage(transferDecision.message);
          setShowAlert(true);
        }
      }
    };

    // 5초마다 알림 체크
    const alertInterval = setInterval(checkAlerts, 5000);
    checkAlerts(); // 즉시 한 번 실행

    return () => clearInterval(alertInterval);
  }, [currentStep, distanceRemaining, userSpeed]);

  useEffect(() => {
    if (distanceRemaining === 0 && currentStep < steps.length - 1) {
      setTimeout(() => {
        setCurrentStep((prev) => prev + 1);
        setDistanceRemaining(steps[currentStep + 1]?.distance || 100);
        setTimeRemaining(steps[currentStep + 1]?.duration || 60);
      }, 1000);
    }
  }, [distanceRemaining, currentStep]);

  const currentStepData = steps[currentStep];

  const getStepIcon = (type: string) => {
    switch (type) {
      case 'walk':
        return '🚶';
      case 'subway':
        return '🚇';
      case 'bus':
        return '🚌';
      case 'transfer':
        return '🔄';
      default:
        return '🚶';
    }
  };

  const getStepColor = (type: string) => {
    switch (type) {
      case 'walk':
        return '#F3F4F6';
      case 'subway':
        return '#DBEAFE';
      case 'bus':
        return '#D1FAE5';
      case 'transfer':
        return '#FED7AA';
      default:
        return '#F3F4F6';
    }
  };

  return (
    <View style={styles.container}>
      {/* Map */}
      <MapView
        style={styles.map}
        initialRegion={{
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        showsUserLocation
        showsMyLocationButton={false}
      >
        <Marker coordinate={destination} pinColor="red" />
        <Polyline
          coordinates={[currentLocation, destination]}
          strokeColor="#2563EB"
          strokeWidth={4}
        />
      </MapView>

      {/* Action Alert */}
      <ActionAlert
        message={alertMessage}
        type={alertType}
        onDismiss={() => setShowAlert(false)}
        visible={showAlert}
      />

      {/* Top info bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarContent}>
          <View style={styles.timeInfo}>
            <Text style={styles.timeIcon}>⏱️</Text>
            <Text style={styles.timeText}>{formatTime(timeRemaining)}</Text>
          </View>
          <TouchableOpacity style={styles.stopButton} onPress={onStop}>
            <Text style={styles.stopIcon}>✕</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.arrivalText}>14:35 도착 예정</Text>
      </View>

      {/* Bottom instruction card */}
      <View style={styles.bottomCard}>
        {/* Distance remaining */}
        <View style={styles.distanceRow}>
          <Text style={styles.distanceValue}>{formatDistance(distanceRemaining)}</Text>
          <Text style={styles.distanceLabel}>남음</Text>
        </View>

        {/* Main instruction */}
        <View style={styles.instructionRow}>
          <View
            style={[
              styles.stepIconContainer,
              { backgroundColor: getStepColor(currentStepData.type) },
            ]}
          >
            <Text style={styles.stepIconText}>
              {getStepIcon(currentStepData.type)}
            </Text>
          </View>
          <View style={styles.instructionContent}>
            <Text style={styles.instructionText}>
              {currentStepData.instruction}
            </Text>
            {currentStepData.detail && (
              <Text style={styles.instructionDetail}>
                {currentStepData.detail}
              </Text>
            )}
          </View>
        </View>

        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {steps.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressBar,
                index <= currentStep && styles.progressBarActive,
              ]}
            />
          ))}
        </View>

        {/* Next step preview */}
        {currentStep < steps.length - 1 && (
          <View style={styles.nextStepContainer}>
            <View style={styles.nextStepRow}>
              <Text style={styles.nextStepLabel}>다음:</Text>
              <Text style={styles.nextStepText}>
                {steps[currentStep + 1].instruction}
              </Text>
            </View>
          </View>
        )}

        {/* Real-time insights */}
        <View style={styles.insightContainer}>
          <View style={styles.insightRow}>
            <View style={styles.insightDot} />
            <Text style={styles.insightText}>실시간 교통 상황 반영 중</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1F2937',
  },
  map: {
    flex: 1,
  },
  topBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    padding: 16,
    paddingTop: 50,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  topBarContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeIcon: {
    fontSize: 20,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  stopButton: {
    backgroundColor: '#DC2626',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stopIcon: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  arrivalText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  bottomCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 16,
  },
  distanceValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
  },
  distanceLabel: {
    fontSize: 16,
    color: '#9CA3AF',
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepIconText: {
    fontSize: 20,
  },
  instructionContent: {
    flex: 1,
  },
  instructionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  instructionDetail: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
  },
  progressBarActive: {
    backgroundColor: '#2563EB',
  },
  nextStepContainer: {
    backgroundColor: '#F9FAFB',
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  nextStepRow: {
    flexDirection: 'row',
    gap: 8,
  },
  nextStepLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  nextStepText: {
    fontSize: 14,
    color: '#6B7280',
    flex: 1,
  },
  insightContainer: {
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  insightRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  insightDot: {
    width: 8,
    height: 8,
    backgroundColor: '#2563EB',
    borderRadius: 4,
  },
  insightText: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '500',
  },
});
