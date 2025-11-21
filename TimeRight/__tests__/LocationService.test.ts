import LocationService from '../src/services/LocationService';
import * as ExpoLocation from 'expo-location';
import BatteryOptimizer from '../src/services/BatteryOptimizer';

// Mock BatteryOptimizer
jest.mock('../src/services/BatteryOptimizer', () => ({
  initialize: jest.fn(() => Promise.resolve()),
  getOptimalAccuracy: jest.fn(() => 4), // ExpoLocation.Accuracy.High
  getOptimalTimeInterval: jest.fn(() => 5000),
  getOptimalDistanceInterval: jest.fn(() => 10),
  getBatteryLevel: jest.fn(() => 0.8),
  isCharging: jest.fn(() => false),
  isLowPowerMode: jest.fn(() => false),
  isBatterySufficient: jest.fn(() => true),
  getOptimizationSummary: jest.fn(() => ({
    batteryLevel: '80%',
    accuracy: 'High',
    timeInterval: 5000,
    distanceInterval: 10,
  })),
}));

describe('LocationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    LocationService.stopTracking();

    // Set up default mocks
    (ExpoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
      granted: true,
    });
    (ExpoLocation.requestBackgroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
      granted: true,
    });
  });

  describe('requestPermission', () => {
    it('should request location permission successfully', async () => {
      const result = await LocationService.requestPermission();

      expect(result).toBe(true);
      expect(ExpoLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
      expect(ExpoLocation.requestBackgroundPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when foreground permission is denied', async () => {
      (ExpoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await LocationService.requestPermission();

      expect(result).toBe(false);
    });

    it('should handle permission request error', async () => {
      (ExpoLocation.requestForegroundPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await LocationService.requestPermission();

      expect(result).toBe(false);
    });
  });

  describe('getCurrentLocation', () => {
    it('should get current location successfully', async () => {
      const mockPosition = {
        coords: {
          latitude: 37.5665,
          longitude: 126.978,
          accuracy: 10,
        },
        timestamp: Date.now(),
      };
      (ExpoLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValue(mockPosition);

      const result = await LocationService.getCurrentLocation();

      expect(result).toEqual({
        latitude: 37.5665,
        longitude: 126.978,
        accuracy: 10,
        timestamp: mockPosition.timestamp,
      });
    });

    it('should return null when location fetch fails', async () => {
      (ExpoLocation.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
        new Error('Location unavailable')
      );

      const result = await LocationService.getCurrentLocation();

      expect(result).toBeNull();
    });
  });

  describe('startTracking', () => {
    it('should start tracking with battery optimization enabled', async () => {
      const mockCallback = jest.fn();
      const mockWatchId = { remove: jest.fn() };
      (ExpoLocation.watchPositionAsync as jest.Mock).mockResolvedValue(mockWatchId);

      await LocationService.startTracking(mockCallback, true);

      expect(BatteryOptimizer.initialize).toHaveBeenCalled();
      expect(BatteryOptimizer.getOptimalAccuracy).toHaveBeenCalled();
      expect(BatteryOptimizer.getOptimalTimeInterval).toHaveBeenCalled();
      expect(BatteryOptimizer.getOptimalDistanceInterval).toHaveBeenCalled();
      expect(ExpoLocation.watchPositionAsync).toHaveBeenCalled();
    });

    it('should start tracking without battery optimization', async () => {
      const mockCallback = jest.fn();
      const mockWatchId = { remove: jest.fn() };
      (ExpoLocation.watchPositionAsync as jest.Mock).mockResolvedValue(mockWatchId);

      await LocationService.startTracking(mockCallback, false);

      expect(BatteryOptimizer.initialize).not.toHaveBeenCalled();
      expect(ExpoLocation.watchPositionAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          accuracy: ExpoLocation.Accuracy.High,
          distanceInterval: 10,
          timeInterval: 5000,
        }),
        expect.any(Function)
      );
    });

    it('should call callback when location updates', async () => {
      const mockCallback = jest.fn();
      let locationUpdateHandler: any;

      (ExpoLocation.watchPositionAsync as jest.Mock).mockImplementation(
        async (options, handler) => {
          locationUpdateHandler = handler;
          return { remove: jest.fn() };
        }
      );

      await LocationService.startTracking(mockCallback, false);

      const mockPosition = {
        coords: { latitude: 37.5665, longitude: 126.978, accuracy: 10, speed: 0 },
        timestamp: Date.now(),
      };
      locationUpdateHandler(mockPosition);

      expect(mockCallback).toHaveBeenCalledWith(
        expect.objectContaining({
          latitude: 37.5665,
          longitude: 126.978,
        })
      );
    });

    it('should throw error when permission is denied', async () => {
      (ExpoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const mockCallback = jest.fn();

      await expect(LocationService.startTracking(mockCallback)).rejects.toThrow(
        'Location permission denied'
      );
    });
  });

  describe('stopTracking', () => {
    it('should stop active tracking', async () => {
      const mockCallback = jest.fn();
      const mockRemove = jest.fn();
      const mockWatchId = { remove: mockRemove };
      (ExpoLocation.watchPositionAsync as jest.Mock).mockResolvedValue(mockWatchId);

      await LocationService.startTracking(mockCallback);
      LocationService.stopTracking();

      expect(mockRemove).toHaveBeenCalled();
    });

    it('should do nothing if tracking is not active', () => {
      expect(() => LocationService.stopTracking()).not.toThrow();
    });
  });

  describe('calculateDistance', () => {
    it('should calculate distance between two points', () => {
      const point1 = { latitude: 37.5665, longitude: 126.978 };
      const point2 = { latitude: 37.5675, longitude: 126.979 };

      const distance = LocationService.calculateDistance(point1, point2);

      expect(distance).toBeGreaterThan(0);
      expect(distance).toBeLessThan(200); // Should be ~100-150m
    });

    it('should return 0 for same points', () => {
      const point = { latitude: 37.5665, longitude: 126.978 };

      const distance = LocationService.calculateDistance(point, point);

      expect(distance).toBe(0);
    });
  });

  describe('Battery Optimization Status', () => {
    it('should return battery optimization status when enabled', async () => {
      const mockCallback = jest.fn();
      const mockWatchId = { remove: jest.fn() };
      (ExpoLocation.watchPositionAsync as jest.Mock).mockResolvedValue(mockWatchId);

      await LocationService.startTracking(mockCallback, true);

      const status = LocationService.getBatteryOptimizationStatus();

      expect(status.enabled).toBe(true);
      expect(status.batteryLevel).toBe('80%');
    });

    it('should return disabled status when battery optimization is off', async () => {
      const mockCallback = jest.fn();
      const mockWatchId = { remove: jest.fn() };
      (ExpoLocation.watchPositionAsync as jest.Mock).mockResolvedValue(mockWatchId);

      await LocationService.startTracking(mockCallback, false);

      const status = LocationService.getBatteryOptimizationStatus();

      expect(status.enabled).toBe(false);
    });
  });
});
