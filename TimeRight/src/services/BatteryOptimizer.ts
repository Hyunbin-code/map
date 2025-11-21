import * as Battery from 'expo-battery';
import * as ExpoLocation from 'expo-location';

/**
 * 배터리 최적화 서비스
 * 배터리 레벨에 따라 GPS 정확도와 업데이트 간격을 자동 조정
 */
class BatteryOptimizer {
  private batteryLevel: number = 1.0; // 0.0 ~ 1.0
  private isLowPowerMode: boolean = false;
  private batteryState: Battery.BatteryState = Battery.BatteryState.UNKNOWN;

  /**
   * 초기화 및 배터리 상태 감지 시작
   */
  async initialize(): Promise<void> {
    try {
      // 현재 배터리 레벨
      this.batteryLevel = await Battery.getBatteryLevelAsync();

      // 배터리 상태 (충전 중인지 등)
      this.batteryState = await Battery.getBatteryStateAsync();

      // 저전력 모드 감지
      this.isLowPowerMode = await Battery.isLowPowerModeEnabledAsync();

      console.log('[BatteryOptimizer] Initialized:', {
        level: (this.batteryLevel * 100).toFixed(0) + '%',
        state: this.getBatteryStateString(),
        lowPowerMode: this.isLowPowerMode,
      });

      // 배터리 레벨 변경 이벤트 구독
      Battery.addBatteryLevelListener(({ batteryLevel }) => {
        this.batteryLevel = batteryLevel;
        console.log(
          '[BatteryOptimizer] Battery level changed:',
          (batteryLevel * 100).toFixed(0) + '%'
        );
      });

      // 배터리 상태 변경 이벤트 구독
      Battery.addBatteryStateListener(({ batteryState }) => {
        this.batteryState = batteryState;
        console.log('[BatteryOptimizer] Battery state changed:', this.getBatteryStateString());
      });

      // 저전력 모드 변경 이벤트 구독
      Battery.addLowPowerModeListener(({ lowPowerMode }) => {
        this.isLowPowerMode = lowPowerMode;
        console.log('[BatteryOptimizer] Low power mode changed:', lowPowerMode);
      });
    } catch (error) {
      console.error('[BatteryOptimizer] Initialization error:', error);
    }
  }

  /**
   * 최적의 GPS 정확도 반환
   */
  getOptimalAccuracy(): ExpoLocation.Accuracy {
    // 충전 중이면 항상 HIGH
    if (
      this.batteryState === Battery.BatteryState.CHARGING ||
      this.batteryState === Battery.BatteryState.FULL
    ) {
      return ExpoLocation.Accuracy.High;
    }

    // 저전력 모드면 LOW
    if (this.isLowPowerMode) {
      return ExpoLocation.Accuracy.Low;
    }

    // 배터리 레벨에 따라
    if (this.batteryLevel > 0.5) {
      return ExpoLocation.Accuracy.High;
    } else if (this.batteryLevel > 0.2) {
      return ExpoLocation.Accuracy.Balanced;
    } else {
      return ExpoLocation.Accuracy.Low;
    }
  }

  /**
   * 최적의 GPS 업데이트 간격 (ms)
   */
  getOptimalTimeInterval(): number {
    // 충전 중이면 빠르게
    if (
      this.batteryState === Battery.BatteryState.CHARGING ||
      this.batteryState === Battery.BatteryState.FULL
    ) {
      return 3000; // 3초
    }

    // 저전력 모드면 느리게
    if (this.isLowPowerMode) {
      return 15000; // 15초
    }

    // 배터리 레벨에 따라
    if (this.batteryLevel > 0.5) {
      return 5000; // 5초
    } else if (this.batteryLevel > 0.2) {
      return 8000; // 8초
    } else {
      return 12000; // 12초
    }
  }

  /**
   * 최적의 거리 간격 (m)
   */
  getOptimalDistanceInterval(): number {
    // 충전 중이면 정밀하게
    if (
      this.batteryState === Battery.BatteryState.CHARGING ||
      this.batteryState === Battery.BatteryState.FULL
    ) {
      return 5; // 5m
    }

    // 저전력 모드면 덜 정밀하게
    if (this.isLowPowerMode) {
      return 20; // 20m
    }

    // 배터리 레벨에 따라
    if (this.batteryLevel > 0.5) {
      return 10; // 10m
    } else if (this.batteryLevel > 0.2) {
      return 15; // 15m
    } else {
      return 20; // 20m
    }
  }

  /**
   * 현재 배터리 레벨 (0.0 ~ 1.0)
   */
  getBatteryLevel(): number {
    return this.batteryLevel;
  }

  /**
   * 현재 배터리 레벨 (퍼센트)
   */
  getBatteryLevelPercent(): number {
    return Math.round(this.batteryLevel * 100);
  }

  /**
   * 저전력 모드 여부
   */
  isInLowPowerMode(): boolean {
    return this.isLowPowerMode;
  }

  /**
   * 충전 중인지 여부
   */
  isCharging(): boolean {
    return this.batteryState === Battery.BatteryState.CHARGING;
  }

  /**
   * 배터리가 충분한지 (네비게이션 사용 가능)
   */
  isBatterySufficient(): boolean {
    return this.batteryLevel > 0.1 || this.isCharging();
  }

  /**
   * 배터리 상태 문자열
   */
  private getBatteryStateString(): string {
    switch (this.batteryState) {
      case Battery.BatteryState.CHARGING:
        return 'Charging';
      case Battery.BatteryState.FULL:
        return 'Full';
      case Battery.BatteryState.UNPLUGGED:
        return 'Unplugged';
      case Battery.BatteryState.UNKNOWN:
      default:
        return 'Unknown';
    }
  }

  /**
   * 최적화 설정 요약
   */
  getOptimizationSummary(): {
    accuracy: string;
    timeInterval: number;
    distanceInterval: number;
    batteryLevel: string;
    charging: boolean;
    lowPowerMode: boolean;
  } {
    const accuracy = this.getOptimalAccuracy();
    let accuracyString = 'Unknown';

    switch (accuracy) {
      case ExpoLocation.Accuracy.Lowest:
        accuracyString = 'Lowest';
        break;
      case ExpoLocation.Accuracy.Low:
        accuracyString = 'Low';
        break;
      case ExpoLocation.Accuracy.Balanced:
        accuracyString = 'Balanced';
        break;
      case ExpoLocation.Accuracy.High:
        accuracyString = 'High';
        break;
      case ExpoLocation.Accuracy.Highest:
        accuracyString = 'Highest';
        break;
      case ExpoLocation.Accuracy.BestForNavigation:
        accuracyString = 'BestForNavigation';
        break;
    }

    return {
      accuracy: accuracyString,
      timeInterval: this.getOptimalTimeInterval(),
      distanceInterval: this.getOptimalDistanceInterval(),
      batteryLevel: this.getBatteryLevelPercent() + '%',
      charging: this.isCharging(),
      lowPowerMode: this.isLowPowerMode,
    };
  }
}

export default new BatteryOptimizer();
