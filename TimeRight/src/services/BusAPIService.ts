import axios from 'axios';
import { BusArrival } from '../types';

// .env 파일에서 API 키를 가져올 예정
const BUS_API_KEY = process.env.EXPO_PUBLIC_SEOUL_BUS_API_KEY || '';
const BASE_URL = 'http://ws.bus.go.kr/api/rest';

class BusAPIService {
  private cache = new Map<string, { data: BusArrival[]; timestamp: number }>();
  private readonly CACHE_TTL = 30000; // 30초 캐시

  /**
   * 정류장별 버스 도착 정보 조회
   */
  async getArrivalInfo(stopId: string): Promise<BusArrival[]> {
    // 캐시 확인
    const cached = this.cache.get(stopId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log('[BusAPI] Cache hit for', stopId);
      return cached.data;
    }

    try {
      const url = `${BASE_URL}/arrive/getArrInfoByRouteAll`;
      const response = await axios.get(url, {
        params: {
          serviceKey: BUS_API_KEY,
          stId: stopId,
          resultType: 'json',
        },
        timeout: 5000, // 5초 타임아웃
      });

      if (response.data.msgHeader.headerCd !== '0') {
        throw new Error(response.data.msgHeader.headerMsg);
      }

      const arrivals = this.parseArrivalData(response.data.msgBody.busArrivalList || []);

      // 캐시 저장
      this.cache.set(stopId, {
        data: arrivals,
        timestamp: Date.now(),
      });

      return arrivals;
    } catch (error) {
      console.error('[BusAPI] Error:', error);

      // 캐시가 있으면 오래된 데이터라도 반환
      if (cached) {
        console.warn('[BusAPI] Using stale cache');
        return cached.data;
      }

      // Mock 데이터 반환 (개발용)
      return this.getMockData();
    }
  }

  /**
   * API 응답 데이터 파싱
   */
  private parseArrivalData(rawData: any[]): BusArrival[] {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    return rawData.map((bus) => ({
      busNumber: bus.rtNm,
      routeId: bus.busRouteId,
      arrivalMessage1: bus.arrmsg1 || '정보 없음',
      arrivalTimeMinutes1: parseInt(bus.traTime1) || 0,
      stationsLeft1: parseInt(bus.traNum1) || 0,
      congestion1: this.parseCongestion(bus.congestion1),
      arrivalMessage2: bus.arrmsg2,
      arrivalTimeMinutes2: parseInt(bus.traTime2) || 0,
      stationsLeft2: parseInt(bus.traNum2) || 0,
      congestion2: this.parseCongestion(bus.congestion2),
      routeType: this.parseRouteType(bus.routeType),
      firstTime: bus.firstTm || '0500',
      lastTime: bus.lastTm || '2359',
      interval: parseInt(bus.term) || 0,
    }));
  }

  /**
   * 혼잡도 파싱
   */
  private parseCongestion(value: string): 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH' {
    const map: Record<string, 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH'> = {
      '0': 'UNKNOWN',
      '1': 'LOW',
      '2': 'MEDIUM',
      '3': 'HIGH',
    };
    return map[value] || 'UNKNOWN';
  }

  /**
   * 노선 타입 파싱
   */
  private parseRouteType(value: string): string {
    const map: Record<string, string> = {
      '1': '공항',
      '2': '마을',
      '3': '간선',
      '4': '지선',
      '5': '순환',
      '6': '광역',
      '7': '인천',
    };
    return map[value] || '기타';
  }

  /**
   * Mock 데이터 (개발/테스트용)
   */
  private getMockData(): BusArrival[] {
    return [
      {
        busNumber: '146',
        routeId: 'mock-route-1',
        arrivalMessage1: '3분 후 도착',
        arrivalTimeMinutes1: 3,
        stationsLeft1: 2,
        congestion1: 'MEDIUM',
        arrivalMessage2: '15분 후 도착',
        arrivalTimeMinutes2: 15,
        stationsLeft2: 5,
        congestion2: 'LOW',
        routeType: '간선',
        firstTime: '0500',
        lastTime: '2359',
        interval: 10,
      },
      {
        busNumber: '401',
        routeId: 'mock-route-2',
        arrivalMessage1: '7분 후 도착',
        arrivalTimeMinutes1: 7,
        stationsLeft1: 4,
        congestion1: 'HIGH',
        routeType: '광역',
        firstTime: '0530',
        lastTime: '2330',
        interval: 15,
      },
    ];
  }

  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache.clear();
  }
}

export default new BusAPIService();
