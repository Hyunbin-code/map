import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Animated,
  Dimensions,
  Modal,
  FlatList,
} from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import { useStore } from '../stores/useStore';
import LocationService from '../services/LocationService';
import TransitAPIService from '../services/TransitAPIService';
import DecisionEngine from '../services/DecisionEngine';
import NavigationService from '../services/NavigationService';
import { MOCK_BUS_STOPS, findNearbyStops } from '../data/busStops';
import { Stop } from '../types';

const { width, height } = Dimensions.get('window');

export default function HomeScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pulseAnim] = useState(new Animated.Value(1));
  const [showStopSelector, setShowStopSelector] = useState(false);
  const [nearbyStops, setNearbyStops] = useState<Stop[]>([]);

  const {
    userLocation,
    setUserLocation,
    currentDecision,
    setCurrentDecision,
    isTracking,
    setIsTracking,
    targetStop,
    setTargetStop,
    isNavigating,
    setIsNavigating,
  } = useStore();

  // 펄스 애니메이션 (위치 마커)
  useEffect(() => {
    if (isTracking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.3,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }
  }, [isTracking]);

  // 근처 정류장 업데이트
  useEffect(() => {
    if (userLocation) {
      const nearby = findNearbyStops(
        userLocation.latitude,
        userLocation.longitude,
        1000 // 1km 반경
      );
      setNearbyStops(nearby);
    }
  }, [userLocation]);

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

  // 정류장 선택
  const selectStop = (stop: Stop) => {
    setTargetStop(stop);
    setShowStopSelector(false);
    // 자동으로 네비게이션 시작할지 물어보거나 바로 시작
    startNavigation(stop);
  };

  // 네비게이션 시작
  const startNavigation = async (stop: Stop) => {
    try {
      setIsLoading(true);
      setError(null);

      // 위치 추적이 안 되고 있으면 시작
      if (!isTracking) {
        await startTracking();
      }

      // NavigationService 시작 (콜백으로 userLocation 전달)
      await NavigationService.start(
        stop,
        () => userLocation, // getUserLocation 콜백
        (decision) => {
          setCurrentDecision(decision);
        }
      );

      setIsNavigating(true);
      setIsLoading(false);
    } catch (err) {
      console.error('Error starting navigation:', err);
      setError('네비게이션 시작 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  // 네비게이션 중지
  const stopNavigation = () => {
    NavigationService.stop();
    setIsNavigating(false);
    setCurrentDecision(null);
    setTargetStop(null);
  };

  // 테스트: 버스 도착 정보 조회 및 결정
  const testDecision = async () => {
    try {
      setIsLoading(true);

      const busArrivals = await TransitAPIService.getArrivalInfo('mock-stop-id');

      if (busArrivals.length === 0) {
        setError('버스 정보를 가져올 수 없습니다');
        setIsLoading(false);
        return;
      }

      const nextBus = busArrivals[0];
      const busArrivalSeconds = nextBus.arrivalTimeMinutes1 * 60;

      const mockDistance = 300;
      const mockSignalWaitTimes = [30, 45];

      const decision = DecisionEngine.decide({
        distance: mockDistance,
        busArrivalTime: busArrivalSeconds,
        signalWaitTimes: mockSignalWaitTimes,
      });

      setCurrentDecision(decision);
      setIsLoading(false);
    } catch (err) {
      console.error('Error in testDecision:', err);
      setError('테스트 중 오류가 발생했습니다');
      setIsLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // 컴포넌트 언마운트 시 리소스 정리
      LocationService.stopTracking();
      NavigationService.stop();
    };
  }, []); // 빈 의존성 배열: 마운트 시 한 번만 실행

  // 기본 지도 위치
  const defaultRegion = {
    latitude: userLocation?.latitude || 37.5665,
    longitude: userLocation?.longitude || 126.978,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  };

  // 정류장까지 거리 계산
  const getDistanceToStop = (stop: Stop): number => {
    if (!userLocation) return 0;
    const R = 6371e3;
    const φ1 = (userLocation.latitude * Math.PI) / 180;
    const φ2 = (stop.location.latitude * Math.PI) / 180;
    const Δφ = ((stop.location.latitude - userLocation.latitude) * Math.PI) / 180;
    const Δλ = ((stop.location.longitude - userLocation.longitude) * Math.PI) / 180;
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <View style={styles.container}>
      {/* 지도 영역 */}
      <View style={styles.mapContainer}>
        <MapView
          style={styles.map}
          region={defaultRegion}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          zoomEnabled={true}
          rotateEnabled={false}
        >
          {userLocation && (
            <>
              {/* 사용자 위치 마커 */}
              <Marker
                coordinate={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
              >
                <Animated.View style={[styles.userMarker, { transform: [{ scale: pulseAnim }] }]}>
                  <View style={styles.userMarkerInner} />
                </Animated.View>
              </Marker>

              {/* 정확도 원 */}
              <Circle
                center={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                }}
                radius={userLocation.accuracy || 50}
                fillColor="rgba(74, 144, 226, 0.2)"
                strokeColor="rgba(74, 144, 226, 0.5)"
                strokeWidth={1}
              />
            </>
          )}

          {/* 목표 정류장 마커 */}
          {targetStop && (
            <Marker
              coordinate={{
                latitude: targetStop.location.latitude,
                longitude: targetStop.location.longitude,
              }}
              title={targetStop.name}
              pinColor="#FF4444"
            />
          )}
        </MapView>

        {/* 상단 그라데이션 오버레이 */}
        <View style={styles.topGradient} />

        {/* 상단 헤더 */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>⏱️ TimeRight</Text>
          <Text style={styles.headerSubtitle}>실시간 대중교통 알림</Text>
        </View>

        {/* 위치 추적 버튼 (플로팅) */}
        <TouchableOpacity
          style={[styles.trackingButton, isTracking && styles.trackingButtonActive]}
          onPress={isTracking ? stopTracking : startTracking}
          disabled={isLoading}
        >
          <Text style={styles.trackingButtonIcon}>{isTracking ? '📍' : '📍'}</Text>
        </TouchableOpacity>
      </View>

      {/* 하단 정보 카드 */}
      <View style={styles.bottomSheet}>
        <View style={styles.handleBar} />

        <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* 목표 정류장 카드 */}
          <View style={styles.infoCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardIcon}>🚏</Text>
              <Text style={styles.cardTitle}>목표 정류장</Text>
            </View>

            {targetStop ? (
              <View style={styles.targetStopInfo}>
                <Text style={styles.targetStopName}>{targetStop.name}</Text>
                <Text style={styles.targetStopDistance}>
                  {getDistanceToStop(targetStop).toFixed(0)}m
                </Text>
                {isNavigating ? (
                  <TouchableOpacity style={styles.stopNavButton} onPress={stopNavigation}>
                    <Text style={styles.stopNavButtonText}>네비게이션 중지</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.startNavButton}
                    onPress={() => startNavigation(targetStop)}
                  >
                    <Text style={styles.startNavButtonText}>네비게이션 시작</Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.selectStopButton}
                onPress={() => setShowStopSelector(true)}
              >
                <Text style={styles.selectStopButtonText}>정류장 선택하기</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* 실시간 알림 카드 */}
          {currentDecision && (
            <View
              style={[
                styles.decisionCard,
                { backgroundColor: currentDecision.color + '15' },
                { borderLeftColor: currentDecision.color },
              ]}
            >
              <View style={styles.decisionHeader}>
                <Text style={[styles.decisionEmoji]}>
                  {currentDecision.action === 'RUN'
                    ? '🏃'
                    : currentDecision.action === 'WALK_FAST'
                      ? '🚶'
                      : '✅'}
                </Text>
                <Text style={[styles.decisionMessage, { color: currentDecision.color }]}>
                  {currentDecision.message}
                </Text>
              </View>
              {currentDecision.detail && (
                <Text style={styles.decisionDetail}>{currentDecision.detail}</Text>
              )}
              <View style={styles.urgencyBadge}>
                <View style={[styles.urgencyDot, { backgroundColor: currentDecision.color }]} />
                <Text style={styles.urgencyText}>
                  {currentDecision.urgency === 'HIGH'
                    ? '긴급'
                    : currentDecision.urgency === 'MEDIUM'
                      ? '주의'
                      : currentDecision.urgency === 'LOW'
                        ? '여유'
                        : '정보'}
                </Text>
              </View>
            </View>
          )}

          {/* 위치 정보 카드 */}
          {isTracking && userLocation && (
            <View style={styles.infoCard}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardIcon}>📍</Text>
                <Text style={styles.cardTitle}>현재 위치</Text>
              </View>

              <View style={styles.locationInfo}>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>위도</Text>
                  <Text style={styles.locationValue}>{userLocation.latitude.toFixed(6)}°</Text>
                </View>
                <View style={styles.locationRow}>
                  <Text style={styles.locationLabel}>경도</Text>
                  <Text style={styles.locationValue}>{userLocation.longitude.toFixed(6)}°</Text>
                </View>
                {userLocation.accuracy && (
                  <View style={styles.locationRow}>
                    <Text style={styles.locationLabel}>정확도</Text>
                    <Text style={styles.locationValue}>±{userLocation.accuracy.toFixed(0)}m</Text>
                  </View>
                )}
                <View style={styles.statusBadge}>
                  <View style={styles.statusDot} />
                  <Text style={styles.statusText}>실시간 추적 중</Text>
                </View>
              </View>
            </View>
          )}

          {/* 테스트 버튼 */}
          <TouchableOpacity style={styles.testButton} onPress={testDecision} disabled={isLoading}>
            <Text style={styles.testButtonIcon}>🚌</Text>
            <Text style={styles.testButtonText}>테스트 실행</Text>
          </TouchableOpacity>

          {/* 사용 방법 카드 */}
          <View style={styles.guideCard}>
            <Text style={styles.guideTitle}>💡 사용 방법</Text>
            <View style={styles.guideSteps}>
              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <Text style={styles.stepText}>위치 추적 버튼을 눌러주세요</Text>
              </View>
              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <Text style={styles.stepText}>목표 정류장을 선택하세요</Text>
              </View>
              <View style={styles.guideStep}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <Text style={styles.stepText}>네비게이션 시작 후 실시간 알림을 받으세요</Text>
              </View>
            </View>
          </View>

          {/* 에러 메시지 */}
          {error && (
            <View style={styles.errorCard}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* 하단 여백 */}
          <View style={{ height: 40 }} />
        </ScrollView>
      </View>

      {/* 정류장 선택 모달 */}
      <Modal
        visible={showStopSelector}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStopSelector(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>정류장 선택</Text>
              <TouchableOpacity onPress={() => setShowStopSelector(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={nearbyStops.length > 0 ? nearbyStops : MOCK_BUS_STOPS}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.stopItem} onPress={() => selectStop(item)}>
                  <View>
                    <Text style={styles.stopName}>{item.name}</Text>
                    {userLocation && (
                      <Text style={styles.stopDistance}>{getDistanceToStop(item).toFixed(0)}m</Text>
                    )}
                  </View>
                  <Text style={styles.stopArrow}>›</Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={<Text style={styles.emptyText}>주변에 정류장이 없습니다</Text>}
            />
          </View>
        </View>
      </Modal>

      {/* 로딩 오버레이 */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color="#4A90E2" />
            <Text style={styles.loadingText}>처리 중...</Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  mapContainer: {
    height: height * 0.45,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  header: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    marginTop: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  trackingButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  trackingButtonActive: {
    backgroundColor: '#4A90E2',
  },
  trackingButtonIcon: {
    fontSize: 28,
  },
  userMarker: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userMarkerInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#4A90E2',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  bottomSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  scrollContent: {
    flex: 1,
    padding: 20,
  },
  infoCard: {
    backgroundColor: '#F8FAFB',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E8ECEF',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  targetStopInfo: {
    gap: 12,
  },
  targetStopName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  targetStopDistance: {
    fontSize: 14,
    color: '#666666',
  },
  selectStopButton: {
    backgroundColor: '#4A90E2',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  selectStopButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  startNavButton: {
    backgroundColor: '#00CC66',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  startNavButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  stopNavButton: {
    backgroundColor: '#FF4444',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  stopNavButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  decisionCard: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  decisionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  decisionEmoji: {
    fontSize: 36,
    marginRight: 12,
  },
  decisionMessage: {
    flex: 1,
    fontSize: 22,
    fontWeight: 'bold',
  },
  decisionDetail: {
    fontSize: 15,
    color: '#666666',
    marginBottom: 12,
    lineHeight: 22,
  },
  urgencyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgencyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  urgencyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666666',
  },
  locationInfo: {
    gap: 12,
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationLabel: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  locationValue: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '600',
    fontFamily: 'monospace',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00CC66',
    marginRight: 6,
  },
  statusText: {
    fontSize: 13,
    color: '#00CC66',
    fontWeight: '600',
  },
  testButton: {
    flexDirection: 'row',
    backgroundColor: '#4A90E2',
    padding: 18,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4A90E2',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  testButtonIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  testButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  guideCard: {
    backgroundColor: '#FFF8E1',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FFD54F',
  },
  guideTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#F57C00',
    marginBottom: 16,
  },
  guideSteps: {
    gap: 12,
  },
  guideStep: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FF9800',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  errorCard: {
    flexDirection: 'row',
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#FF5252',
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 14,
    fontWeight: '500',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBox: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  loadingText: {
    marginTop: 16,
    color: '#666666',
    fontSize: 16,
    fontWeight: '500',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: height * 0.7,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333333',
  },
  modalClose: {
    fontSize: 28,
    color: '#666666',
  },
  stopItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  stopName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 4,
  },
  stopDistance: {
    fontSize: 13,
    color: '#888888',
  },
  stopArrow: {
    fontSize: 24,
    color: '#CCCCCC',
  },
  emptyText: {
    textAlign: 'center',
    padding: 40,
    color: '#999999',
    fontSize: 14,
  },
});
