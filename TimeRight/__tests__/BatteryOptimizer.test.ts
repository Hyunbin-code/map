import BatteryOptimizer from '../src/services/BatteryOptimizer';
import * as Battery from 'expo-battery';
import * as ExpoLocation from 'expo-location';

describe('BatteryOptimizer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize battery monitoring', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.75);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);

      await BatteryOptimizer.initialize();

      expect(Battery.getBatteryLevelAsync).toHaveBeenCalled();
      expect(Battery.getBatteryStateAsync).toHaveBeenCalled();
      expect(Battery.isLowPowerModeEnabledAsync).toHaveBeenCalled();
      expect(Battery.addBatteryLevelListener).toHaveBeenCalled();
      expect(Battery.addBatteryStateListener).toHaveBeenCalled();
      expect(Battery.addLowPowerModeListener).toHaveBeenCalled();
    });

    it('should handle initialization errors gracefully', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockRejectedValue(
        new Error('Battery API error')
      );

      await expect(BatteryOptimizer.initialize()).resolves.not.toThrow();
    });
  });

  describe('getOptimalAccuracy', () => {
    beforeEach(async () => {
      await BatteryOptimizer.initialize();
    });

    it('should return HIGH accuracy when charging', async () => {
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.CHARGING
      );
      await BatteryOptimizer.initialize();

      const accuracy = BatteryOptimizer.getOptimalAccuracy();

      expect(accuracy).toBe(ExpoLocation.Accuracy.High);
    });

    it('should return LOW accuracy in low power mode', async () => {
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(true);
      await BatteryOptimizer.initialize();

      const accuracy = BatteryOptimizer.getOptimalAccuracy();

      expect(accuracy).toBe(ExpoLocation.Accuracy.Low);
    });

    it('should return HIGH accuracy when battery > 50%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.8);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const accuracy = BatteryOptimizer.getOptimalAccuracy();

      expect(accuracy).toBe(ExpoLocation.Accuracy.High);
    });

    it('should return BALANCED accuracy when battery 20-50%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.35);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const accuracy = BatteryOptimizer.getOptimalAccuracy();

      expect(accuracy).toBe(ExpoLocation.Accuracy.Balanced);
    });

    it('should return LOW accuracy when battery < 20%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.15);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const accuracy = BatteryOptimizer.getOptimalAccuracy();

      expect(accuracy).toBe(ExpoLocation.Accuracy.Low);
    });
  });

  describe('getOptimalTimeInterval', () => {
    it('should return 5s when charging', async () => {
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.CHARGING
      );
      await BatteryOptimizer.initialize();

      const interval = BatteryOptimizer.getOptimalTimeInterval();

      expect(interval).toBe(5000);
    });

    it('should return 30s in low power mode', async () => {
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(true);
      await BatteryOptimizer.initialize();

      const interval = BatteryOptimizer.getOptimalTimeInterval();

      expect(interval).toBe(30000);
    });

    it('should return 5s when battery > 50%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.7);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const interval = BatteryOptimizer.getOptimalTimeInterval();

      expect(interval).toBe(5000);
    });

    it('should return 10s when battery 20-50%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.3);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const interval = BatteryOptimizer.getOptimalTimeInterval();

      expect(interval).toBe(10000);
    });

    it('should return 20s when battery < 20%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.1);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const interval = BatteryOptimizer.getOptimalTimeInterval();

      expect(interval).toBe(20000);
    });
  });

  describe('getOptimalDistanceInterval', () => {
    it('should return 10m when charging', async () => {
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.CHARGING
      );
      await BatteryOptimizer.initialize();

      const distance = BatteryOptimizer.getOptimalDistanceInterval();

      expect(distance).toBe(10);
    });

    it('should return 100m in low power mode', async () => {
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(true);
      await BatteryOptimizer.initialize();

      const distance = BatteryOptimizer.getOptimalDistanceInterval();

      expect(distance).toBe(100);
    });

    it('should return 30m when battery 20-50%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.4);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const distance = BatteryOptimizer.getOptimalDistanceInterval();

      expect(distance).toBe(30);
    });

    it('should return 50m when battery < 20%', async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.15);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();

      const distance = BatteryOptimizer.getOptimalDistanceInterval();

      expect(distance).toBe(50);
    });
  });

  describe('Battery Status Getters', () => {
    beforeEach(async () => {
      (Battery.getBatteryLevelAsync as jest.Mock).mockResolvedValue(0.6);
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.UNPLUGGED
      );
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(false);
      await BatteryOptimizer.initialize();
    });

    it('should get battery level', () => {
      const level = BatteryOptimizer.getBatteryLevel();

      expect(level).toBe(0.6);
    });

    it('should check if charging', async () => {
      (Battery.getBatteryStateAsync as jest.Mock).mockResolvedValue(
        Battery.BatteryState.CHARGING
      );
      await BatteryOptimizer.initialize();

      const charging = BatteryOptimizer.isCharging();

      expect(charging).toBe(true);
    });

    it('should check if not charging', () => {
      const charging = BatteryOptimizer.isCharging();

      expect(charging).toBe(false);
    });

    it('should check low power mode', async () => {
      (Battery.isLowPowerModeEnabledAsync as jest.Mock).mockResolvedValue(true);
      await BatteryOptimizer.initialize();

      const lowPowerMode = BatteryOptimizer.isLowPowerMode();

      expect(lowPowerMode).toBe(true);
    });
  });
});
