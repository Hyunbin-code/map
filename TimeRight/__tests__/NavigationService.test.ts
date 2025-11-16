import NavigationService from '../src/services/NavigationService';
import BusAPIService from '../src/services/BusAPIService';
import DecisionEngine from '../src/services/DecisionEngine';
import NotificationService from '../src/services/NotificationService';
import type { Stop, Location, BusArrival, Decision } from '../src/types';

// Mock services
jest.mock('../src/services/BusAPIService');
jest.mock('../src/services/DecisionEngine');
jest.mock('../src/services/NotificationService');

describe('NavigationService', () => {
  const mockStop: Stop = {
    id: 'stop1',
    name: 'Test Stop',
    latitude: 37.5665,
    longitude: 126.978,
    busLines: ['101', '102'],
  };

  const mockUserLocation: Location = {
    latitude: 37.56,
    longitude: 126.97,
  };

  const mockBusArrivals: BusArrival[] = [
    {
      busNumber: '101',
      arrivalTime: 300,
      stationSeq: 5,
      predictTime1: 300,
    },
  ];

  const mockDecision: Decision = {
    action: 'RUN',
    message: 'Run now!',
    busNumber: '101',
    arrivalTime: 300,
    distance: 150,
    estimatedWalkTime: 90,
  };

  let getUserLocationCallback: () => Location | null;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    NavigationService.stop();
    getUserLocationCallback = jest.fn(() => mockUserLocation);

    // Setup default mocks
    (BusAPIService.getArrivalInfo as jest.Mock).mockResolvedValue(mockBusArrivals);
    (DecisionEngine.makeDecision as jest.Mock).mockReturnValue(mockDecision);
    (NotificationService.send as jest.Mock).mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('start', () => {
    it('should start navigation monitoring', async () => {
      const onDecisionUpdate = jest.fn();

      await NavigationService.start(mockStop, getUserLocationCallback, onDecisionUpdate);

      expect(getUserLocationCallback).toHaveBeenCalled();
      expect(BusAPIService.getArrivalInfo).toHaveBeenCalledWith(mockStop.id);
      expect(DecisionEngine.makeDecision).toHaveBeenCalled();
      expect(onDecisionUpdate).toHaveBeenCalledWith(mockDecision);
    });

    it('should handle missing user location', async () => {
      getUserLocationCallback = jest.fn(() => null);
      const onDecisionUpdate = jest.fn();

      await NavigationService.start(mockStop, getUserLocationCallback, onDecisionUpdate);

      expect(BusAPIService.getArrivalInfo).not.toHaveBeenCalled();
      expect(DecisionEngine.makeDecision).not.toHaveBeenCalled();
      expect(onDecisionUpdate).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully', async () => {
      (BusAPIService.getArrivalInfo as jest.Mock).mockRejectedValue(
        new Error('API error')
      );
      const onDecisionUpdate = jest.fn();

      await NavigationService.start(mockStop, getUserLocationCallback, onDecisionUpdate);

      // Should not crash
      expect(onDecisionUpdate).not.toHaveBeenCalled();
    });

    it('should send notification when action is RUN', async () => {
      const runDecision: Decision = {
        ...mockDecision,
        action: 'RUN',
      };
      (DecisionEngine.makeDecision as jest.Mock).mockReturnValue(runDecision);

      await NavigationService.start(mockStop, getUserLocationCallback);

      expect(NotificationService.send).toHaveBeenCalledWith(runDecision);
    });

    it('should not send notification when action is WAIT', async () => {
      const waitDecision: Decision = {
        ...mockDecision,
        action: 'WAIT',
      };
      (DecisionEngine.makeDecision as jest.Mock).mockReturnValue(waitDecision);

      await NavigationService.start(mockStop, getUserLocationCallback);

      expect(NotificationService.send).not.toHaveBeenCalled();
    });
  });

  describe('Adaptive Interval Adjustment', () => {
    it('should use 30s interval when distance > 1km', async () => {
      const farUserLocation: Location = {
        latitude: 37.55, // ~1.5km away
        longitude: 126.96,
      };
      const farGetUserLocation = jest.fn(() => farUserLocation);

      await NavigationService.start(mockStop, farGetUserLocation);

      // Fast-forward and check interval
      jest.advanceTimersByTime(30000);
      await Promise.resolve();

      expect(BusAPIService.getArrivalInfo).toHaveBeenCalledTimes(2); // Initial + 30s
    });

    it('should use 15s interval when distance between 500m-1km', async () => {
      const mediumUserLocation: Location = {
        latitude: 37.562, // ~600m away
        longitude: 126.974,
      };
      const mediumGetUserLocation = jest.fn(() => mediumUserLocation);

      await NavigationService.start(mockStop, mediumGetUserLocation);

      jest.advanceTimersByTime(15000);
      await Promise.resolve();

      expect(BusAPIService.getArrivalInfo).toHaveBeenCalledTimes(2); // Initial + 15s
    });

    it('should use 5s interval when distance < 200m', async () => {
      const closeUserLocation: Location = {
        latitude: 37.5663, // ~150m away
        longitude: 126.9778,
      };
      const closeGetUserLocation = jest.fn(() => closeUserLocation);

      await NavigationService.start(mockStop, closeGetUserLocation);

      jest.advanceTimersByTime(5000);
      await Promise.resolve();

      expect(BusAPIService.getArrivalInfo).toHaveBeenCalledTimes(2); // Initial + 5s
    });
  });

  describe('stop', () => {
    it('should stop active navigation', async () => {
      await NavigationService.start(mockStop, getUserLocationCallback);

      NavigationService.stop();

      // Fast-forward timers
      jest.advanceTimersByTime(10000);
      await Promise.resolve();

      // Should only have initial call, no more periodic calls
      expect(BusAPIService.getArrivalInfo).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if navigation is not active', () => {
      // Should not crash
      expect(() => NavigationService.stop()).not.toThrow();
    });
  });

  describe('isActive', () => {
    it('should return true when navigation is active', async () => {
      await NavigationService.start(mockStop, getUserLocationCallback);

      expect(NavigationService.isActive()).toBe(true);
    });

    it('should return false when navigation is stopped', () => {
      expect(NavigationService.isActive()).toBe(false);
    });

    it('should return false after stop() is called', async () => {
      await NavigationService.start(mockStop, getUserLocationCallback);
      NavigationService.stop();

      expect(NavigationService.isActive()).toBe(false);
    });
  });

  describe('getCurrentTarget', () => {
    it('should return current target stop', async () => {
      await NavigationService.start(mockStop, getUserLocationCallback);

      expect(NavigationService.getCurrentTarget()).toEqual(mockStop);
    });

    it('should return null when not active', () => {
      expect(NavigationService.getCurrentTarget()).toBeNull();
    });
  });
});
