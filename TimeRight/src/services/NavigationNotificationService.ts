import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * 네비게이션 알림 서비스
 * 잠금화면에서도 보이는 persistent notification 제공
 * (음악 플레이어, 지도 앱처럼)
 */

// 알림 동작 설정
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export interface NavigationState {
  distance: number;
  timeRemaining: number;
  nextAction: string;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH';
}

class NavigationNotificationService {
  private notificationId: string | null = null;
  private isActive: boolean = false;

  /**
   * 알림 권한 요청
   */
  async requestPermissions(): Promise<boolean> {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[NavigationNotification] Permission not granted');
        return false;
      }

      // Android: Notification Channel 설정
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('navigation', {
          name: '실시간 네비게이션',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0],
          sound: null,
          lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
          bypassDnd: false,
        });
      }

      return true;
    } catch (error) {
      console.error('[NavigationNotification] Error requesting permissions:', error);
      return false;
    }
  }

  /**
   * 네비게이션 알림 시작
   */
  async startNavigation(destination: string): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) {
      console.warn('[NavigationNotification] Cannot start - no permission');
      return;
    }

    this.isActive = true;

    // 초기 알림 표시
    await this.updateNavigation({
      distance: 0,
      timeRemaining: 0,
      nextAction: `${destination}까지 안내 중`,
      urgency: 'LOW',
    });

    console.log('[NavigationNotification] Started navigation');
  }

  /**
   * 네비게이션 상태 업데이트
   */
  async updateNavigation(state: NavigationState): Promise<void> {
    if (!this.isActive) return;

    try {
      const { distance, timeRemaining, nextAction, urgency } = state;

      // 거리 포맷
      const distanceText =
        distance < 1000
          ? `${Math.round(distance)}m`
          : `${(distance / 1000).toFixed(1)}km`;

      // 시간 포맷
      const minutes = Math.floor(timeRemaining / 60);
      const seconds = Math.round(timeRemaining % 60);
      const timeText =
        minutes > 0 ? `${minutes}분 ${seconds}초` : `${seconds}초`;

      // 긴급도별 아이콘
      const icon = urgency === 'HIGH' ? '🏃' : urgency === 'MEDIUM' ? '🚶‍♂️' : '🧭';

      // 알림 업데이트 (또는 새로 생성)
      const notificationContent: Notifications.NotificationContentInput = {
        title: `${icon} ${nextAction}`,
        body: `남은 거리: ${distanceText} · 예상 시간: ${timeText}`,
        sound: null,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        sticky: true, // Android: 스와이프로 삭제 불가
        autoDismiss: false, // Android: 자동 사라지지 않음
        data: {
          type: 'navigation',
          distance,
          timeRemaining,
          urgency,
        },
      };

      if (Platform.OS === 'android') {
        notificationContent.channelId = 'navigation';
      }

      // 기존 알림이 있으면 업데이트, 없으면 생성
      if (this.notificationId) {
        await Notifications.dismissNotificationAsync(this.notificationId);
      }

      const identifier = await Notifications.scheduleNotificationAsync({
        content: notificationContent,
        trigger: null, // 즉시 표시
      });

      this.notificationId = identifier;

      console.log('[NavigationNotification] Updated:', { distance, timeRemaining, urgency });
    } catch (error) {
      console.error('[NavigationNotification] Error updating notification:', error);
    }
  }

  /**
   * 네비게이션 종료
   */
  async stopNavigation(): Promise<void> {
    if (this.notificationId) {
      await Notifications.dismissNotificationAsync(this.notificationId);
      this.notificationId = null;
    }

    this.isActive = false;
    console.log('[NavigationNotification] Stopped navigation');
  }

  /**
   * 긴급 알림 (진동 포함)
   */
  async sendUrgentAlert(message: string): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 긴급 알림',
          body: message,
          sound: 'default',
          vibrate: [0, 250, 250, 250], // 진동 패턴
          priority: Notifications.AndroidNotificationPriority.MAX,
          data: {
            type: 'urgent_alert',
          },
        },
        trigger: null,
      });

      console.log('[NavigationNotification] Sent urgent alert:', message);
    } catch (error) {
      console.error('[NavigationNotification] Error sending urgent alert:', error);
    }
  }

  /**
   * 현재 활성 상태 확인
   */
  isNavigationActive(): boolean {
    return this.isActive;
  }
}

export default new NavigationNotificationService();
