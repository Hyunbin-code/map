# 개발 로드맵 (2-4개월)

## 전체 타임라인

```
Month 1          Month 2          Month 3          Month 4
│                │                │                │
├─ Phase 1       ├─ Phase 2       ├─ Phase 3       ├─ Phase 4
│  프로토타입     │  GPS & API     │  알림 & 최적화  │  테스트 & 배포
│  (1-2주)       │  (4주)         │  (4주)         │  (2주)
│                │                │                │
└────────────────┴────────────────┴────────────────┴──────────→
```

---

## Phase 1: 프로토타입 (Week 1-2)

### 목표
- ✅ 아이디어 검증
- ✅ 기본 UI/UX 구현
- ✅ 빠른 피드백 수집

### Week 1: Bolt.new 프로토타입

**Day 1-2: 초기 설정**
```bash
# Bolt.new 접속
# 프롬프트 입력:

"Create a React Native app with Expo that includes:
1. Map view using react-native-maps
2. Current location marker
3. Input fields for start and end points
4. Mock bus arrival time display (hardcoded data)
5. Notification button that shows 'Run now!' message
6. Simple bottom sheet showing route info"

# 결과 확인
# Expo Go 앱으로 핸드폰 테스트
```

**Day 3-4: UI 개선**
- 지도 스타일링
- 버스/지하철 아이콘 추가
- 알림 디자인 개선
- 색상 스킴 결정 (빨강=긴급, 주황=주의, 초록=여유)

**Day 5-7: 기본 로직 추가**
```javascript
// 간단한 거리 계산
function calculateDistance(point1, point2) {
  const R = 6371e3; // 지구 반지름 (m)
  const φ1 = point1.lat * Math.PI / 180;
  const φ2 = point2.lat * Math.PI / 180;
  const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
  const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c; // 미터 단위
}

// Mock 알림 로직
function decideMockAction(distance) {
  if (distance > 500) {
    return { message: '✅ 여유있게 가세요', color: 'green' };
  } else if (distance > 200) {
    return { message: '🚶 조금 서두르세요', color: 'orange' };
  } else {
    return { message: '🏃 지금 뛰어야 해요!', color: 'red' };
  }
}
```

**산출물**:
- 작동하는 프로토타입 앱
- 스크린샷 5장
- 개선 아이디어 문서

---

### Week 2: 환경 설정 & 학습

**Day 1-3: 개발 환경 구축**
```bash
# Cursor 설치
brew install --cask cursor

# React Native CLI 설치
npm install -g react-native-cli

# 프로젝트 생성
npx react-native init TimeRight
cd TimeRight

# Cursor로 열기
cursor .

# 필수 라이브러리 설치
npm install react-native-maps
npm install react-native-geolocation-service
npm install @react-navigation/native
npm install @react-navigation/stack
npm install zustand
npm install axios
```

**Day 4-5: React Native 기초 학습**
- React Native 공식 문서 읽기
- Navigation 튜토리얼
- State Management (Zustand) 실습

**Day 6-7: 서울시 API 문서 연구**
```javascript
// API 엔드포인트 정리

// 1. 버스 도착 정보
const BUS_ARRIVAL_API = 'http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRoute';
// 파라미터: ServiceKey, stId (정류장 ID), busRouteId

// 2. 지하철 도착 정보
const SUBWAY_ARRIVAL_API = 'http://swopenapi.seoul.go.kr/api/subway/인증키/json/realtimeStationArrival/0/5/서울';

// 3. 신호등 정보
const TRAFFIC_SIGNAL_API = 'https://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xSignalPhaseTimingInformation/1.0';

// API 키 발급 (공공데이터포털)
// - https://www.data.go.kr/
```

**산출물**:
- 개발 환경 완료
- API 키 발급 완료
- 학습 노트 정리

---

## Phase 2: GPS & API 연동 (Week 3-6)

### Week 3-4: GPS 추적 구현

**Week 3 Day 1-3: 기본 GPS 추적**
```javascript
// services/LocationService.js
import Geolocation from 'react-native-geolocation-service';
import { PermissionsAndroid, Platform } from 'react-native';

class LocationService {
  constructor() {
    this.watchId = null;
    this.currentLocation = null;
  }

  async requestPermission() {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // iOS는 Info.plist 설정으로 처리
  }

  startTracking(callback) {
    this.watchId = Geolocation.watchPosition(
      (position) => {
        this.currentLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
        callback(this.currentLocation);
      },
      (error) => console.error(error),
      {
        enableHighAccuracy: true,
        distanceFilter: 10, // 10m 이동마다 업데이트
        interval: 5000, // 5초마다 체크
        fastestInterval: 2000,
      }
    );
  }

  stopTracking() {
    if (this.watchId) {
      Geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  getCurrentLocation() {
    return this.currentLocation;
  }
}

export default new LocationService();
```

**Week 3 Day 4-5: 백그라운드 추적**
```bash
# 백그라운드 위치 추적 라이브러리
npm install react-native-background-geolocation
```

```javascript
// services/BackgroundLocationService.js
import BackgroundGeolocation from 'react-native-background-geolocation';

class BackgroundLocationService {
  configure() {
    BackgroundGeolocation.ready({
      desiredAccuracy: BackgroundGeolocation.DESIRED_ACCURACY_HIGH,
      distanceFilter: 10,
      stopTimeout: 5,
      debug: false, // 프로덕션에서는 false
      logLevel: BackgroundGeolocation.LOG_LEVEL_VERBOSE,
      startOnBoot: false,
      stopOnTerminate: true,
      locationProvider: BackgroundGeolocation.ACTIVITY_PROVIDER,
      interval: 5000,
      fastestInterval: 2000,
      activitiesInterval: 10000,
      stopOnStillActivity: false,
    }).then((state) => {
      console.log('BackgroundGeolocation ready:', state.enabled);
    });

    // 위치 업데이트 리스너
    BackgroundGeolocation.on('location', (location) => {
      console.log('[location]', location);
      // Zustand store 업데이트
      useStore.getState().setUserLocation(location);
    });

    // 활동 변경 리스너 (걷기, 뛰기, 정지 등)
    BackgroundGeolocation.on('activitychange', (event) => {
      console.log('[activitychange]', event.activity, event.confidence);
      this.adjustTrackingMode(event.activity);
    });
  }

  adjustTrackingMode(activity) {
    if (activity === 'still') {
      // 정지 중: 추적 간격 늘림
      BackgroundGeolocation.setConfig({ interval: 30000 });
    } else if (activity === 'on_foot') {
      // 걷기: 일반 추적
      BackgroundGeolocation.setConfig({ interval: 5000 });
    } else if (activity === 'running') {
      // 뛰기: 고빈도 추적
      BackgroundGeolocation.setConfig({ interval: 2000 });
    }
  }

  start() {
    BackgroundGeolocation.start();
  }

  stop() {
    BackgroundGeolocation.stop();
  }
}

export default new BackgroundLocationService();
```

**Week 4 Day 1-5: Geofencing 구현**
```javascript
// services/GeofenceService.js
import BackgroundGeolocation from 'react-native-background-geolocation';

class GeofenceService {
  constructor() {
    this.activeGeofences = new Map();
  }

  addGeofence(busStop) {
    const geofence = {
      identifier: `stop_${busStop.id}`,
      radius: 100, // 100m 반경
      latitude: busStop.lat,
      longitude: busStop.lng,
      notifyOnEntry: true,
      notifyOnExit: true,
      notifyOnDwell: false,
    };

    BackgroundGeolocation.addGeofence(geofence)
      .then(() => {
        console.log('[addGeofence] success', geofence.identifier);
        this.activeGeofences.set(busStop.id, geofence);
      })
      .catch((error) => {
        console.error('[addGeofence] error', error);
      });
  }

  removeGeofence(busStopId) {
    const identifier = `stop_${busStopId}`;
    BackgroundGeolocation.removeGeofence(identifier)
      .then(() => {
        console.log('[removeGeofence] success', identifier);
        this.activeGeofences.delete(busStopId);
      });
  }

  setupListeners() {
    // 진입 이벤트
    BackgroundGeolocation.on('geofence', (geofence) => {
      console.log('[geofence]', geofence.action, geofence.identifier);
      
      if (geofence.action === 'ENTER') {
        // 정류장 도착!
        const stopId = geofence.identifier.replace('stop_', '');
        this.handleStopArrival(stopId);
      } else if (geofence.action === 'EXIT') {
        // 정류장 이탈
        const stopId = geofence.identifier.replace('stop_', '');
        this.handleStopDeparture(stopId);
      }
    });
  }

  handleStopArrival(stopId) {
    // 버스 도착 정보 즉시 조회
    fetchBusArrivals(stopId).then((arrivals) => {
      // 알림 로직 실행
      checkAndNotify(stopId, arrivals);
    });
  }

  handleStopDeparture(stopId) {
    // Geofence 제거 (더 이상 필요 없음)
    this.removeGeofence(stopId);
  }
}

export default new GeofenceService();
```

**산출물 Week 3-4**:
- GPS 추적 기능 완료
- 백그라운드 동작 확인
- Geofencing 테스트 완료

---

### Week 5-6: API 연동

**Week 5 Day 1-3: 버스 API**
```javascript
// services/BusAPIService.js
import axios from 'axios';

const BUS_API_KEY = process.env.SEOUL_BUS_API_KEY;
const BASE_URL = 'http://ws.bus.go.kr/api/rest';

class BusAPIService {
  async getArrivalInfo(stopId) {
    try {
      const response = await axios.get(`${BASE_URL}/arrive/getArrInfoByRouteAll`, {
        params: {
          serviceKey: BUS_API_KEY,
          stId: stopId,
          resultType: 'json',
        },
      });

      const data = response.data.msgBody.busArrivalList;
      
      return data.map((bus) => ({
        busNumber: bus.rtNm,
        routeId: bus.busRouteId,
        arrivalTime1: bus.arrmsg1, // "5분후[2번째 전]"
        arrivalTime1Min: bus.traTime1, // 분 단위 (숫자)
        arrivalTime2: bus.arrmsg2,
        arrivalTime2Min: bus.traTime2,
        busType: bus.routeType, // 간선/지선/광역 등
        congestion: bus.reride_Num1, // 혼잡도
      }));
    } catch (error) {
      console.error('[BusAPI] Error:', error);
      throw error;
    }
  }

  async getBusStopInfo(stopId) {
    const response = await axios.get(`${BASE_URL}/stationinfo/getStationByUid`, {
      params: {
        serviceKey: BUS_API_KEY,
        arsId: stopId,
        resultType: 'json',
      },
    });

    const station = response.data.msgBody.busStationAroundList;
    
    return {
      stopId: station.stId,
      stopName: station.stNm,
      arsId: station.arsId, // 정류장 번호 (5자리)
      latitude: station.gpsY,
      longitude: station.gpsX,
      nextStation: station.nxtStn,
    };
  }
}

export default new BusAPIService();
```

**Week 5 Day 4-5: 지하철 API**
```javascript
// services/SubwayAPIService.js
const SUBWAY_API_KEY = process.env.SEOUL_SUBWAY_API_KEY;
const BASE_URL = 'http://swopenapi.seoul.go.kr/api/subway';

class SubwayAPIService {
  async getRealtimeArrival(stationName) {
    try {
      const url = `${BASE_URL}/${SUBWAY_API_KEY}/json/realtimeStationArrival/0/10/${encodeURI(stationName)}`;
      const response = await axios.get(url);

      if (response.data.errorMessage) {
        throw new Error(response.data.errorMessage.message);
      }

      const arrivals = response.data.realtimeArrivalList;
      
      return arrivals.map((train) => ({
        line: train.subwayId, // 1001 = 1호선, 1002 = 2호선
        lineName: train.trainLineNm,
        direction: train.updnLine, // "상행" or "하행"
        destination: train.bstatnNm, // 종착역
        arrivalMessage: train.arvlMsg2, // "전역 도착", "전역 출발" 등
        arrivalTime: train.barvlDt, // 도착까지 초
        currentStation: train.arvlMsg3, // "강남 도착"
        trainStatus: train.recptnDt, // 열차 상태
      }));
    } catch (error) {
      console.error('[SubwayAPI] Error:', error);
      throw error;
    }
  }

  getLineColor(lineId) {
    const colors = {
      '1001': '#0052A4', // 1호선 파랑
      '1002': '#00A84D', // 2호선 초록
      '1003': '#EF7C1C', // 3호선 주황
      '1004': '#00A5DE', // 4호선 하늘
      // ... 나머지 노선
    };
    return colors[lineId] || '#000000';
  }
}

export default new SubwayAPIService();
```

**Week 6 Day 1-5: 신호등 API & 캐싱**
```javascript
// services/TrafficSignalService.js
const SIGNAL_API_KEY = process.env.SEOUL_TRAFFIC_SIGNAL_API_KEY;

class TrafficSignalService {
  constructor() {
    this.cache = new Map();
    this.CACHE_TTL = 60000; // 1분 캐시
  }

  async getSignalTiming(signalId) {
    // 캐시 확인
    const cached = this.cache.get(signalId);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data;
    }

    try {
      const url = `https://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xSignalPhaseTimingInformation/1.0`;
      const response = await axios.get(url, {
        headers: {
          'apiKey': SIGNAL_API_KEY,
        },
        params: {
          signalId,
        },
      });

      const data = {
        currentPhase: response.data.current_phase,
        timeRemaining: response.data.time_remaining,
        cycleTime: response.data.cycle_time,
        signalId,
        timestamp: Date.now(),
      };

      // 캐시 저장
      this.cache.set(signalId, {
        data,
        timestamp: Date.now(),
      });

      return data;
    } catch (error) {
      console.error('[TrafficSignal] Error:', error);
      // 에러 시 보수적 예측
      return {
        currentPhase: 'UNKNOWN',
        timeRemaining: 60, // 기본 60초 가정
        cycleTime: 120,
        confidence: 0.3,
      };
    }
  }

  // 경로 상의 모든 신호등 조회
  async getSignalsOnRoute(route) {
    const signals = route.trafficSignals || [];
    const promises = signals.map((s) => this.getSignalTiming(s.id));
    return Promise.all(promises);
  }
}

export default new TrafficSignalService();
```

**산출물 Week 5-6**:
- 버스/지하철 실시간 정보 연동 완료
- 신호등 API 연동 완료
- API 캐싱 구현 완료
- 에러 핸들링 완료

---

## Phase 3: 알림 & 최적화 (Week 7-10)

### Week 7-8: 알림 로직 구현

**Week 7 Day 1-3: 핵심 알고리즘**
```javascript
// services/DecisionEngine.js
class DecisionEngine {
  constructor() {
    this.SAFETY_MARGIN = 30; // 30초 안전 마진
    this.WALK_SPEED = 1.2; // 평균 보행 속도 (m/s)
  }

  calculateRequiredTime(distance, signalWaitTimes) {
    // 순수 이동 시간
    const walkTime = distance / this.WALK_SPEED;
    
    // 신호 대기 시간 합산
    const totalSignalWait = signalWaitTimes.reduce((sum, wait) => sum + wait, 0);
    
    // 안전 마진 추가
    return walkTime + totalSignalWait + this.SAFETY_MARGIN;
  }

  decide(params) {
    const { distance, busArrivalTime, signalWaitTimes } = params;
    
    const requiredTime = this.calculateRequiredTime(distance, signalWaitTimes);
    const timeDiff = busArrivalTime - requiredTime;
    
    if (timeDiff < 0) {
      return {
        action: 'MISSED',
        message: '😢 이번 버스는 놓쳤어요\n다음 버스를 이용하세요',
        urgency: 'INFO',
        color: '#666666',
        vibrate: false,
      };
    } else if (timeDiff < 30) {
      return {
        action: 'RUN',
        message: '🏃 지금 빠르게 이동하세요!',
        detail: `${Math.floor(distance)}m 남음, ${Math.floor(timeDiff)}초 여유`,
        urgency: 'HIGH',
        color: '#FF4444',
        vibrate: true,
        sound: 'urgent.mp3',
      };
    } else if (timeDiff < 60) {
      return {
        action: 'WALK_FAST',
        message: '🚶 조금 서두르세요',
        detail: `${Math.floor(timeDiff)}초 여유`,
        urgency: 'MEDIUM',
        color: '#FF9900',
        vibrate: true,
        sound: 'normal.mp3',
      };
    } else {
      return {
        action: 'WALK_NORMAL',
        message: '✅ 여유있게 가세요',
        detail: `${Math.floor(timeDiff/60)}분 ${Math.floor(timeDiff%60)}초 여유`,
        urgency: 'LOW',
        color: '#00CC66',
        vibrate: false,
      };
    }
  }

  decideTransfer(params) {
    const { platformDistance, nextTrainArrival, crowdLevel } = params;
    
    // 환승 시간 계산
    const transferTime = this.calculateTransferTime(platformDistance, crowdLevel);
    
    if (nextTrainArrival < transferTime) {
      return {
        action: 'WAIT_NEXT',
        message: '⏳ 다음 열차를 이용하세요',
        detail: '현재 열차는 놓칠 확률이 높습니다',
        urgency: 'INFO',
      };
    } else if (nextTrainArrival - transferTime < 30) {
      return {
        action: 'RUN',
        message: '🏃 빠르게 환승하세요!',
        detail: `${Math.floor(platformDistance)}m 이동`,
        urgency: 'HIGH',
      };
    } else {
      return {
        action: 'WALK',
        message: '✅ 여유있게 환승하세요',
        detail: `${Math.floor((nextTrainArrival - transferTime)/60)}분 여유`,
        urgency: 'LOW',
      };
    }
  }

  calculateTransferTime(distance, crowdLevel) {
    const baseTime = distance / this.WALK_SPEED;
    
    const crowdMultiplier = {
      'LOW': 1.0,
      'MEDIUM': 1.2,
      'HIGH': 1.5,
    }[crowdLevel] || 1.2;
    
    const stairPenalty = 30; // 계단 평균 30초
    
    return (baseTime + stairPenalty) * crowdMultiplier;
  }
}

export default new DecisionEngine();
```

**Week 7 Day 4-5: 알림 서비스**
```javascript
// services/NotificationService.js
import PushNotification from 'react-native-push-notification';

class NotificationService {
  constructor() {
    this.configure();
    this.lastNotification = null;
  }

  configure() {
    PushNotification.configure({
      onNotification: function (notification) {
        console.log('[Notification]', notification);
      },
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },
      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  send(decision) {
    // 중복 방지
    if (this.isDuplicate(decision)) {
      return;
    }

    PushNotification.localNotification({
      channelId: 'timeright-channel',
      title: decision.message,
      message: decision.detail || '',
      playSound: decision.sound ? true : false,
      soundName: decision.sound || 'default',
      vibrate: decision.vibrate,
      vibration: decision.vibrate ? 400 : 0,
      priority: decision.urgency === 'HIGH' ? 'high' : 'default',
      color: decision.color,
      largeIcon: 'ic_launcher',
      smallIcon: 'ic_notification',
    });

    this.lastNotification = {
      ...decision,
      timestamp: Date.now(),
    };
  }

  isDuplicate(decision) {
    if (!this.lastNotification) return false;
    
    const timeSince = Date.now() - this.lastNotification.timestamp;
    const isSameMessage = this.lastNotification.message === decision.message;
    
    // 같은 메시지가 30초 이내에 다시 오면 중복
    return isSameMessage && timeSince < 30000;
  }

  cancelAll() {
    PushNotification.cancelAllLocalNotifications();
  }
}

export default new NotificationService();
```

**Week 8: 메인 로직 통합**
```javascript
// services/NavigationService.js
import LocationService from './LocationService';
import BusAPIService from './BusAPIService';
import TrafficSignalService from './TrafficSignalService';
import DecisionEngine from './DecisionEngine';
import NotificationService from './NotificationService';

class NavigationService {
  constructor() {
    this.isActive = false;
    this.currentRoute = null;
    this.intervalId = null;
  }

  async start(route) {
    this.currentRoute = route;
    this.isActive = true;

    // GPS 추적 시작
    LocationService.startTracking(this.onLocationUpdate.bind(this));

    // Geofence 설정
    route.busStops.forEach((stop) => {
      GeofenceService.addGeofence(stop);
    });

    // 주기적 체크 (5초마다)
    this.intervalId = setInterval(() => {
      this.checkAndDecide();
    }, 5000);
  }

  stop() {
    this.isActive = false;
    LocationService.stopTracking();
    clearInterval(this.intervalId);
  }

  onLocationUpdate(location) {
    // Zustand store 업데이트
    useStore.getState().setUserLocation(location);
  }

  async checkAndDecide() {
    if (!this.isActive || !this.currentRoute) return;

    const userLocation = useStore.getState().userLocation;
    if (!userLocation) return;

    // 현재 목표 (다음 버스 정류장)
    const targetStop = this.currentRoute.nextStop;

    // 거리 계산
    const distance = this.calculateDistance(userLocation, targetStop);

    // 버스 도착 정보
    const busArrivals = await BusAPIService.getArrivalInfo(targetStop.id);
    const nextBus = busArrivals[0]; // 가장 빨리 오는 버스

    // 신호등 정보
    const signals = await TrafficSignalService.getSignalsOnRoute(this.currentRoute);
    const signalWaitTimes = signals.map((s) => s.timeRemaining);

    // 결정
    const decision = DecisionEngine.decide({
      distance,
      busArrivalTime: nextBus.arrivalTime1Min * 60,
      signalWaitTimes,
    });

    // 알림
    NotificationService.send(decision);

    // 상태 업데이트
    useStore.getState().setCurrentDecision(decision);
  }

  calculateDistance(point1, point2) {
    const R = 6371e3;
    const φ1 = (point1.latitude * Math.PI) / 180;
    const φ2 = (point2.lat * Math.PI) / 180;
    const Δφ = ((point2.lat - point1.latitude) * Math.PI) / 180;
    const Δλ = ((point2.lng - point1.longitude) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }
}

export default new NavigationService();
```

**산출물 Week 7-8**:
- 핵심 알림 로직 완료
- 알림 서비스 구현
- 메인 로직 통합 완료

---

### Week 9-10: 배터리 최적화 & 테스트

**Week 9: 배터리 최적화**
```javascript
// services/BatteryOptimizer.js
import { NativeModules } from 'react-native';

class BatteryOptimizer {
  constructor() {
    this.batteryLevel = 100;
    this.isLowPowerMode = false;
  }

  async init() {
    // 배터리 레벨 모니터링
    this.batteryLevel = await NativeModules.RNBatteryManager.getBatteryLevel();
    
    // 저전력 모드 감지
    this.isLowPowerMode = await NativeModules.RNBatteryManager.isLowPowerMode();
  }

  getOptimalGPSInterval() {
    if (this.isLowPowerMode || this.batteryLevel < 20) {
      return 30000; // 30초 (절약 모드)
    } else if (this.batteryLevel < 50) {
      return 10000; // 10초
    } else {
      return 5000; // 5초 (일반)
    }
  }

  shouldUseHighAccuracy() {
    return this.batteryLevel > 30 && !this.isLowPowerMode;
  }

  applyOptimizations() {
    const interval = this.getOptimalGPSInterval();
    const highAccuracy = this.shouldUseHighAccuracy();

    BackgroundGeolocation.setConfig({
      interval,
      desiredAccuracy: highAccuracy
        ? BackgroundGeolocation.DESIRED_ACCURACY_HIGH
        : BackgroundGeolocation.DESIRED_ACCURACY_MEDIUM,
    });

    console.log('[BatteryOptimizer] Applied:', { interval, highAccuracy });
  }
}

export default new BatteryOptimizer();
```

**Week 10: 통합 테스트**
```javascript
// __tests__/DecisionEngine.test.js
import DecisionEngine from '../services/DecisionEngine';

describe('DecisionEngine', () => {
  test('should return RUN when time is tight', () => {
    const result = DecisionEngine.decide({
      distance: 200,
      busArrivalTime: 180, // 3분
      signalWaitTimes: [0],
    });

    expect(result.action).toBe('RUN');
    expect(result.urgency).toBe('HIGH');
  });

  test('should return WALK_NORMAL when plenty of time', () => {
    const result = DecisionEngine.decide({
      distance: 200,
      busArrivalTime: 600, // 10분
      signalWaitTimes: [0],
    });

    expect(result.action).toBe('WALK_NORMAL');
    expect(result.urgency).toBe('LOW');
  });

  test('should account for signal wait times', () => {
    const result = DecisionEngine.decide({
      distance: 200,
      busArrivalTime: 300, // 5분
      signalWaitTimes: [60, 60], // 2개 신호, 각 60초
    });

    // 200m / 1.2m/s = 167초
    // + 120초 (신호)
    // + 30초 (마진)
    // = 317초 > 300초
    expect(result.action).toBe('MISSED');
  });
});
```

**산출물 Week 9-10**:
- 배터리 최적화 완료
- 단위 테스트 작성
- 통합 테스트 완료
- 버그 수정

---

## Phase 4: 테스트 & 배포 (Week 11-12)

### Week 11: 실제 테스트

**Day 1-3: 알파 테스트 (혼자)**
```
체크리스트:
□ 출근길 테스트 (오전 8시)
□ 퇴근길 테스트 (오후 6시)
□ 주말 테스트 (낮 시간)
□ 환승 테스트 (2호선 → 3호선)
□ 배터리 소모 측정 (1시간 사용)

기록 항목:
- 알림 정확도 (실제 vs 예측)
- 배터리 소모율
- GPS 정확도
- API 응답 시간
- 버그 발생 여부
```

**Day 4-5: 베타 테스트 (친구 5명)**
```bash
# TestFlight 배포 (iOS)
eas build --platform ios --profile preview
eas submit --platform ios --profile preview

# Google Play 내부 테스트 (Android)
eas build --platform android --profile preview
eas submit --platform android
```

**피드백 수집**:
- 구글 폼 생성
- 설문 항목:
  1. 알림 타이밍이 적절했나요? (1-5점)
  2. UI가 직관적인가요?
  3. 가장 유용한 기능은?
  4. 개선이 필요한 부분은?
  5. 다른 사람에게 추천하시겠습니까?

---

### Week 12: 배포 준비

**Day 1-2: 최종 버그 수정**
- 베타 피드백 반영
- 크리티컬 버그 수정
- 퍼포먼스 최적화

**Day 3: 스토어 자료 준비**
```
App Store / Google Play 제출 자료:

1. 앱 아이콘 (1024x1024)
2. 스크린샷 5-8장
   - 메인 화면
   - 경로 입력
   - 실시간 알림
   - 환승 가이드
   - 설정 화면

3. 앱 설명 (한글/영문)
   제목: TimeRight - 실시간 대중교통 알림
   부제: 버스를 놓치지 마세요!
   
   설명:
   TimeRight는 버스와 지하철을 놓치지 않도록 도와주는
   실시간 대중교통 네비게이션 앱입니다.
   
   🏃 주요 기능:
   - 실시간 행동 가이드 ("지금 뛰어!")
   - 버스 정류장 자동 감지
   - 환승 타이밍 알림
   - 신호등 대기 시간 예측
   
   ✅ 서울 지역 최적화
   
   키워드:
   대중교통, 버스, 지하철, 네비게이션, 알림, 서울, 환승

4. 개인정보 처리방침
5. 이용약관
```

**Day 4: 앱스토어 제출**
```bash
# iOS
eas build --platform ios --profile production
eas submit --platform ios

# Android
eas build --platform android --profile production
eas submit --platform android
```

**Day 5: 모니터링 설정**
```javascript
// Sentry 에러 추적
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableAutoSessionTracking: true,
  sessionTrackingIntervalMillis: 10000,
});

// Firebase Analytics
import analytics from '@react-native-firebase/analytics';

// 주요 이벤트 추적
await analytics().logEvent('route_started', {
  from: startPoint,
  to: endPoint,
});

await analytics().logEvent('notification_sent', {
  type: decision.action,
  urgency: decision.urgency,
});
```

---

## 완료 후 계획

### Phase 5: 운영 & 개선 (진행 중)

**Week 13+: 사용자 데이터 수집**
```javascript
// 익명화된 데이터 수집
class AnalyticsService {
  logAccuracy(predicted, actual) {
    // 예측 정확도 기록
    analytics().logEvent('prediction_accuracy', {
      predicted_time: predicted,
      actual_time: actual,
      diff: Math.abs(predicted - actual),
    });
  }

  logSignalPattern(signalId, waitTime) {
    // 신호등 패턴 학습 데이터
    analytics().logEvent('signal_crossing', {
      signal_id: signalId,
      wait_time: waitTime,
      timestamp: Date.now(),
    });
  }
}
```

**주요 개선 사항**:
1. **알림 정확도 향상**
   - 머신러닝 모델 도입
   - 개인별 보행 속도 학습
   
2. **전국 확대**
   - 크라우드소싱 데이터 축적
   - 부산/대전/대구 지원

3. **추가 기능**
   - 음성 안내
   - 스마트워치 연동
   - 친구와 경로 공유

---

## 체크리스트 요약

### Phase 1 ✅
- [x] Bolt.new 프로토타입
- [x] 환경 설정
- [x] API 연구

### Phase 2 🚧
- [ ] GPS 추적
- [ ] Geofencing
- [ ] API 연동

### Phase 3 ⏳
- [ ] 알림 로직
- [ ] 배터리 최적화
- [ ] 테스트

### Phase 4 ⏳
- [ ] 알파 테스트
- [ ] 베타 테스트
- [ ] 앱스토어 배포

---

**예상 소요 시간**: 2-4개월 (주 15시간 기준)
**총 개발 시간**: 200-250시간
**예상 비용**: ~$200

**다음**: [API 가이드](API_GUIDE.md)에서 API 연동 상세 정보 확인
