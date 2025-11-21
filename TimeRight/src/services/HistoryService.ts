import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SearchHistory {
  from: string;
  to: string;
  timestamp: number;
  timeFormatted: string;
}

const HISTORY_KEY = 'timeright_search_history';
const MAX_HISTORY = 10; // 최대 10개 저장

/**
 * 검색 히스토리 관리 서비스
 */
class HistoryService {
  /**
   * 검색 히스토리 저장
   */
  async addHistory(from: string, to: string): Promise<void> {
    try {
      const history = await this.getHistory();

      // 중복 제거 (같은 출발지-도착지)
      const filtered = history.filter(
        (item) => !(item.from === from && item.to === to)
      );

      // 새 항목 추가 (맨 앞에)
      const newItem: SearchHistory = {
        from,
        to,
        timestamp: Date.now(),
        timeFormatted: this.formatTime(Date.now()),
      };

      const updated = [newItem, ...filtered].slice(0, MAX_HISTORY);

      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      console.log('[HistoryService] Added history:', newItem);
    } catch (error) {
      console.error('[HistoryService] Error adding history:', error);
    }
  }

  /**
   * 검색 히스토리 가져오기
   */
  async getHistory(): Promise<SearchHistory[]> {
    try {
      const data = await AsyncStorage.getItem(HISTORY_KEY);
      if (!data) return [];

      const history: SearchHistory[] = JSON.parse(data);

      // 시간 포맷 업데이트 (상대 시간)
      return history.map((item) => ({
        ...item,
        timeFormatted: this.formatTime(item.timestamp),
      }));
    } catch (error) {
      console.error('[HistoryService] Error getting history:', error);
      return [];
    }
  }

  /**
   * 히스토리 항목 삭제
   */
  async removeHistory(from: string, to: string): Promise<void> {
    try {
      const history = await this.getHistory();
      const filtered = history.filter(
        (item) => !(item.from === from && item.to === to)
      );
      await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
      console.log('[HistoryService] Removed history:', from, '→', to);
    } catch (error) {
      console.error('[HistoryService] Error removing history:', error);
    }
  }

  /**
   * 모든 히스토리 삭제
   */
  async clearHistory(): Promise<void> {
    try {
      await AsyncStorage.removeItem(HISTORY_KEY);
      console.log('[HistoryService] Cleared all history');
    } catch (error) {
      console.error('[HistoryService] Error clearing history:', error);
    }
  }

  /**
   * 타임스탬프를 상대 시간으로 포맷
   */
  private formatTime(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;

    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '방금 전';
    if (minutes < 60) return `${minutes}분 전`;
    if (hours < 24) return `${hours}시간 전`;
    if (days === 1) return '어제';
    if (days < 7) return `${days}일 전`;

    // 1주일 이상은 날짜 표시
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}월 ${date.getDate()}일`;
  }
}

export default new HistoryService();
