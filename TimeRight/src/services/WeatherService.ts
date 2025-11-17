import axios from 'axios';

// OpenWeather API (무료 플랜)
const OPENWEATHER_API_KEY = process.env.EXPO_PUBLIC_OPENWEATHER_API_KEY || '';
const BASE_URL = 'https://api.openweathermap.org/data/2.5';

export interface WeatherData {
  temperature: number;
  condition: string;
  conditionKo: string;
  icon: string;
  humidity: number;
  windSpeed: number;
  feelsLike: number;
}

/**
 * 날씨 정보 서비스
 * OpenWeather API 사용
 */
class WeatherService {
  private cache: { data: WeatherData; timestamp: number } | null = null;
  private readonly CACHE_TTL = 600000; // 10분 캐시

  /**
   * 현재 위치의 날씨 정보 가져오기
   */
  async getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<WeatherData> {
    // 캐시 확인
    if (this.cache && Date.now() - this.cache.timestamp < this.CACHE_TTL) {
      console.log('[WeatherService] Cache hit');
      return this.cache.data;
    }

    try {
      const url = `${BASE_URL}/weather`;
      const response = await axios.get(url, {
        params: {
          lat: latitude,
          lon: longitude,
          appid: OPENWEATHER_API_KEY,
          units: 'metric', // 섭씨
          lang: 'kr', // 한국어
        },
        timeout: 5000,
      });

      const data = this.parseWeatherData(response.data);

      // 캐시 저장
      this.cache = {
        data,
        timestamp: Date.now(),
      };

      return data;
    } catch (error) {
      console.error('[WeatherService] Error fetching weather:', error);

      // 캐시가 있으면 오래된 데이터라도 반환
      if (this.cache) {
        console.warn('[WeatherService] Using stale cache');
        return this.cache.data;
      }

      // Mock 데이터 반환
      return this.getMockWeather();
    }
  }

  /**
   * OpenWeather API 응답 파싱
   */
  private parseWeatherData(raw: any): WeatherData {
    const condition = raw.weather?.[0]?.main || 'Clear';
    const description = raw.weather?.[0]?.description || '맑음';

    return {
      temperature: Math.round(raw.main?.temp || 20),
      condition,
      conditionKo: this.translateCondition(condition, description),
      icon: this.getWeatherIcon(condition),
      humidity: raw.main?.humidity || 50,
      windSpeed: raw.wind?.speed || 0,
      feelsLike: Math.round(raw.main?.feels_like || 20),
    };
  }

  /**
   * 날씨 상태 한글 번역
   */
  private translateCondition(condition: string, description: string): string {
    const map: Record<string, string> = {
      Clear: '맑음',
      Clouds: '흐림',
      Rain: '비',
      Drizzle: '이슬비',
      Snow: '눈',
      Thunderstorm: '천둥번개',
      Mist: '안개',
      Fog: '안개',
      Haze: '실안개',
    };

    return map[condition] || description || '맑음';
  }

  /**
   * 날씨 아이콘 이모지
   */
  private getWeatherIcon(condition: string): string {
    const map: Record<string, string> = {
      Clear: '☀️',
      Clouds: '☁️',
      Rain: '🌧️',
      Drizzle: '🌦️',
      Snow: '❄️',
      Thunderstorm: '⛈️',
      Mist: '🌫️',
      Fog: '🌫️',
      Haze: '🌫️',
    };

    return map[condition] || '☀️';
  }

  /**
   * Mock 날씨 데이터 (개발/테스트용)
   */
  private getMockWeather(): WeatherData {
    return {
      temperature: 22,
      condition: 'Clear',
      conditionKo: '맑음',
      icon: '☀️',
      humidity: 45,
      windSpeed: 2.5,
      feelsLike: 21,
    };
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache = null;
  }
}

export default new WeatherService();
