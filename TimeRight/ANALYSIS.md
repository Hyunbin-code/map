# TimeRight 프로젝트 구조 분석 및 개선 계획

## 📋 프로젝트 개요

**목표**: 실시간 대중교통 알림 앱 (버스를 놓치지 않도록 "지금 뛰어!" 알림)

**기술 스택**:
- React Native + Expo
- TypeScript
- Zustand (상태 관리)
- expo-location (GPS)
- expo-notifications (Push 알림)
- react-native-maps (지도)

---

## 🏗️ 현재 구조

```
TimeRight/
├── src/
│   ├── types/
│   │   └── index.ts                  # 타입 정의
│   ├── services/
│   │   ├── LocationService.ts        # GPS 추적
│   │   ├── BusAPIService.ts          # 버스 API (Mock)
│   │   ├── DecisionEngine.ts         # 행동 결정 로직
│   │   ├── NotificationService.ts    # Push 알림
│   │   └── NavigationService.ts      # 자동 모니터링
│   ├── stores/
│   │   └── useStore.ts               # Zustand 상태 관리
│   ├── data/
│   │   └── busStops.ts               # 정류장 데이터 (Mock)
│   └── screens/
│       └── HomeScreen.tsx            # 메인 화면
├── __tests__/
│   ├── DecisionEngine.test.ts
│   └── busStops.test.ts
└── App.tsx
```

---

## 🐛 발견된 버그 및 문제점

### **1. NavigationService - 순환 참조 위험**

**문제**: NavigationService에서 useStore를 동적으로 import
```typescript
const { useStore } = require('../stores/useStore');
return useStore.getState().userLocation;
```

**위험성**:
- require()는 TypeScript의 타입 안정성을 무시
- 순환 참조 발생 가능
- 테스트하기 어려움

**해결책**:
- 콜백 패턴 사용
- userLocation을 NavigationService.start()에 전달하거나
- 별도의 LocationProvider 만들기

---

### **2. NotificationService - 권한 처리 미흡**

**문제**: 권한이 거부되면 조용히 실패
```typescript
if (finalStatus !== 'granted') {
  console.warn('[NotificationService] Permission not granted');
  return; // 에러를 던지지 않음
}
```

**위험성**:
- 사용자는 알림이 작동한다고 생각하지만 실제로는 작동 안 함
- UI에 피드백 없음

**해결책**:
- 권한 상태를 반환
- UI에서 권한 요청 유도

---

### **3. DecisionEngine - 신호등 대기 시간 추정 부정확**

**문제**: NavigationService에서 거리 기반 추정
```typescript
private estimateSignalWaitTimes(distance: number): number[] {
  const signalCount = Math.floor(distance / 100);
  // 각 신호등마다 평균 30초 가정
  for (let i = 0; i < signalCount; i++) {
    waitTimes.push(30);
  }
}
```

**위험성**:
- 실제 신호등 위치를 모름
- 모든 신호등이 30초라고 가정 (부정확)

**해결책**:
- 실제 신호등 API 연동 필요 (서울시)
- 또는 ML 모델로 학습된 데이터 사용

---

### **4. HomeScreen - 메모리 누수 가능성**

**문제**: useEffect cleanup이 의존성 배열에 의존
```typescript
useEffect(() => {
  return () => {
    if (isTracking) {
      LocationService.stopTracking();
    }
    if (isNavigating) {
      NavigationService.stop();
    }
  };
}, [isTracking, isNavigating]);
```

**위험성**:
- isTracking/isNavigating이 변경될 때마다 cleanup 재생성
- 불필요한 stop() 호출

**해결책**:
- 의존성 배열 제거하고 ref 사용
- 또는 컴포넌트 언마운트 시에만 cleanup

---

### **5. LocationService - 배터리 최적화 없음**

**문제**: 항상 HIGH accuracy + 5초 간격
```typescript
accuracy: ExpoLocation.Accuracy.High,
distanceInterval: 10,
timeInterval: 5000,
```

**위험성**:
- 배터리 빠르게 소모
- 저전력 모드에서 문제

**해결책**:
- 배터리 레벨 감지
- 적응형 정확도 조정

---

### **6. BusAPIService - 캐시 만료 처리 미흡**

**문제**: 오래된 캐시 데이터가 계속 사용될 수 있음
```typescript
if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
  return cached.data;
}
```

**위험성**:
- API 오류 시 30초 이상 오래된 데이터 반환
- 사용자가 최신 정보를 보지 못함

**해결책**:
- stale-while-revalidate 패턴
- 백그라운드에서 새 데이터 가져오기

---

### **7. 타입 안전성 문제**

**문제**: NodeJS.Timeout 타입 사용
```typescript
private intervalId: NodeJS.Timeout | null = null;
```

**위험성**:
- React Native 환경에서 NodeJS 타입 사용
- 크로스 플랫폼 호환성 문제

**해결책**:
- number 타입 사용 (React Native standard)

---

## 🔧 개선 계획

### **Phase 1: 버그 수정 (우선순위: 높음)**

1. ✅ NavigationService 순환 참조 제거
2. ✅ NotificationService 권한 처리 개선
3. ✅ HomeScreen cleanup 로직 수정
4. ✅ 타입 안전성 개선 (NodeJS.Timeout → number)

### **Phase 2: 로직 개선 (우선순위: 중간)**

5. ✅ DecisionEngine 로직 검증 및 개선
6. ✅ BusAPIService 캐시 전략 개선
7. ✅ LocationService 배터리 최적화

### **Phase 3: 기능 추가 (우선순위: 낮음)**

8. ⏳ 실제 서울시 버스 API 연동
9. ⏳ Geofencing (정류장 근처 자동 감지)
10. ⏳ 백그라운드 위치 추적

---

## 📊 성능 최적화 계획

### **1. 배터리 최적화**

```typescript
// 현재: 항상 HIGH accuracy
accuracy: ExpoLocation.Accuracy.High

// 개선: 적응형 정확도
- 배터리 > 50%: HIGH
- 배터리 20-50%: BALANCED
- 배터리 < 20%: LOW
- 저전력 모드: LOW
```

### **2. 네트워크 최적화**

```typescript
// 현재: 5초마다 API 호출
- 거리 > 1km: 30초 간격
- 거리 500m-1km: 15초 간격
- 거리 200m-500m: 10초 간격
- 거리 < 200m: 5초 간격
```

### **3. 메모리 최적화**

- FlatList 대신 VirtualizedList 사용
- 이미지 lazy loading
- 불필요한 re-render 방지 (React.memo)

---

## 🎯 앞으로의 개발 로드맵

### **Week 1-2: 버그 수정 및 안정화**
- [ ] 위에서 발견된 7가지 버그 수정
- [ ] 단위 테스트 추가 (커버리지 > 80%)
- [ ] E2E 테스트 (Detox)

### **Week 3-4: 실제 API 연동**
- [ ] 서울시 버스 API 키 발급
- [ ] BusAPIService 실제 API 연동
- [ ] 에러 처리 강화 (retry, fallback)

### **Week 5-6: 성능 최적화**
- [ ] 배터리 최적화 구현
- [ ] 네트워크 호출 최적화
- [ ] 메모리 프로파일링

### **Week 7-8: 고급 기능**
- [ ] Geofencing 구현
- [ ] 백그라운드 위치 추적
- [ ] 음성 알림 (TTS)

### **Week 9-10: 배포 준비**
- [ ] 버그 수정
- [ ] 성능 테스트
- [ ] 앱스토어 제출 준비

---

## 📝 코드 품질 개선

### **현재 상태**
- TypeScript: ✅ 100% 사용
- 테스트: ⚠️ 부분적 (DecisionEngine, busStops만)
- 문서화: ⚠️ 부분적 (README, 주석 부족)
- Linting: ❌ 미설정

### **목표**
- [ ] ESLint + Prettier 설정
- [ ] 모든 서비스에 테스트 추가
- [ ] JSDoc 주석 추가
- [ ] CI/CD 파이프라인 (GitHub Actions)

---

## 🔍 로직 개선 아이디어

### **1. 머신러닝 기반 예측**

현재 고정된 보행 속도 (1.2m/s) 대신:
- 사용자별 평균 보행 속도 학습
- 시간대별 혼잡도 예측
- 날씨 정보 반영 (비 오면 느려짐)

```typescript
interface UserProfile {
  avgWalkSpeed: number;      // 개인별 학습
  avgRunSpeed: number;
  reactionTime: number;       // 알림 후 행동까지 시간
  confidence: number;         // 데이터 신뢰도
}
```

### **2. 다중 경로 지원**

현재 단일 정류장 → 복수 정류장 비교
```typescript
interface RouteOption {
  stop: Stop;
  distance: number;
  busArrival: number;
  probability: number;  // 성공 확률
  recommendation: 'BEST' | 'ALTERNATIVE' | 'BACKUP';
}
```

### **3. 실시간 교통 정보 반영**

- 도로 혼잡도 API
- 날씨 API (비 오면 보행 속도 감소)
- 이벤트 정보 (행사로 인한 혼잡)

---

## 🎨 UI/UX 개선 아이디어

### **1. 더 나은 시각화**

- 정류장까지 경로 라인 표시
- 예상 도착 시간 카운트다운
- 버스 실시간 위치 표시

### **2. 스마트 알림**

- 진동 패턴 커스터마이징 (긴급도에 따라)
- 스마트워치 연동 (WearOS, watchOS)
- 위젯 지원

### **3. 사용자 설정**

- 보행 속도 조정
- 안전 마진 설정
- 알림 빈도 조절

---

## 🚀 기술적 도전 과제

### **1. 백그라운드 실행**

- iOS: Background Modes 권한 필요
- Android: Foreground Service 필요
- 배터리 최적화와 상충

### **2. 정확도 향상**

- GPS 오차 (5-30m)
- 신호등 위치 정확도
- 버스 API 지연 (실시간이 아닐 수 있음)

### **3. 확장성**

- 서울 외 지역 지원
- 버스뿐만 아니라 지하철, 자전거 등
- 다국어 지원

---

## 📈 성공 지표 (KPI)

### **사용자 경험**
- 알림 정확도: > 90%
- 앱 응답 시간: < 1초
- 배터리 소모: < 5% per hour

### **기술 지표**
- 테스트 커버리지: > 80%
- 크래시율: < 0.1%
- API 응답 시간: < 500ms

### **비즈니스 지표**
- DAU (Daily Active Users)
- 알림 클릭률
- 사용자 만족도 (앱스토어 평점)

---

## 📚 참고 자료

- [Expo Location](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [서울시 버스 API](http://data.seoul.go.kr/)
- [React Native Maps](https://github.com/react-native-maps/react-native-maps)
- [Zustand](https://github.com/pmndrs/zustand)

---

**작성일**: 2025-01-15
**작성자**: Claude (AI Assistant)
**버전**: 1.0
