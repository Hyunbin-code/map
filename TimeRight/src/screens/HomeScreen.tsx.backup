import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useStore } from '../stores/useStore';
import LocationService from '../services/LocationService';
import BusAPIService from '../services/BusAPIService';
import DecisionEngine from '../services/DecisionEngine';

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    userLocation,
    setUserLocation,
    currentDecision,
    setCurrentDecision,
    isTracking,
    setIsTracking,
  } = useStore();

  // 위치 추적 시작
  const startTracking = async () => {
    try {
      setIsLoading(true);
      setError(null);

      await LocationService.startTracking((location) => {
        console.log('Location updated:', location);
        setUserLocation(location);
      });

      setIsTracking(true);
      setIsLoading(false);
    } catch (err) {
      setError('위치 권한을 허용해주세요');
      setIsLoading(false);
    }
  };

  // 위치 추적 중지
  const stopTracking = () => {
    LocationService.stopTracking();
    setIsTracking(false);
  };

  // 테스트: 버스 도착 정보 조회 및 결정
  const testDecision = async () => {
    try {
      setIsLoading(true);

      // Mock 버스 데이터 가져오기
      const busArrivals = await BusAPIService.getArrivalInfo('mock-stop-id');
      console.log('Bus arrivals:', busArrivals);

      if (busArrivals.length === 0) {
        setError('버스 정보를 가져올 수 없습니다');
        setIsLoading(false);
        return;
      }

      // 첫 번째 버스
      const nextBus = busArrivals[0];
      const busArrivalSeconds = nextBus.arrivalTimeMinutes1 * 60;

      // 가상의 거리와 신호등 대기 시간
      const mockDistance = 300; // 300m
      const mockSignalWaitTimes = [30, 45]; // 2개 신호등

      // 결정 엔진 실행
      const decision = DecisionEngine.decide({
        distance: mockDistance,
        busArrivalTime: busArrivalSeconds,
        signalWaitTimes: mockSignalWaitTimes,
      });

      console.log('Decision:', decision);
      setCurrentDecision(decision);
      setIsLoading(false);
    } catch (err) {
      console.error('Error in testDecision:', err);
      setError('테스트 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  // 컴포넌트 언마운트 시 추적 중지
  useEffect(() => {
    return () => {
      if (isTracking) {
        LocationService.stopTracking();
      }
    };
  }, [isTracking]);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>⏱️ TimeRight</Text>
        <Text style={styles.subtitle}>실시간 대중교통 네비게이션</Text>
      </View>

      {/* 위치 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📍 현재 위치</Text>
        {userLocation ? (
          <View style={styles.infoBox}>
            <Text style={styles.infoText}>
              위도: {userLocation.latitude.toFixed(6)}
            </Text>
            <Text style={styles.infoText}>
              경도: {userLocation.longitude.toFixed(6)}
            </Text>
            {userLocation.accuracy && (
              <Text style={styles.infoText}>
                정확도: {userLocation.accuracy.toFixed(0)}m
              </Text>
            )}
          </View>
        ) : (
          <Text style={styles.placeholderText}>위치 정보 없음</Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            isTracking ? styles.buttonDanger : styles.buttonPrimary,
          ]}
          onPress={isTracking ? stopTracking : startTracking}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isTracking ? '📍 추적 중지' : '📍 위치 추적 시작'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 현재 결정 (알림) */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 실시간 알림</Text>
        {currentDecision ? (
          <View
            style={[
              styles.decisionBox,
              { backgroundColor: currentDecision.color + '20' },
            ]}
          >
            <Text style={[styles.decisionMessage, { color: currentDecision.color }]}>
              {currentDecision.message}
            </Text>
            {currentDecision.detail && (
              <Text style={styles.decisionDetail}>{currentDecision.detail}</Text>
            )}
            <View style={styles.badgeContainer}>
              <View
                style={[
                  styles.badge,
                  {
                    backgroundColor:
                      currentDecision.urgency === 'HIGH'
                        ? '#FF4444'
                        : currentDecision.urgency === 'MEDIUM'
                        ? '#FF9900'
                        : '#00CC66',
                  },
                ]}
              >
                <Text style={styles.badgeText}>
                  {currentDecision.urgency === 'HIGH'
                    ? '긴급'
                    : currentDecision.urgency === 'MEDIUM'
                    ? '주의'
                    : '여유'}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <Text style={styles.placeholderText}>알림 없음</Text>
        )}

        <TouchableOpacity
          style={[styles.button, styles.buttonSecondary]}
          onPress={testDecision}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>🚌 테스트 실행</Text>
        </TouchableOpacity>
      </View>

      {/* 에러 메시지 */}
      {error && (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      )}

      {/* 로딩 */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4A90E2" />
          <Text style={styles.loadingText}>처리 중...</Text>
        </View>
      )}

      {/* 정보 */}
      <View style={styles.section}>
        <Text style={styles.infoTitle}>💡 사용 방법</Text>
        <Text style={styles.infoText}>1. '위치 추적 시작' 버튼을 눌러주세요</Text>
        <Text style={styles.infoText}>2. '테스트 실행'으로 알림을 확인해보세요</Text>
        <Text style={styles.infoText}>
          3. 실시간으로 "지금 뛰어야 해요!" 알림을 받게 됩니다
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  header: {
    padding: 24,
    paddingTop: 60,
    backgroundColor: '#4A90E2',
    alignItems: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E3F2FD',
  },
  section: {
    margin: 16,
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    color: '#333333',
  },
  infoBox: {
    backgroundColor: '#F0F4F8',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 4,
    lineHeight: 20,
  },
  placeholderText: {
    fontSize: 14,
    color: '#999999',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonPrimary: {
    backgroundColor: '#4A90E2',
  },
  buttonSecondary: {
    backgroundColor: '#50C878',
  },
  buttonDanger: {
    backgroundColor: '#FF6B6B',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  decisionBox: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  decisionMessage: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  decisionDetail: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 8,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  errorBox: {
    margin: 16,
    padding: 12,
    backgroundColor: '#FFE5E5',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FF4444',
  },
  errorText: {
    color: '#CC0000',
    fontSize: 14,
  },
  loadingContainer: {
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 8,
    color: '#666666',
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#4A90E2',
  },
});
