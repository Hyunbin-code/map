import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Favorite {
  id: string;
  name: string; // "집", "회사", "학교" 등
  address: string;
  latitude: number;
  longitude: number;
  icon: string;
  createdAt: number;
}

const FAVORITES_KEY = 'timeright_favorites';
const MAX_FAVORITES = 20; // 최대 20개 저장

/**
 * 즐겨찾기 관리 서비스
 */
class FavoritesService {
  /**
   * 즐겨찾기 추가
   */
  async addFavorite(favorite: Omit<Favorite, 'id' | 'createdAt'>): Promise<void> {
    try {
      const favorites = await this.getFavorites();

      // 중복 확인 (같은 좌표)
      const exists = favorites.find(
        (f) =>
          Math.abs(f.latitude - favorite.latitude) < 0.0001 &&
          Math.abs(f.longitude - favorite.longitude) < 0.0001
      );

      if (exists) {
        console.warn('[FavoritesService] Favorite already exists');
        return;
      }

      // 최대 개수 확인
      if (favorites.length >= MAX_FAVORITES) {
        throw new Error('즐겨찾기는 최대 20개까지 추가할 수 있습니다.');
      }

      // 새 항목 추가
      const newFavorite: Favorite = {
        ...favorite,
        id: `fav_${Date.now()}`,
        createdAt: Date.now(),
      };

      const updated = [...favorites, newFavorite];
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      console.log('[FavoritesService] Added favorite:', newFavorite);
    } catch (error) {
      console.error('[FavoritesService] Error adding favorite:', error);
      throw error;
    }
  }

  /**
   * 즐겨찾기 목록 가져오기
   */
  async getFavorites(): Promise<Favorite[]> {
    try {
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (!data) return [];

      const favorites: Favorite[] = JSON.parse(data);
      // 생성일 기준 정렬 (최신순)
      return favorites.sort((a, b) => b.createdAt - a.createdAt);
    } catch (error) {
      console.error('[FavoritesService] Error getting favorites:', error);
      return [];
    }
  }

  /**
   * 즐겨찾기 삭제
   */
  async removeFavorite(id: string): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const filtered = favorites.filter((f) => f.id !== id);
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(filtered));
      console.log('[FavoritesService] Removed favorite:', id);
    } catch (error) {
      console.error('[FavoritesService] Error removing favorite:', error);
    }
  }

  /**
   * 즐겨찾기 업데이트
   */
  async updateFavorite(id: string, updates: Partial<Favorite>): Promise<void> {
    try {
      const favorites = await this.getFavorites();
      const updated = favorites.map((f) =>
        f.id === id ? { ...f, ...updates } : f
      );
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
      console.log('[FavoritesService] Updated favorite:', id);
    } catch (error) {
      console.error('[FavoritesService] Error updating favorite:', error);
    }
  }

  /**
   * 모든 즐겨찾기 삭제
   */
  async clearFavorites(): Promise<void> {
    try {
      await AsyncStorage.removeItem(FAVORITES_KEY);
      console.log('[FavoritesService] Cleared all favorites');
    } catch (error) {
      console.error('[FavoritesService] Error clearing favorites:', error);
    }
  }

  /**
   * 기본 즐겨찾기 아이콘 목록
   */
  getIconOptions(): string[] {
    return ['🏠', '🏢', '🏫', '🏥', '🏪', '☕', '🍔', '🎬', '🏋️', '⛪', '🏦', '📚'];
  }
}

export default new FavoritesService();
