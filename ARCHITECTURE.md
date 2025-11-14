# 시스템 아키텍처 및 알고리즘 상세

## 목차
1. [시스템 아키텍처](#시스템-아키텍처)
2. [핵심 알고리즘](#핵심-알고리즘)
3. [데이터 흐름](#데이터-흐름)
4. [주의사항 및 해결 방법](#주의사항-및-해결-방법)
5. [최적화 전략](#최적화-전략)

---

## 시스템 아키텍처

### 전체 구조

```
┌─────────────────────────────────────────────────────┐
│                     사용자 앱                         │
├─────────────────────────────────────────────────────┤
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │  UI 레이어 │  │ 상태 관리  │  │ 알림 시스템 │         │
│  │ (React)  │  │(Zustand) │  │(Push Notif)│         │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                       │
│  ┌──────────────────────────────────────┐           │
│  │        비즈니스 로직 레이어            │           │
│  │  - 경로 계산 엔진                     │           │
│  │  - 타이밍 분석 엔진                   │           │
│  │  - 알림 결정 엔진                     │           │
│  └──────────────────────────────────────┘           │
│                                                       │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐          │
│  │ GPS 추적  │  │Geofencing│  │ API 클라이언트│       │
│  │  서비스   │  │  서비스   │  │   레이어    │        │
│  └──────────┘  └──────────┘  └──────────┘          │
│                                                       │
└─────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────┐
│                  외부 서비스                          │
├─────────────────────────────────────────────────────┤
│  • 서울시 버스 API                                    │
│  • 서울시 지하철 API                                  │
│  • 서울시 신호등 API (788개소)                        │
│  • 카카오맵/네이버 지도 API                           │
└─────────────────────────────────────────────────────┘
```

### 컴포넌트 세부 설명

#### 1. GPS 추적 서비스
**역할**: 사용자의 실시간 위치를 추적하고 이동 상태를 감지

**핵심 기능**:
```javascript
// GPS 추적 모드
const GPSMode = {
  STOPPED: 0,      // 정지 상태 (폴링 간격: 60초)
  WALKING: 1,      // 도보 이동 (폴링 간격: 5초)
  RUNNING: 2,      // 빠른 이동 (폴링 간격: 2초)
  IN_TRANSIT: 3,   // 대중교통 탑승 중 (폴링 간격: 10초)
};
```

**동작 원리**:
1. 속도 기반 모드 전환
   - 0-1 km/h → STOPPED
   - 1-5 km/h → WALKING
   - 5-10 km/h → RUNNING
   - 10+ km/h → IN_TRANSIT

2. 배터리 최적화
   - 정지 중: GPS 최소화, 유의미한 위치 변화만 감지
   - 이동 중: 고빈도 추적으로 정확도 향상

#### 2. Geofencing 서비스
**역할**: 버스 정류장/지하철역 진입/이탈 자동 감지

**Geofence 설정**:
```javascript
const createGeofence = (location) => ({
  identifier: location.id,
  latitude: location.lat,
  longitude: location.lng,
  radius: 100, // 미터 (버스 정류장)
  // 지하철역은 150m (출입구 여러 개)
  notifyOnEntry: true,
  notifyOnExit: true,
});
```

**진입 감지 시나리오**:
```
사용자 위치 → 정류장 150m
              ↓
         [Geofence 대기 상태]
              ↓
사용자 위치 → 정류장 100m (진입!)
              ↓
         [알림 트리거]
         "버스 정류장 도착!"
              ↓
    [실시간 버스 도착 정보 조회]
```

---

## 핵심 알고리즘

### 1. 행동 결정 알고리즘 (Core Decision Engine)

이 알고리즘이 앱의 핵심이다. "뛰어야 하는가, 천천히 가도 되는가"를 결정한다.

#### 입력 변수
```javascript
const inputs = {
  userLocation: { lat, lng },           // 사용자 현재 위치
  targetLocation: { lat, lng },         // 목표 지점 (버스 정류장/지하철역)
  busArrivalTime: 180,                  // 버스 도착까지 시간 (초)
  walkingSpeed: 1.2,                    // 사용자 평균 보행 속도 (m/s)
  distanceToTarget: 300,                // 목표까지 거리 (m)
  trafficSignals: [                     // 경로 상 신호등 정보
    { id: 'signal_1', timeToRed: 30, cycleTime: 90 }
  ]
};
```

#### 알고리즘 단계

**Step 1: 순수 이동 시간 계산**
```javascript
// 거리 ÷ 속도 = 시간
const pureWalkTime = distanceToTarget / walkingSpeed;
// 300m ÷ 1.2m/s = 250초 (약 4분 10초)
```

**Step 2: 신호등 대기 시간 추가**
```javascript
let totalWaitTime = 0;

for (const signal of trafficSignals) {
  if (signal.api_available) {
    // 서울: 실시간 API 사용
    totalWaitTime += signal.currentRedTime;
  } else {
    // 서울 외: 보수적 추정
    // 최악의 경우 = 전체 사이클 대기
    totalWaitTime += signal.estimatedCycleTime * 0.7; // 70% 가정
  }
}

// 예: 신호등 2개, 각 60초 대기 → 120초
```

**Step 3: 안전 마진 추가**
```javascript
const SAFETY_MARGIN = 30; // 30초 여유
const totalRequiredTime = pureWalkTime + totalWaitTime + SAFETY_MARGIN;
// 250 + 120 + 30 = 400초 (6분 40초)
```

**Step 4: 결정 로직**
```javascript
function decideAction(busArrivalTime, totalRequiredTime) {
  const timeDiff = busArrivalTime - totalRequiredTime;
  
  if (timeDiff < 0) {
    // 버스 놓침
    return {
      action: 'MISSED',
      message: '😢 이번 버스는 놓쳤어요',
      color: 'red',
      vibrate: false,
    };
  } else if (timeDiff < 30) {
    // 뛰어야 함
    return {
      action: 'RUN',
      message: '🏃 지금 빠르게 이동하세요!',
      urgency: 'HIGH',
      color: 'red',
      vibrate: true,
      voiceAlert: true, // 음성 알림
    };
  } else if (timeDiff < 60) {
    // 빠르게 걷기
    return {
      action: 'WALK_FAST',
      message: '🚶 조금 서두르세요',
      urgency: 'MEDIUM',
      color: 'orange',
      vibrate: true,
    };
  } else {
    // 여유있음
    return {
      action: 'WALK_NORMAL',
      message: '✅ 여유있게 가세요',
      urgency: 'LOW',
      color: 'green',
      vibrate: false,
    };
  }
}
```

#### 실제 예시

**시나리오 A: 뛰어야 하는 경우**
```
사용자 위치: 정류장에서 400m
버스 도착: 4분 후 (240초)
보행 속도: 1.2m/s
신호등: 2개 (각 평균 50초 대기)

계산:
- 순수 이동 시간: 400 ÷ 1.2 = 333초
- 신호 대기: 100초
- 안전 마진: 30초
- 총 필요 시간: 463초

판정: 463 > 240 → "지금 뛰어야 해요!" 🏃
```

**시나리오 B: 여유있는 경우**
```
사용자 위치: 정류장에서 200m
버스 도착: 10분 후 (600초)
보행 속도: 1.2m/s
신호등: 1개 (평균 40초 대기)

계산:
- 순수 이동 시간: 200 ÷ 1.2 = 167초
- 신호 대기: 40초
- 안전 마진: 30초
- 총 필요 시간: 237초

판정: 600 - 237 = 363초 여유 → "여유있게 가세요" ✅
```

---

### 2. 환승 타이밍 알고리즘

환승역에서 "지금 뛸지, 다음 열차를 탈지" 결정

#### 입력 변수
```javascript
const transferInputs = {
  currentLine: '2호선',
  targetLine: '3호선',
  platformDistance: 180,        // 플랫폼 간 거리 (m)
  stairCount: 2,                // 계단/에스컬레이터 개수
  crowdLevel: 'MEDIUM',         // 혼잡도
  nextTrainArrival: 180,        // 다음 열차 도착 (초)
  userWalkSpeed: 1.2,           // 사용자 속도 (m/s)
};
```

#### 환승 시간 계산
```javascript
function calculateTransferTime(inputs) {
  // 기본 이동 시간
  let baseTime = inputs.platformDistance / inputs.userWalkSpeed;
  
  // 계단/에스컬레이터 보정
  const stairPenalty = inputs.stairCount * 15; // 각 15초 추가
  
  // 혼잡도 보정
  const crowdMultiplier = {
    'LOW': 1.0,
    'MEDIUM': 1.2,
    'HIGH': 1.5,
  }[inputs.crowdLevel];
  
  // 안전 마진
  const safetyMargin = 20;
  
  const totalTime = (baseTime + stairPenalty) * crowdMultiplier + safetyMargin;
  
  return Math.ceil(totalTime);
}

// 예: 180m, 계단 2개, 중간 혼잡
// (180/1.2 + 30) * 1.2 + 20 = 254초 (약 4분 15초)
```

#### 결정 로직
```javascript
function decideTransferAction(transferTime, nextTrainArrival) {
  if (nextTrainArrival < transferTime) {
    return {
      action: 'WAIT_NEXT_TRAIN',
      message: '⏳ 다음 열차를 타세요\n(현재 열차는 놓칠 확률 높음)',
      nextTrain: nextTrainArrival + 300, // 다음 열차 시간
    };
  } else if (nextTrainArrival - transferTime < 30) {
    return {
      action: 'RUN',
      message: '🏃 빠르게 환승하세요!\n열차가 곧 출발합니다',
      urgency: 'HIGH',
    };
  } else {
    return {
      action: 'WALK',
      message: '✅ 여유있게 환승하세요\n도착까지 ' + (nextTrainArrival - transferTime) + '초 남음',
      urgency: 'LOW',
    };
  }
}
```

---

### 3. 신호등 예측 알고리즘

#### 서울 (실시간 API 있음)
```javascript
async function getSignalTiming(signalId) {
  const response = await fetch(
    `https://t-data.seoul.go.kr/apig/apiman-gateway/tapi/v2xSignalPhaseTimingInformation/1.0`,
    {
      params: { signalId }
    }
  );
  
  const data = response.data;
  
  return {
    currentPhase: data.current_phase, // 'RED' | 'GREEN'
    timeRemaining: data.time_remaining, // 초
    cycleTime: data.cycle_time, // 전체 사이클 (초)
    confidence: 1.0, // 100% 정확
  };
}
```

#### 서울 외 (크라우드소싱 학습)
```javascript
class SignalLearner {
  constructor() {
    this.patterns = {}; // { signalId: { samples: [], avgCycle: 0 } }
  }
  
  // 사용자가 신호를 통과할 때마다 기록
  recordCrossing(signalId, waitTime) {
    if (!this.patterns[signalId]) {
      this.patterns[signalId] = { samples: [], avgCycle: 0 };
    }
    
    this.patterns[signalId].samples.push({
      waitTime,
      timestamp: Date.now(),
    });
    
    // 평균 계산 (최근 100개 샘플)
    const recent = this.patterns[signalId].samples.slice(-100);
    this.patterns[signalId].avgCycle = 
      recent.reduce((sum, s) => sum + s.waitTime, 0) / recent.length;
  }
  
  // 예측
  predictWaitTime(signalId) {
    const pattern = this.patterns[signalId];
    
    if (!pattern || pattern.samples.length < 10) {
      // 데이터 부족: 보수적 추정
      return {
        waitTime: 60, // 기본 60초 가정
        confidence: 0.3, // 신뢰도 30%
      };
    }
    
    return {
      waitTime: pattern.avgCycle * 0.5, // 평균의 50% (통계적 기댓값)
      confidence: Math.min(pattern.samples.length / 100, 0.8), // 최대 80%
    };
  }
}
```

---

## 데이터 흐름

### 전체 플로우

```
[사용자가 경로 입력]
        ↓
[경로 계산 + 신호등/버스정류장 추출]
        ↓
[GPS 추적 시작]
        ↓
    ┌─────────────┐
    │ 위치 업데이트 │ ← 2-60초마다
    └─────────────┘
        ↓
[거리 계산 + 버스 도착 시간 조회]
        ↓
    ┌──────────────┐
    │ 알고리즘 실행  │
    └──────────────┘
        ↓
   [결정 도출]
        ↓
  ┌──────┴──────┐
  │  알림 필요?  │
  └──────┬──────┘
     YES │  NO
        ↓    └─→ [대기]
  [알림 전송]
        ↓
  [사용자 확인]
```

### 상태 관리 (Zustand)

```javascript
// store.js
import create from 'zustand';

const useStore = create((set, get) => ({
  // 사용자 상태
  userLocation: null,
  route: null,
  isTracking: false,
  
  // 대중교통 정보
  busArrivals: {},
  subwayArrivals: {},
  
  // 알림 상태
  lastNotification: null,
  notificationHistory: [],
  
  // Actions
  setUserLocation: (location) => set({ userLocation: location }),
  
  startTracking: () => {
    set({ isTracking: true });
    // GPS 추적 시작
    BackgroundGeolocation.start();
  },
  
  stopTracking: () => {
    set({ isTracking: false });
    BackgroundGeolocation.stop();
  },
  
  updateBusArrivals: async (stopId) => {
    const arrivals = await fetchBusArrivals(stopId);
    set((state) => ({
      busArrivals: {
        ...state.busArrivals,
        [stopId]: arrivals,
      },
    }));
  },
  
  sendNotification: (notification) => {
    const { lastNotification, notificationHistory } = get();
    
    // 중복 알림 방지 (30초 이내 같은 내용)
    if (
      lastNotification &&
      Date.now() - lastNotification.timestamp < 30000 &&
      lastNotification.message === notification.message
    ) {
      return; // 전송 안함
    }
    
    // 알림 전송
    LocalNotification.send(notification);
    
    // 기록
    set({
      lastNotification: {
        ...notification,
        timestamp: Date.now(),
      },
      notificationHistory: [
        ...notificationHistory,
        notification,
      ].slice(-50), // 최근 50개만 보관
    });
  },
}));
```

---

## 주의사항 및 해결 방법

### 1. 배터리 소모 문제

**문제**: GPS 지속 추적 = 배터리 급속 소모

**해결책**:

#### A. 적응형 폴링 간격
```javascript
function adjustGPSInterval(userState) {
  const { speed, isNearTarget, batteryLevel } = userState;
  
  // 배터리 20% 이하: 절약 모드
  if (batteryLevel < 20) {
    return 30000; // 30초 간격
  }
  
  // 목표 근처 (500m 이내): 고빈도
  if (isNearTarget) {
    return 2000; // 2초 간격
  }
  
  // 이동 중: 중간 빈도
  if (speed > 1) {
    return 5000; // 5초 간격
  }
  
  // 정지 중: 저빈도
  return 60000; // 60초 간격
}
```

#### B. Significant Location Change
```javascript
// iOS: 유의미한 위치 변화만 감지 (에너지 효율적)
BackgroundGeolocation.configure({
  desiredAccuracy: BackgroundGeolocation.HIGH_ACCURACY,
  stationaryRadius: 50,
  distanceFilter: 50, // 50m 이동 시에만 업데이트
  pauseLocationUpdatesAutomatically: true,
});
```

### 2. 위치 정확도 문제

**문제**: 지하철역/건물 내부에서 GPS 부정확

**해결책**:

#### A. WiFi/Beacon 보조
```javascript
// 주요 지하철역에 Beacon 설치 (향후 계획)
async function detectStationByBeacon() {
  const beacons = await BluetoothManager.scan();
  
  for (const beacon of beacons) {
    if (beacon.uuid.startsWith('SUBWAY_')) {
      return {
        type: 'SUBWAY_STATION',
        stationId: beacon.major,
        platformId: beacon.minor,
        accuracy: 'HIGH',
      };
    }
  }
  
  return null;
}
```

#### B. 마지막 알려진 위치 사용
```javascript
let lastKnownGoodLocation = null;

function updateLocation(newLocation) {
  // 정확도 체크
  if (newLocation.accuracy < 50) {
    // 50m 이내 정확도: 신뢰 가능
    lastKnownGoodLocation = newLocation;
    return newLocation;
  } else {
    // 부정확: 마지막 좋은 위치 사용
    console.warn('Low accuracy, using last known good location');
    return lastKnownGoodLocation;
  }
}
```

### 3. API 호출 비용/제한

**문제**: 실시간 API를 매번 호출하면 비용/제한 초과

**해결책**:

#### A. 로컬 캐싱
```javascript
class BusArrivalCache {
  constructor() {
    this.cache = new Map();
    this.TTL = 30000; // 30초 유효
  }
  
  async get(stopId) {
    const cached = this.cache.get(stopId);
    
    if (cached && Date.now() - cached.timestamp < this.TTL) {
      return cached.data; // 캐시 사용
    }
    
    // API 호출
    const fresh = await fetchBusArrivals(stopId);
    this.cache.set(stopId, {
      data: fresh,
      timestamp: Date.now(),
    });
    
    return fresh;
  }
}
```

#### B. 배치 요청
```javascript
// 한 번에 여러 정류장 조회 (가능한 경우)
async function fetchMultipleBusStops(stopIds) {
  const promises = stopIds.map(id => 
    fetch(`/api/bus/arrival?stopId=${id}`)
  );
  
  return Promise.all(promises);
}
```

### 4. 알림 스팸 방지

**문제**: 너무 잦은 알림 = 사용자 피로

**해결책**:

#### A. 알림 쿨다운
```javascript
const NOTIFICATION_COOLDOWN = {
  'RUN': 60000,        // 1분 (긴급)
  'WALK_FAST': 120000, // 2분
  'WALK_NORMAL': 300000, // 5분
};

function shouldSendNotification(type, lastSent) {
  if (!lastSent) return true;
  
  const elapsed = Date.now() - lastSent;
  return elapsed >= NOTIFICATION_COOLDOWN[type];
}
```

#### B. 상태 변경 시에만 알림
```javascript
let lastDecision = null;

function notifyIfChanged(newDecision) {
  if (!lastDecision || lastDecision.action !== newDecision.action) {
    sendNotification(newDecision);
    lastDecision = newDecision;
  }
}

// 예: "여유있음" → "여유있음" = 알림 안보냄
//     "여유있음" → "뛰어라" = 알림 보냄
```

---

## 최적화 전략

### 1. 코드 스플리팅
```javascript
// 지도 관련 코드는 lazy load
const MapView = React.lazy(() => import('./components/MapView'));

// API 클라이언트도 필요할 때만 로드
const BusAPI = await import('./services/BusAPI');
```

### 2. 이미지 최적화
```javascript
// react-native-fast-image 사용
import FastImage from 'react-native-fast-image';

<FastImage
  source={{ uri: busIcon, priority: FastImage.priority.high }}
  resizeMode={FastImage.resizeMode.contain}
/>
```

### 3. 메모리 관리
```javascript
// 사용 안하는 지도 타일 정리
useEffect(() => {
  return () => {
    mapRef.current?.clearTileCache();
  };
}, []);

// 알림 히스토리 제한
const MAX_HISTORY = 50;
if (notificationHistory.length > MAX_HISTORY) {
  notificationHistory = notificationHistory.slice(-MAX_HISTORY);
}
```

---

## 성능 벤치마크 목표

| 지표 | 목표 | 측정 방법 |
|------|------|----------|
| 앱 시작 시간 | < 2초 | Time to Interactive |
| 위치 업데이트 지연 | < 500ms | GPS 콜백 → UI 업데이트 |
| API 응답 시간 | < 1초 | fetch → 데이터 파싱 |
| 배터리 소모 | < 5%/시간 | 1시간 추적 테스트 |
| 메모리 사용량 | < 100MB | iOS Instruments |
| 알림 정확도 | > 85% | 실제 버스 도착 vs 예측 |

---

**다음**: [개발 로드맵](ROADMAP.md)에서 주차별 구현 계획 확인
