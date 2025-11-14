# API 연동 가이드

## 목차
1. [API 키 발급](#api-키-발급)
2. [버스 API](#버스-api)
3. [지하철 API](#지하철-api)
4. [신호등 API](#신호등-api)
5. [지도 API](#지도-api)
6. [에러 처리](#에러-처리)
7. [실전 예제](#실전-예제)

---

## API 키 발급

### 1. 공공데이터포털
https://www.data.go.kr/

**필요한 API**:
- 서울시 버스 도착 정보 조회
- 서울시 지하철 실시간 도착 정보

**발급 절차**:
```
1. 회원가입 / 로그인
2. 데이터 검색:
   - "서울시 버스 도착"
   - "서울시 지하철 실시간"
3. 활용신청 클릭
4. 신청 완료 (즉시 승인)
5. 마이페이지 → 인증키 확인
```

### 2. 서울시 교통 정보 시스템
https://t-data.seoul.go.kr/

**필요한 API**:
- 교통 신호 정보 (788개소)

**발급 절차**:
```
1. 회원가입
2. API 신청
3. 승인 대기 (1-2일)
4. API Key 발급 확인
```

### 3. 카카오/네이버 지도 API
**카카오**: https://developers.kakao.com/
**네이버**: https://www.ncloud.com/product/applicationService/maps

---

## 버스 API

### 기본 정보
- **Base URL**: `http://ws.bus.go.kr/api/rest`
- **인증 방식**: Query Parameter (`ServiceKey`)
- **응답 형식**: XML 또는 JSON

### 주요 엔드포인트

#### 1. 정류장별 버스 도착 정보
```
GET /arrive/getArrInfoByRoute
```

**파라미터**:
| 파라미터 | 필수 | 설명 | 예시 |
|---------|------|------|------|
| ServiceKey | O | 인증 키 | YOUR_API_KEY |
| stId | O | 정류장 ID | 100000001 |
| resultType | X | 응답 형식 | json |

**예제 코드**:
```javascript
const SEOUL_BUS_API_KEY = 'YOUR_API_KEY';

async function getBusArrival(stopId) {
  try {
    const url = `http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll`;
    const params = new URLSearchParams({
      serviceKey: SEOUL_BUS_API_KEY,
      stId: stopId,
      resultType: 'json',
    });

    const response = await fetch(`${url}?${params}`);
    const data = await response.json();

    if (data.msgHeader.headerCd !== '0') {
      throw new Error(`API Error: ${data.msgHeader.headerMsg}`);
    }

    return data.msgBody.busArrivalList;
  } catch (error) {
    console.error('[BusAPI] Error:', error);
    throw error;
  }
}

// 사용
const arrivals = await getBusArrival('100000001');
console.log(arrivals[0]);
```

**응답 예시**:
```json
{
  "msgHeader": {
    "headerCd": "0",
    "headerMsg": "정상적으로 처리되었습니다.",
    "itemCount": 1
  },
  "msgBody": {
    "busArrivalList": [
      {
        "stId": "100000001",
        "stNm": "강남역",
        "arsId": "23001",
        "busRouteId": "100100001",
        "rtNm": "146",
        "busRouteAbrv": "146",
        "sectNm": "강남역 - 서울역",
        "gpsX": "127.027583",
        "gpsY": "37.498095",
        "posX": "127.027583",
        "posY": "37.498095",
        "stationNm1": "강남역",
        "stationNm2": "역삼역",
        "traTime1": "5",
        "traTime2": "15",
        "traNum1": "2",
        "traNum2": "5",
        "arrmsg1": "5분후[2번째 전]",
        "arrmsg2": "15분후[5번째 전]",
        "routeType": "1",
        "nextBus": "N",
        "term": "10",
        "lastTm": "2359",
        "firstTm": "0500",
        "congestion1": "3",
        "congestion2": "3"
      }
    ]
  }
}
```

**필드 설명**:
| 필드 | 설명 |
|------|------|
| rtNm | 버스 번호 (146번) |
| traTime1 | 첫 번째 버스 도착까지 분 |
| traTime2 | 두 번째 버스 도착까지 분 |
| traNum1 | 첫 번째 버스 정류장까지 남은 정류장 수 |
| arrmsg1 | 도착 메시지 (사용자 친화적) |
| congestion1 | 혼잡도 (0:정보없음, 1:여유, 2:보통, 3:혼잡) |
| routeType | 노선 타입 (1:공항, 2:마을, 3:간선, 4:지선, 5:순환, 6:광역, 7:인천) |

#### 2. 정류장 정보 조회
```javascript
async function getBusStopInfo(stopId) {
  const url = `http://ws.bus.go.kr/api/rest/stationinfo/getStationByUid`;
  const params = new URLSearchParams({
    serviceKey: SEOUL_BUS_API_KEY,
    arsId: stopId,
    resultType: 'json',
  });

  const response = await fetch(`${url}?${params}`);
  const data = await response.json();

  return {
    stopId: data.msgBody.busStationAroundList.stId,
    stopName: data.msgBody.busStationAroundList.stNm,
    arsId: data.msgBody.busStationAroundList.arsId,
    latitude: parseFloat(data.msgBody.busStationAroundList.gpsY),
    longitude: parseFloat(data.msgBody.busStationAroundList.gpsX),
    nextStation: data.msgBody.busStationAroundList.nxtStn,
  };
}
```

### 실전 활용

#### 최적화된 BusAPIService 클래스
```javascript
class BusAPIService {
  constructor() {
    this.apiKey = process.env.SEOUL_BUS_API_KEY;
    this.baseURL = 'http://ws.bus.go.kr/api/rest';
    this.cache = new Map();
    this.cacheTTL = 30000; // 30초
  }

  async getArrivalInfo(stopId) {
    // 캐시 확인
    const cached = this.cache.get(stopId);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      console.log('[BusAPI] Cache hit for', stopId);
      return cached.data;
    }

    try {
      const url = `${this.baseURL}/arrive/getArrInfoByRouteAll`;
      const params = new URLSearchParams({
        serviceKey: this.apiKey,
        stId: stopId,
        resultType: 'json',
      });

      const response = await fetch(`${url}?${params}`, {
        timeout: 5000, // 5초 타임아웃
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      if (data.msgHeader.headerCd !== '0') {
        throw new Error(data.msgHeader.headerMsg);
      }

      const arrivals = this.parseArrivalData(data.msgBody.busArrivalList);

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

      throw error;
    }
  }

  parseArrivalData(rawData) {
    if (!rawData || rawData.length === 0) {
      return [];
    }

    return rawData.map((bus) => ({
      busNumber: bus.rtNm,
      routeId: bus.busRouteId,
      
      // 첫 번째 버스
      arrivalMessage1: bus.arrmsg1,
      arrivalTimeMinutes1: parseInt(bus.traTime1) || 0,
      stationsLeft1: parseInt(bus.traNum1) || 0,
      congestion1: this.parseCongestion(bus.congestion1),
      
      // 두 번째 버스
      arrivalMessage2: bus.arrmsg2,
      arrivalTimeMinutes2: parseInt(bus.traTime2) || 0,
      stationsLeft2: parseInt(bus.traNum2) || 0,
      congestion2: this.parseCongestion(bus.congestion2),
      
      // 노선 정보
      routeType: this.parseRouteType(bus.routeType),
      firstTime: bus.firstTm,
      lastTime: bus.lastTm,
      interval: parseInt(bus.term) || 0,
    }));
  }

  parseCongestion(value) {
    const map = {
      '0': 'UNKNOWN',
      '1': 'LOW',
      '2': 'MEDIUM',
      '3': 'HIGH',
    };
    return map[value] || 'UNKNOWN';
  }

  parseRouteType(value) {
    const map = {
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

  clearCache() {
    this.cache.clear();
  }
}

export default new BusAPIService();
```

---

## 지하철 API

### 기본 정보
- **Base URL**: `http://swopenapi.seoul.go.kr/api/subway`
- **인증 방식**: URL Path에 포함
- **응답 형식**: JSON

### 실시간 도착 정보
```
GET /{인증키}/json/realtimeStationArrival/{시작인덱스}/{종료인덱스}/{역명}
```

**예제**:
```javascript
const SEOUL_SUBWAY_API_KEY = 'YOUR_API_KEY';

async function getSubwayArrival(stationName) {
  try {
    const url = `http://swopenapi.seoul.go.kr/api/subway/${SEOUL_SUBWAY_API_KEY}/json/realtimeStationArrival/0/10/${encodeURIComponent(stationName)}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.errorMessage) {
      throw new Error(data.errorMessage.message);
    }

    return data.realtimeArrivalList;
  } catch (error) {
    console.error('[SubwayAPI] Error:', error);
    throw error;
  }
}

// 사용
const arrivals = await getSubwayArrival('강남');
console.log(arrivals[0]);
```

**응답 예시**:
```json
{
  "errorMessage": {
    "status": 200,
    "code": "INFO-000",
    "message": "정상 처리되었습니다.",
    "link": "",
    "developerMessage": "",
    "total": 4
  },
  "realtimeArrivalList": [
    {
      "subwayId": "1002",
      "updnLine": "상행",
      "trainLineNm": "신도림행 - 성수행",
      "statnFid": "1002000222",
      "statnTid": "1002000221",
      "statnId": "1002000222",
      "statnNm": "강남",
      "ordkey": "01002강남2",
      "subwayList": "1002,1003",
      "recptnDt": "2024-01-15 09:30:00",
      "arvlMsg2": "전역 도착",
      "arvlMsg3": "역삼",
      "arvlCd": "1",
      "btrainNo": "2234",
      "bstatnNm": "신도림",
      "barvlDt": "60",
      "trainNo": "2234",
      "lstcarAt": "1"
    }
  ]
}
```

**필드 설명**:
| 필드 | 설명 |
|------|------|
| subwayId | 호선 ID (1001=1호선, 1002=2호선, ...) |
| updnLine | 상행/하행 |
| trainLineNm | 열차 방향 (예: 신도림행) |
| statnNm | 역 이름 |
| arvlMsg2 | 도착 메시지 ("전역 도착", "전역 출발" 등) |
| arvlMsg3 | 현재 열차 위치 (역 이름) |
| barvlDt | 도착까지 시간 (초) |
| arvlCd | 도착 코드 (0=진입, 1=도착, 2=출발, 3=전역출발, 4=전역진입, 5=전역도착) |

### SubwayAPIService 클래스
```javascript
class SubwayAPIService {
  constructor() {
    this.apiKey = process.env.SEOUL_SUBWAY_API_KEY;
    this.baseURL = 'http://swopenapi.seoul.go.kr/api/subway';
    this.cache = new Map();
    this.cacheTTL = 20000; // 20초 (지하철은 더 빠름)
  }

  async getRealtimeArrival(stationName) {
    const cacheKey = `arrival_${stationName}`;
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const url = `${this.baseURL}/${this.apiKey}/json/realtimeStationArrival/0/10/${encodeURIComponent(stationName)}`;
      
      const response = await fetch(url, {
        timeout: 5000,
      });

      const data = await response.json();

      if (data.errorMessage && data.errorMessage.code !== 'INFO-000') {
        throw new Error(data.errorMessage.message);
      }

      if (!data.realtimeArrivalList) {
        return [];
      }

      const arrivals = this.parseArrivalData(data.realtimeArrivalList);

      this.cache.set(cacheKey, {
        data: arrivals,
        timestamp: Date.now(),
      });

      return arrivals;
    } catch (error) {
      console.error('[SubwayAPI] Error:', error);
      
      if (cached) {
        console.warn('[SubwayAPI] Using stale cache');
        return cached.data;
      }

      throw error;
    }
  }

  parseArrivalData(rawData) {
    return rawData.map((train) => ({
      line: train.subwayId,
      lineName: this.getLineName(train.subwayId),
      lineColor: this.getLineColor(train.subwayId),
      direction: train.updnLine,
      destination: train.bstatnNm,
      currentLocation: train.arvlMsg3,
      arrivalMessage: train.arvlMsg2,
      arrivalSeconds: parseInt(train.barvlDt) || 0,
      arrivalStatus: this.parseArrivalCode(train.arvlCd),
      trainNumber: train.btrainNo,
      isLastTrain: train.lstcarAt === '1',
    }));
  }

  getLineName(lineId) {
    const names = {
      '1001': '1호선',
      '1002': '2호선',
      '1003': '3호선',
      '1004': '4호선',
      '1005': '5호선',
      '1006': '6호선',
      '1007': '7호선',
      '1008': '8호선',
      '1009': '9호선',
    };
    return names[lineId] || lineId;
  }

  getLineColor(lineId) {
    const colors = {
      '1001': '#0052A4',
      '1002': '#00A84D',
      '1003': '#EF7C1C',
      '1004': '#00A5DE',
      '1005': '#996CAC',
      '1006': '#CD7C2F',
      '1007': '#747F00',
      '1008': '#E6186C',
      '1009': '#BDB092',
    };
    return colors[lineId] || '#000000';
  }

  parseArrivalCode(code) {
    const statuses = {
      '0': '진입',
      '1': '도착',
      '2': '출발',
      '3': '전역출발',
      '4': '전역진입',
      '5': '전역도착',
      '99': '운행중',
    };
    return statuses[code] || '알 수 없음';
  }
}

export default new SubwayAPIService();
```

---

## 신호등 API

### 기본 정보
- **Base URL**: `https://t-data.seoul.go.kr/apig/apiman-gateway/tapi`
- **인증 방식**: Header (`apiKey`)
- **범위**: 서울시 788개소

### 실시간 신호 정보
```javascript
const SEOUL_TRAFFIC_SIGNAL_API_KEY = 'YOUR_API_KEY';

async function getTrafficSignal(signalId) {
  try {
    const url = `https://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xSignalPhaseTimingInformation/1.0`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'apiKey': SEOUL_TRAFFIC_SIGNAL_API_KEY,
        'Accept': 'application/json',
      },
      params: {
        signalId,
      },
    });

    const data = await response.json();

    return {
      signalId,
      currentPhase: data.current_phase, // 'RED' | 'GREEN' | 'YELLOW'
      timeRemaining: data.time_remaining, // 초
      cycleTime: data.cycle_time, // 전체 사이클 시간 (초)
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error('[TrafficSignalAPI] Error:', error);
    
    // API 실패 시 보수적 추정
    return {
      signalId,
      currentPhase: 'UNKNOWN',
      timeRemaining: 60, // 기본 60초 가정
      cycleTime: 120,
      confidence: 0.3, // 신뢰도 30%
      timestamp: Date.now(),
    };
  }
}
```

### TrafficSignalService 클래스
```javascript
class TrafficSignalService {
  constructor() {
    this.apiKey = process.env.SEOUL_TRAFFIC_SIGNAL_API_KEY;
    this.baseURL = 'https://t-data.seoul.go.kr/apig/apiman-gateway/tapi';
    this.cache = new Map();
    this.cacheTTL = 10000; // 10초 (신호는 빠르게 변함)
    
    // 크라우드소싱 데이터 (서울 외 지역)
    this.learnedPatterns = new Map();
  }

  async getSignalTiming(signalId) {
    const cached = this.cache.get(signalId);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data;
    }

    try {
      const url = `${this.baseURL}/v2xSignalPhaseTimingInformation/1.0`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'apiKey': this.apiKey,
          'Accept': 'application/json',
        },
        params: { signalId },
        timeout: 3000, // 3초 (빠른 응답 필요)
      });

      const data = await response.json();

      const timing = {
        signalId,
        currentPhase: data.current_phase,
        timeRemaining: data.time_remaining,
        cycleTime: data.cycle_time,
        confidence: 1.0, // API 데이터는 100% 신뢰
        source: 'API',
        timestamp: Date.now(),
      };

      this.cache.set(signalId, {
        data: timing,
        timestamp: Date.now(),
      });

      return timing;
    } catch (error) {
      console.warn('[TrafficSignalAPI] API failed, trying learned pattern');
      
      // 학습된 패턴 사용
      const learned = this.learnedPatterns.get(signalId);
      if (learned && learned.samples.length >= 10) {
        return {
          signalId,
          currentPhase: 'ESTIMATED',
          timeRemaining: learned.avgWaitTime,
          cycleTime: learned.avgCycle,
          confidence: Math.min(learned.samples.length / 100, 0.8),
          source: 'LEARNED',
          timestamp: Date.now(),
        };
      }

      // 둘 다 없으면 보수적 추정
      return {
        signalId,
        currentPhase: 'UNKNOWN',
        timeRemaining: 60,
        cycleTime: 120,
        confidence: 0.3,
        source: 'DEFAULT',
        timestamp: Date.now(),
      };
    }
  }

  // 크라우드소싱: 사용자가 신호를 통과할 때마다 기록
  recordCrossing(signalId, waitTime, cycleTime) {
    if (!this.learnedPatterns.has(signalId)) {
      this.learnedPatterns.set(signalId, {
        samples: [],
        avgWaitTime: 0,
        avgCycle: 0,
      });
    }

    const pattern = this.learnedPatterns.get(signalId);
    pattern.samples.push({
      waitTime,
      cycleTime,
      timestamp: Date.now(),
    });

    // 최근 100개만 유지
    if (pattern.samples.length > 100) {
      pattern.samples = pattern.samples.slice(-100);
    }

    // 평균 계산
    const recentSamples = pattern.samples.slice(-50); // 최근 50개
    pattern.avgWaitTime = 
      recentSamples.reduce((sum, s) => sum + s.waitTime, 0) / recentSamples.length;
    pattern.avgCycle = 
      recentSamples.reduce((sum, s) => sum + s.cycleTime, 0) / recentSamples.length;

    console.log(`[TrafficSignal] Learned ${signalId}:`, pattern.avgWaitTime, '/', pattern.avgCycle);
  }

  // 경로 상의 모든 신호등 조회 (병렬)
  async getSignalsOnRoute(route) {
    const signalIds = route.trafficSignals.map((s) => s.id);
    const promises = signalIds.map((id) => this.getSignalTiming(id));
    
    try {
      return await Promise.all(promises);
    } catch (error) {
      console.error('[TrafficSignal] Batch fetch error:', error);
      // 일부 실패해도 성공한 것만 반환
      const results = await Promise.allSettled(promises);
      return results
        .filter((r) => r.status === 'fulfilled')
        .map((r) => r.value);
    }
  }
}

export default new TrafficSignalService();
```

---

## 지도 API

### 카카오맵 API
```javascript
// 경로 검색
async function searchRoute(start, end) {
  const KAKAO_API_KEY = process.env.KAKAO_API_KEY;
  
  const url = 'https://apis-navi.kakaomobility.com/v1/directions';
  const response = await fetch(url, {
    method: 'GET',
    headers: {
      'Authorization': `KakaoAK ${KAKAO_API_KEY}`,
    },
    params: {
      origin: `${start.lng},${start.lat}`,
      destination: `${end.lng},${end.lat}`,
      priority: 'RECOMMEND', // 추천 경로
      car_fuel: 'GASOLINE',
      car_hipass: false,
      alternatives: true,
      road_details: true,
    },
  });

  const data = await response.json();
  return data.routes[0]; // 첫 번째 경로
}
```

---

## 에러 처리

### 통합 에러 핸들러
```javascript
class APIError extends Error {
  constructor(message, code, service) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.service = service;
    this.timestamp = Date.now();
  }
}

class APIErrorHandler {
  static handle(error, service) {
    console.error(`[${service}] Error:`, error);

    if (error instanceof APIError) {
      // 이미 처리된 에러
      return error;
    }

    // HTTP 에러
    if (error.response) {
      return new APIError(
        `HTTP ${error.response.status}: ${error.response.statusText}`,
        'HTTP_ERROR',
        service
      );
    }

    // 네트워크 에러
    if (error.request && !error.response) {
      return new APIError(
        'Network connection failed',
        'NETWORK_ERROR',
        service
      );
    }

    // 타임아웃
    if (error.code === 'ECONNABORTED') {
      return new APIError(
        'Request timeout',
        'TIMEOUT',
        service
      );
    }

    // 기타
    return new APIError(
      error.message || 'Unknown error',
      'UNKNOWN',
      service
    );
  }

  static shouldRetry(error) {
    const retryableErrors = ['NETWORK_ERROR', 'TIMEOUT', 'HTTP_ERROR'];
    return retryableErrors.includes(error.code);
  }
}

export { APIError, APIErrorHandler };
```

### Retry 로직
```javascript
async function fetchWithRetry(fetchFn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fetchFn();
    } catch (error) {
      lastError = APIErrorHandler.handle(error, 'RetryService');
      
      if (!APIErrorHandler.shouldRetry(lastError) || i === maxRetries - 1) {
        throw lastError;
      }

      // 지수 백오프 (exponential backoff)
      const delayMs = Math.min(1000 * Math.pow(2, i), 5000);
      console.log(`[Retry] Attempt ${i + 1} failed, retrying in ${delayMs}ms`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

// 사용
const arrivals = await fetchWithRetry(() => 
  BusAPIService.getArrivalInfo(stopId)
);
```

---

## 실전 예제

### 통합 예제: 실시간 알림 시스템
```javascript
// services/RealtimeNavigationService.js
import BusAPIService from './BusAPIService';
import SubwayAPIService from './SubwayAPIService';
import TrafficSignalService from './TrafficSignalService';
import DecisionEngine from './DecisionEngine';
import NotificationService from './NotificationService';

class RealtimeNavigationService {
  constructor() {
    this.isRunning = false;
    this.currentRoute = null;
    this.intervalId = null;
  }

  async start(route) {
    if (this.isRunning) {
      console.warn('[RealtimeNav] Already running');
      return;
    }

    this.currentRoute = route;
    this.isRunning = true;

    console.log('[RealtimeNav] Started for route:', route.id);

    // 즉시 한 번 실행
    await this.checkAndNotify();

    // 5초마다 체크
    this.intervalId = setInterval(() => {
      this.checkAndNotify();
    }, 5000);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.intervalId);
    console.log('[RealtimeNav] Stopped');
  }

  async checkAndNotify() {
    try {
      // 1. 현재 위치
      const userLocation = useStore.getState().userLocation;
      if (!userLocation) {
        console.warn('[RealtimeNav] No user location');
        return;
      }

      // 2. 다음 목표 지점
      const nextStop = this.currentRoute.nextStop;
      if (!nextStop) {
        console.log('[RealtimeNav] No more stops, finishing route');
        this.stop();
        return;
      }

      // 3. 거리 계산
      const distance = this.calculateDistance(userLocation, nextStop);

      // 4. 대중교통 정보 가져오기
      let transportInfo;
      if (nextStop.type === 'BUS') {
        const arrivals = await BusAPIService.getArrivalInfo(nextStop.id);
        transportInfo = arrivals[0]; // 가장 빨리 오는 버스
      } else if (nextStop.type === 'SUBWAY') {
        const arrivals = await SubwayAPIService.getRealtimeArrival(nextStop.name);
        transportInfo = arrivals.find(
          (t) => t.line === nextStop.line && t.direction === nextStop.direction
        );
      }

      if (!transportInfo) {
        console.warn('[RealtimeNav] No transport info available');
        return;
      }

      // 5. 신호등 정보
      const signals = await TrafficSignalService.getSignalsOnRoute(this.currentRoute);
      const signalWaitTimes = signals.map((s) => s.timeRemaining);

      // 6. 결정 엔진 실행
      const decision = DecisionEngine.decide({
        distance,
        busArrivalTime: this.getArrivalSeconds(transportInfo),
        signalWaitTimes,
      });

      // 7. 알림
      NotificationService.send(decision);

      // 8. 상태 업데이트
      useStore.getState().setCurrentDecision(decision);

      console.log('[RealtimeNav] Decision:', decision.action, distance.toFixed(0), 'm');
    } catch (error) {
      console.error('[RealtimeNav] Error:', error);
      
      // 에러 시 사용자에게 알림
      NotificationService.send({
        message: '⚠️ 일시적인 오류가 발생했습니다',
        detail: '잠시 후 다시 시도합니다',
        urgency: 'INFO',
      });
    }
  }

  calculateDistance(point1, point2) {
    const R = 6371e3; // 지구 반지름 (m)
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // 미터
  }

  getArrivalSeconds(transportInfo) {
    if (transportInfo.arrivalTimeMinutes1 !== undefined) {
      // 버스
      return transportInfo.arrivalTimeMinutes1 * 60;
    } else if (transportInfo.arrivalSeconds !== undefined) {
      // 지하철
      return transportInfo.arrivalSeconds;
    }
    return 0;
  }
}

export default new RealtimeNavigationService();
```

### 사용 예제
```javascript
// App.js
import React, { useEffect } from 'react';
import RealtimeNavigationService from './services/RealtimeNavigationService';

function NavigationScreen({ route }) {
  useEffect(() => {
    // 경로 추적 시작
    RealtimeNavigationService.start(route);

    // 컴포넌트 언마운트 시 정지
    return () => {
      RealtimeNavigationService.stop();
    };
  }, [route]);

  return (
    <View>
      <MapView />
      <CurrentDecisionPanel />
    </View>
  );
}
```

---

## API 사용량 관리

### 호출 횟수 추적
```javascript
class APIUsageTracker {
  constructor() {
    this.usage = {
      bus: { count: 0, errors: 0 },
      subway: { count: 0, errors: 0 },
      signal: { count: 0, errors: 0 },
    };
  }

  track(service, success = true) {
    if (!this.usage[service]) return;

    this.usage[service].count++;
    if (!success) {
      this.usage[service].errors++;
    }

    // 1시간마다 로그
    if (this.usage[service].count % 100 === 0) {
      console.log(`[APIUsage] ${service}:`, this.usage[service]);
    }
  }

  getStats() {
    const total = Object.values(this.usage).reduce(
      (sum, s) => sum + s.count,
      0
    );
    
    return {
      total,
      byService: this.usage,
    };
  }
}

export default new APIUsageTracker();
```

---

## 테스트 예제

```javascript
// __tests__/BusAPIService.test.js
import BusAPIService from '../services/BusAPIService';

describe('BusAPIService', () => {
  test('should fetch arrival info', async () => {
    const arrivals = await BusAPIService.getArrivalInfo('100000001');
    
    expect(arrivals).toBeInstanceOf(Array);
    expect(arrivals.length).toBeGreaterThan(0);
    expect(arrivals[0]).toHaveProperty('busNumber');
    expect(arrivals[0]).toHaveProperty('arrivalTimeMinutes1');
  });

  test('should use cache on second call', async () => {
    const first = await BusAPIService.getArrivalInfo('100000001');
    const second = await BusAPIService.getArrivalInfo('100000001');
    
    // 캐시 사용으로 즉시 반환
    expect(second).toEqual(first);
  });

  test('should handle API errors gracefully', async () => {
    await expect(
      BusAPIService.getArrivalInfo('INVALID_ID')
    ).rejects.toThrow();
  });
});
```

---

## 체크리스트

### API 연동 완료 확인
- [ ] 버스 API 키 발급
- [ ] 지하철 API 키 발급
- [ ] 신호등 API 키 발급 (서울만)
- [ ] 지도 API 키 발급
- [ ] `.env` 파일 설정
- [ ] 각 API 테스트 완료
- [ ] 에러 처리 구현
- [ ] 캐싱 구현
- [ ] 재시도 로직 구현
- [ ] 사용량 추적 구현

---

**이전**: [개발 로드맵](ROADMAP.md)
**다음**: 실제 구현 시작!
