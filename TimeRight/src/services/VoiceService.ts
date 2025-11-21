import * as Speech from 'expo-speech';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const VOICE_ENABLED_KEY = 'timeright_voice_enabled';

/**
 * TTS 음성 안내 서비스
 * 자연스러운 한국어 음성으로 네비게이션 정보 제공
 */
class VoiceService {
  private isEnabled: boolean = true;
  private isSpeaking: boolean = false;

  constructor() {
    this.loadSettings();
  }

  /**
   * 설정 로드
   */
  private async loadSettings() {
    try {
      const enabled = await AsyncStorage.getItem(VOICE_ENABLED_KEY);
      this.isEnabled = enabled !== 'false'; // 기본값은 true
    } catch (error) {
      console.error('[VoiceService] Error loading settings:', error);
    }
  }

  /**
   * 음성 안내 활성화/비활성화
   */
  async setEnabled(enabled: boolean) {
    this.isEnabled = enabled;
    await AsyncStorage.setItem(VOICE_ENABLED_KEY, enabled.toString());
  }

  /**
   * 음성 안내 활성화 상태 확인
   */
  isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 현재 말하는 중인지 확인
   */
  isSpeakingNow(): boolean {
    return this.isSpeaking;
  }

  /**
   * 남은 시간 안내
   */
  async speakRemainingTime(minutes: number, seconds: number) {
    if (!this.isEnabled) return;

    let message = '목적지까지 ';

    if (minutes > 0) {
      message += `${minutes}분 `;
    }
    if (seconds > 0 || minutes === 0) {
      message += `${seconds}초 `;
    }
    message += '남았습니다';

    await this.speak(message);
  }

  /**
   * 긴급 알림 음성
   */
  async speakUrgentAlert(message: string) {
    if (!this.isEnabled) return;

    // 긴급 알림은 약간 빠른 속도로
    await this.speak(message, { rate: 1.1 });
  }

  /**
   * 경고 알림 음성
   */
  async speakWarningAlert(message: string) {
    if (!this.isEnabled) return;

    await this.speak(message);
  }

  /**
   * 일반 안내 음성
   */
  async speakInfo(message: string) {
    if (!this.isEnabled) return;

    await this.speak(message, { rate: 0.95 });
  }

  /**
   * TTS 실행 (자연스러운 한국어 설정)
   */
  private async speak(message: string, options: Partial<Speech.SpeechOptions> = {}) {
    try {
      // 현재 말하는 중이면 중지
      if (this.isSpeaking) {
        await Speech.stop();
      }

      this.isSpeaking = true;

      // 플랫폼별 최적 음성 설정
      const voiceOptions: Speech.SpeechOptions = {
        language: 'ko-KR',
        pitch: 1.0,
        rate: 1.0,
        ...options,
        onDone: () => {
          this.isSpeaking = false;
        },
        onStopped: () => {
          this.isSpeaking = false;
        },
        onError: (error) => {
          console.error('[VoiceService] TTS error:', error);
          this.isSpeaking = false;
        },
      };

      // Android: 더 자연스러운 음성을 위한 설정
      if (Platform.OS === 'android') {
        // Android는 Google TTS 엔진 사용 권장
        voiceOptions.rate = voiceOptions.rate! * 0.95; // 약간 느리게
      }

      // iOS: Siri 음성 사용
      if (Platform.OS === 'ios') {
        // iOS 13+ 에서 더 자연스러운 음성 제공
        // voice 파라미터로 특정 음성 선택 가능 (com.apple.ttsbundle.Yuna-compact)
      }

      console.log('[VoiceService] Speaking:', message);
      await Speech.speak(message, voiceOptions);
    } catch (error) {
      console.error('[VoiceService] Error speaking:', error);
      this.isSpeaking = false;
    }
  }

  /**
   * 음성 중지
   */
  async stop() {
    try {
      await Speech.stop();
      this.isSpeaking = false;
    } catch (error) {
      console.error('[VoiceService] Error stopping:', error);
    }
  }

  /**
   * 사용 가능한 음성 목록 가져오기 (디버깅용)
   */
  async getAvailableVoices() {
    try {
      const voices = await Speech.getAvailableVoicesAsync();
      const koreanVoices = voices.filter((v) => v.language.startsWith('ko'));
      console.log('[VoiceService] Available Korean voices:', koreanVoices);
      return koreanVoices;
    } catch (error) {
      console.error('[VoiceService] Error getting voices:', error);
      return [];
    }
  }
}

export default new VoiceService();
