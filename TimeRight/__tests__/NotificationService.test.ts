import NotificationService from '../src/services/NotificationService';
import * as Notifications from 'expo-notifications';
import type { Decision } from '../src/types';

describe('NotificationService', () => {
  const mockRunDecision: Decision = {
    action: 'RUN',
    message: 'Run now to catch bus 101!',
    busNumber: '101',
    arrivalTime: 180,
    distance: 150,
    estimatedWalkTime: 120,
  };

  const mockWaitDecision: Decision = {
    action: 'WAIT',
    message: 'Wait, you have time',
    busNumber: '102',
    arrivalTime: 600,
    distance: 200,
    estimatedWalkTime: 140,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initialize', () => {
    it('should initialize successfully with granted permissions', async () => {
      const mockPermission = {
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      };
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(
        mockPermission
      );

      const result = await NotificationService.initialize();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
      expect(Notifications.setNotificationHandler).toHaveBeenCalled();
      expect(NotificationService.hasPermission()).toBe(true);
    });

    it('should return false when permissions are denied', async () => {
      const mockPermission = {
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      };
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(
        mockPermission
      );

      const result = await NotificationService.initialize();

      expect(result).toBe(false);
      expect(NotificationService.hasPermission()).toBe(false);
    });

    it('should handle permission request error', async () => {
      (Notifications.requestPermissionsAsync as jest.Mock).mockRejectedValue(
        new Error('Permission error')
      );

      const result = await NotificationService.initialize();

      expect(result).toBe(false);
      expect(NotificationService.hasPermission()).toBe(false);
    });
  });

  describe('send', () => {
    beforeEach(async () => {
      // Initialize with granted permissions
      const mockPermission = {
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      };
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(
        mockPermission
      );
      await NotificationService.initialize();
    });

    it('should send RUN notification with correct content', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue(
        'notification-id'
      );

      await NotificationService.send(mockRunDecision);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '🏃 지금 뛰세요!',
          body: mockRunDecision.message,
          sound: true,
          priority: Notifications.AndroidImportance.MAX,
          data: mockRunDecision,
        },
        trigger: null,
      });
    });

    it('should send WALK notification with correct content', async () => {
      const walkDecision: Decision = {
        ...mockRunDecision,
        action: 'WALK',
        message: 'Start walking now',
      };

      await NotificationService.send(walkDecision);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '🚶 이제 출발하세요',
          body: walkDecision.message,
          sound: true,
          priority: Notifications.AndroidImportance.MAX,
          data: walkDecision,
        },
        trigger: null,
      });
    });

    it('should send WAIT notification with correct content', async () => {
      await NotificationService.send(mockWaitDecision);

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
        content: {
          title: '⏰ 대기',
          body: mockWaitDecision.message,
          sound: false,
          priority: Notifications.AndroidImportance.MAX,
          data: mockWaitDecision,
        },
        trigger: null,
      });
    });

    it('should not send notification if permission is not granted', async () => {
      // Reset permission
      const deniedPermission = {
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      };
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(
        deniedPermission
      );
      await NotificationService.initialize();

      await NotificationService.send(mockRunDecision);

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });

    it('should handle notification send error gracefully', async () => {
      (Notifications.scheduleNotificationAsync as jest.Mock).mockRejectedValue(
        new Error('Notification error')
      );

      // Should not crash
      await expect(NotificationService.send(mockRunDecision)).resolves.not.toThrow();
    });
  });

  describe('clear', () => {
    it('should clear all notifications', async () => {
      (Notifications.dismissAllNotificationsAsync as jest.Mock).mockResolvedValue(
        undefined
      );

      await NotificationService.clear();

      expect(Notifications.dismissAllNotificationsAsync).toHaveBeenCalled();
    });

    it('should handle clear error gracefully', async () => {
      (Notifications.dismissAllNotificationsAsync as jest.Mock).mockRejectedValue(
        new Error('Clear error')
      );

      // Should not crash
      await expect(NotificationService.clear()).resolves.not.toThrow();
    });
  });

  describe('hasPermission', () => {
    it('should return true after successful initialization', async () => {
      const mockPermission = {
        status: 'granted',
        granted: true,
        canAskAgain: true,
        expires: 'never',
      };
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(
        mockPermission
      );

      await NotificationService.initialize();

      expect(NotificationService.hasPermission()).toBe(true);
    });

    it('should return false after failed initialization', async () => {
      const mockPermission = {
        status: 'denied',
        granted: false,
        canAskAgain: false,
        expires: 'never',
      };
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue(
        mockPermission
      );

      await NotificationService.initialize();

      expect(NotificationService.hasPermission()).toBe(false);
    });

    it('should return false before initialization', () => {
      // Create a fresh instance (assuming singleton is reset)
      expect(NotificationService.hasPermission()).toBe(false);
    });
  });
});
