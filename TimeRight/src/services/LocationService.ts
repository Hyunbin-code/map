import * as ExpoLocation from 'expo-location';
import { Location, GPSMode } from '../types';

class LocationService {
  private watchId: ExpoLocation.LocationSubscription | null = null;
  private currentLocation: Location | null = null;
  private currentMode: GPSMode = GPSMode.STOPPED;

  /**
   * 위치 권한 요청
   */
  async requestPermission(): Promise<boolean> {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Location permission not granted');
        return false;
      }

      // 백그라운드 권한도 요청
      const bgStatus = await ExpoLocation.requestBackgroundPermissionsAsync();
      if (bgStatus.status !== 'granted') {
        console.warn('Background location permission not granted');
      }

      return true;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      return false;
    }
  }

  /**
   * 현재 위치 한 번 가져오기
   */
  async getCurrentLocation(): Promise<Location | null> {
    try {
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.High,
      });

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        accuracy: location.coords.accuracy || undefined,
        timestamp: location.timestamp,
      };
    } catch (error) {
      console.error('Error getting current location:', error);
      return null;
    }
  }

  /**
   * GPS 추적 시작
   */
  async startTracking(callback: (location: Location) => void): Promise<void> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error('Location permission denied');
      }

      this.watchId = await ExpoLocation.watchPositionAsync(
        {
          accuracy: ExpoLocation.Accuracy.High,
          distanceInterval: 10, // 10m 이동마다 업데이트
          timeInterval: 5000, // 5초마다 체크
        },
        (position) => {
          const location: Location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy || undefined,
            timestamp: position.timestamp,
          };

          this.currentLocation = location;

          // 속도 기반 모드 자동 전환
          const speed = position.coords.speed || 0;
          this.adjustModeBySpeed(speed);

          callback(location);
        }
      );

      console.log('GPS tracking started');
    } catch (error) {
      console.error('Error starting tracking:', error);
      throw error;
    }
  }

  /**
   * GPS 추적 중지
   */
  stopTracking(): void {
    if (this.watchId) {
      this.watchId.remove();
      this.watchId = null;
      this.currentMode = GPSMode.STOPPED;
      console.log('GPS tracking stopped');
    }
  }

  /**
   * 속도 기반 모드 자동 전환
   */
  private adjustModeBySpeed(speed: number): void {
    // m/s를 km/h로 변환
    const speedKmh = speed * 3.6;

    let newMode: GPSMode;

    if (speedKmh < 1) {
      newMode = GPSMode.STOPPED;
    } else if (speedKmh < 5) {
      newMode = GPSMode.WALKING;
    } else if (speedKmh < 10) {
      newMode = GPSMode.RUNNING;
    } else {
      newMode = GPSMode.IN_TRANSIT;
    }

    if (newMode !== this.currentMode) {
      this.currentMode = newMode;
      console.log('GPS mode changed to:', GPSMode[newMode]);
    }
  }

  /**
   * 현재 저장된 위치 반환
   */
  getLastKnownLocation(): Location | null {
    return this.currentLocation;
  }

  /**
   * 현재 GPS 모드 반환
   */
  getCurrentMode(): GPSMode {
    return this.currentMode;
  }

  /**
   * 두 지점 간 거리 계산 (Haversine formula)
   */
  calculateDistance(point1: Location, point2: Location): number {
    const R = 6371e3; // 지구 반지름 (m)
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.latitude * Math.PI) / 180;
    const Δφ = ((point2.latitude - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.longitude - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터 단위
  }
}

export default new LocationService();
