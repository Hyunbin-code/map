import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { Decision } from '../types';

// 알림 핸들러 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

class NotificationService {
  private lastNotification: (Decision & { timestamp: number }) | null = null;
  private notificationChannel: string = 'timeright-channel';
  private isPermissionGranted: boolean = false;

  /**
   * 알림 서비스 초기화 및 권한 요청
   * @returns 권한이 부여되었는지 여부
   */
  async initialize(): Promise<boolean> {
    try {
      // 권한 요청
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[NotificationService] Permission not granted');
        this.isPermissionGranted = false;
        return false;
      }

      this.isPermissionGranted = true;

      // Android 채널 설정
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(this.notificationChannel, {
          name: 'TimeRight Notifications',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#4A90E2',
          sound: 'default',
          enableVibrate: true,
        });
      }

      console.log('[NotificationService] Initialized successfully');
      return true;
    } catch (error) {
      console.error('[NotificationService] Initialization error:', error);
      this.isPermissionGranted = false;
      return false;
    }
  }

  /**
   * 알림 권한 여부 확인
   */
  hasPermission(): boolean {
    return this.isPermissionGranted;
  }

  async send(decision: Decision): Promise<void> {
    try {
      // 권한 확인
      if (!this.isPermissionGranted) {
        console.warn('[NotificationService] Permission not granted, skipping notification');
        return;
      }

      // 중복 방지
      if (this.isDuplicate(decision)) {
        console.log('[NotificationService] Duplicate notification prevented');
        return;
      }

      // 알림 전송
      await Notifications.scheduleNotificationAsync({
        content: {
          title: this.getTitle(decision),
          body: decision.detail || decision.message,
          sound: decision.vibrate ? 'default' : undefined,
          priority: decision.urgency === 'HIGH'
            ? Notifications.AndroidNotificationPriority.MAX
            : Notifications.AndroidNotificationPriority.DEFAULT,
          color: decision.color,
          vibrate: decision.vibrate ? [0, 250, 250, 250] : undefined,
        },
        trigger: null, // 즉시 전송
      });

      // 마지막 알림 기록
      this.lastNotification = {
        ...decision,
        timestamp: Date.now(),
      };

      console.log('[NotificationService] Sent:', decision.action);
    } catch (error) {
      console.error('[NotificationService] Send error:', error);
    }
  }

  private getTitle(decision: Decision): string {
    switch (decision.action) {
      case 'RUN':
        return '🏃 지금 뛰어야 해요!';
      case 'WALK_FAST':
        return '🚶 조금 서두르세요';
      case 'WALK_NORMAL':
        return '✅ 여유있게 가세요';
      case 'MISSED':
        return '😢 버스를 놓쳤어요';
      case 'WAIT_NEXT':
        return '⏳ 다음 버스를 기다리세요';
      default:
        return 'TimeRight 알림';
    }
  }

  private isDuplicate(decision: Decision): boolean {
    if (!this.lastNotification) {
      return false;
    }

    const timeSince = Date.now() - this.lastNotification.timestamp;
    const isSameMessage = this.lastNotification.message === decision.message;
    const isSameAction = this.lastNotification.action === decision.action;

    // 같은 메시지/액션이 30초 이내에 다시 오면 중복
    return (isSameMessage || isSameAction) && timeSince < 30000;
  }

  async cancelAll(): Promise<void> {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('[NotificationService] All notifications cancelled');
    } catch (error) {
      console.error('[NotificationService] Cancel error:', error);
    }
  }

  reset(): void {
    this.lastNotification = null;
  }
}

export default new NotificationService();
