import { Location, Stop, Decision } from '../types';
import TransitAPIService from './TransitAPIService';
import DecisionEngine from './DecisionEngine';
import NotificationService from './NotificationService';

class NavigationService {
  private isActive: boolean = false;
  private targetStop: Stop | null = null;
  private intervalId: number | null = null;
  private checkInterval: number = 5000; // 5초마다 체크
  private onDecisionUpdate: ((decision: Decision) => void) | null = null;
  private getUserLocationCallback: (() => Location | null) | null = null;

  /**
   * 네비게이션 시작
   * @param targetStop 목표 정류장
   * @param getUserLocation 사용자 위치를 가져오는 콜백 함수
   * @param onDecisionUpdate 결정 업데이트 콜백 함수
   */
  async start(
    targetStop: Stop,
    getUserLocation: () => Location | null,
    onDecisionUpdate?: (decision: Decision) => void
  ): Promise<void> {
    if (this.isActive) {
      console.warn('[NavigationService] Already running');
      return;
    }

    this.targetStop = targetStop;
    this.isActive = true;
    this.getUserLocationCallback = getUserLocation;
    this.onDecisionUpdate = onDecisionUpdate || null;

    console.log('[NavigationService] Started for stop:', targetStop.name);

    // 알림 초기화 및 권한 요청
    const hasPermission = await NotificationService.initialize();
    if (!hasPermission) {
      console.warn(
        '[NavigationService] Notification permission not granted, notifications will be disabled'
      );
    }

    // 즉시 한 번 실행
    await this.checkAndNotify();

    // 주기적 체크 시작
    this.intervalId = setInterval(() => {
      this.checkAndNotify();
    }, this.checkInterval) as unknown as number;
  }

  /**
   * 네비게이션 중지
   */
  stop(): void {
    this.isActive = false;
    this.targetStop = null;
    this.onDecisionUpdate = null;
    this.getUserLocationCallback = null;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    NotificationService.reset();
    console.log('[NavigationService] Stopped');
  }

  /**
   * 체크 및 알림
   */
  private async checkAndNotify(): Promise<void> {
    if (!this.isActive || !this.targetStop) {
      return;
    }

    try {
      // 1. 현재 위치 가져오기
      const userLocation = this.getUserLocation();
      if (!userLocation) {
        console.warn('[NavigationService] No user location');
        return;
      }

      // 2. 거리 계산
      const distance = this.calculateDistance(userLocation, this.targetStop.location);

      // 3. 거리 기반 체크 간격 동적 조정
      this.adjustCheckIntervalByDistance(distance);

      // 4. 버스 도착 정보 가져오기 (거리 정보 포함 - 스마트 캐싱)
      const busArrivals = await TransitAPIService.getArrivalInfo(this.targetStop.id, distance);
      if (!busArrivals || busArrivals.length === 0) {
        console.warn('[NavigationService] No bus arrivals available');
        return;
      }

      const nextBus = busArrivals[0]; // 가장 빨리 오는 버스
      const busArrivalSeconds = nextBus.arrivalTimeMinutes1 * 60;

      // 5. 신호등 대기 시간 (현재는 mock)
      const signalWaitTimes = this.estimateSignalWaitTimes(distance);

      // 6. 결정 엔진 실행
      const decision = DecisionEngine.decide({
        distance,
        busArrivalTime: busArrivalSeconds,
        signalWaitTimes,
      });

      // 7. 알림 전송
      await NotificationService.send(decision);

      // 8. 콜백 호출
      if (this.onDecisionUpdate) {
        this.onDecisionUpdate(decision);
      }

      console.log(
        `[NavigationService] Decision: ${decision.action}, Distance: ${distance.toFixed(0)}m, Bus: ${nextBus.arrivalTimeMinutes1}min, Interval: ${this.checkInterval}ms`
      );
    } catch (error) {
      console.error('[NavigationService] Error in checkAndNotify:', error);
    }
  }

  /**
   * 사용자 위치 가져오기 (콜백 사용)
   */
  private getUserLocation(): Location | null {
    if (!this.getUserLocationCallback) {
      console.error('[NavigationService] getUserLocation callback not set');
      return null;
    }
    return this.getUserLocationCallback();
  }

  /**
   * 거리 계산 (Haversine 공식)
   */
  private calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // 지구 반지름 (m)
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터
  }

  /**
   * 신호등 대기 시간 추정 (거리 기반)
   */
  private estimateSignalWaitTimes(distance: number): number[] {
    // 100m당 신호등 1개 가정
    const signalCount = Math.floor(distance / 100);

    // 각 신호등마다 평균 30초 대기 가정
    const waitTimes: number[] = [];
    for (let i = 0; i < signalCount; i++) {
      waitTimes.push(30);
    }

    return waitTimes;
  }

  /**
   * 거리 기반 체크 간격 동적 조정
   * - 거리 > 1km: 30초 간격 (네트워크 절약)
   * - 거리 500m-1km: 15초 간격
   * - 거리 200m-500m: 10초 간격
   * - 거리 < 200m: 5초 간격 (정확도 우선)
   */
  private adjustCheckIntervalByDistance(distance: number): void {
    let optimalInterval: number;

    if (distance > 1000) {
      optimalInterval = 30000; // 30초
    } else if (distance > 500) {
      optimalInterval = 15000; // 15초
    } else if (distance > 200) {
      optimalInterval = 10000; // 10초
    } else {
      optimalInterval = 5000; // 5초
    }

    // 간격이 변경되었을 때만 재시작
    if (optimalInterval !== this.checkInterval) {
      console.log(
        `[NavigationService] Adjusting check interval: ${this.checkInterval}ms → ${optimalInterval}ms (distance: ${distance.toFixed(0)}m)`
      );

      this.checkInterval = optimalInterval;

      // 타이머 재시작 (다음 체크부터 새 간격 적용)
      if (this.intervalId && this.isActive) {
        clearInterval(this.intervalId);
        this.intervalId = setInterval(() => {
          this.checkAndNotify();
        }, this.checkInterval) as unknown as number;
      }
    }
  }

  /**
   * 체크 간격 변경
   */
  setCheckInterval(intervalMs: number): void {
    this.checkInterval = intervalMs;

    // 이미 실행 중이면 재시작
    if (this.isActive && this.intervalId && this.targetStop && this.getUserLocationCallback) {
      const targetStop = this.targetStop;
      const getUserLocation = this.getUserLocationCallback;
      const onDecisionUpdate = this.onDecisionUpdate;
      this.stop();
      this.start(targetStop, getUserLocation, onDecisionUpdate || undefined);
    }
  }

  /**
   * 현재 상태 확인
   */
  isRunning(): boolean {
    return this.isActive;
  }

  /**
   * 현재 목표 정류장
   */
  getTargetStop(): Stop | null {
    return this.targetStop;
  }
}

export default new NavigationService();
