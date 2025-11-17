# TimeRight - 실시간 대중교통 네비게이션

> "지금 뛰어!" - 버스를 놓치지 않도록 도와주는 실시간 알림 앱

## 🎯 프로젝트 개요

TimeRight는 기존 지도 앱과 차별화된 **실시간 행동 가이드**를 제공하는 대중교통 네비게이션 앱입니다.

### 핵심 기능
- 🏃 **개인화된 행동 알림**: 사용자의 걷기 속도를 측정하여 맞춤 알림 제공
- 🤖 **ML 기반 속도 예측**: 시간대, 날씨 등을 고려한 정확한 도착 시간 계산
- 🚌 **버스 정류장 자동 감지**: Geofencing으로 정류장 접근 시 자동 알림
- 🚇 **환승 타이밍 알림**: "환승 지하철 3분 후 도착, 서두르세요!"
- 🚦 **신호등 대기 시간 예측**: 서울 지역 실시간 신호 API 연동
- 🔋 **배터리 최적화**: 지능적 GPS 폴링으로 배터리 소모 최소화

### 기존 앱과의 차이점

| 기능 | 카카오맵/네이버지도 | TimeRight |
|------|-------------------|-----------|
| 경로 안내 | ✅ | ✅ |
| 실시간 대중교통 정보 | ✅ | ✅ |
| 개인화된 속도 측정 | ❌ | ✅ 온보딩 시 측정 |
| ML 기반 도착 예측 | ❌ | ✅ 시간대/날씨 고려 |
| 상황별 행동 알림 | ❌ | ✅ "지금 뛰어!" |
| 환승 타이밍 | ❌ | ✅ "3분 후 도착" |
| 신호등 대기 예측 | ❌ | ✅ (서울) |
| Geofencing | ❌ | ✅ 자동 감지 |

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+
- React Native CLI
- Xcode (iOS) / Android Studio (Android)
- 서울시 공공 API 키 (무료)

### 설치

```bash
# 레포지토리 클론
git clone https://github.com/Hyunbin-code/map.git
cd map

# 의존성 설치
npm install

# iOS
cd ios && pod install && cd ..
npx react-native run-ios

# Android
npx react-native run-android
```

### 환경 변수 설정

```bash
# .env 파일 생성
SEOUL_BUS_API_KEY=your_api_key_here
SEOUL_SUBWAY_API_KEY=your_api_key_here
SEOUL_TRAFFIC_SIGNAL_API_KEY=your_api_key_here
```

## 📚 문서

- [시스템 아키텍처](ARCHITECTURE.md) - 상세한 시스템 설계 및 알고리즘
- [개발 로드맵](ROADMAP.md) - 주차별 개발 계획 (2-4개월)
- [API 가이드](API_GUIDE.md) - 대중교통 API 연동 상세 가이드

## 🛠 기술 스택

### 프론트엔드
- **React Native** (Expo) - 크로스플랫폼 모바일 앱
- **TypeScript** - 타입 안정성
- **React Navigation** - 네비게이션
- **Zustand** - 상태 관리

### 핵심 라이브러리
- `react-native-maps` - 지도 표시
- `react-native-background-geolocation` - GPS 추적
- `react-native-push-notification` - 로컬 알림
- `axios` - API 통신

### 외부 API
- 서울시 버스 실시간 도착 정보
- 서울시 지하철 실시간 도착 정보
- 서울시 교통 신호 정보 (788개소)
- 카카오맵/네이버 지도 API

## 🎨 주요 화면

### 0. 온보딩 (속도 측정)
```
┌─────────────────────┐
│  🏃 TimeRight        │
│                     │
│  당신의 걸음을        │
│  이해하고 싶어요     │
│                     │
│  [10초 테스트]       │
│  평소처럼 걸으면서    │
│  직진해주세요         │
│                     │
│  ✅ 4.3 km/h         │
│  평균보다 빠른 편!    │
└─────────────────────┘
```

### 1. 경로 입력 (카카오맵 스타일)
```
┌─────────────────────┐
│  🔵 출발지: 강남역   │
│  🎯 도착지: 코엑스   │
│  ⇅                  │
└─────────────────────┘
  [전체 화면 지도]
┌─────────────────────┐
│  23분 • 2.3km       │
│  🚶 5분 🚌 54번     │
│  [출발하기 🚀]      │
└─────────────────────┘
```

### 2. 실시간 알림 (개인화)
```
┌─────────────────────┐
│  🏃 지금 뛰어야 해요!  │
│                     │
│  당신의 속도: 4.3km/h│
│  54번 버스           │
│  3분 후 도착          │
│  정류장까지 300m     │
└─────────────────────┘
```

### 3. 환승 가이드
```
┌─────────────────────┐
│  🚇 환승 타이밍       │
│                     │
│  2호선 → 3호선       │
│  이동시간: 2분        │
│  열차 도착: 3분 후    │
│                     │
│  ✅ 여유있게 가세요   │
└─────────────────────┘
```

## 🧪 프로토타입

인터랙티브 프로토타입은 `/prototypes` 폴더에서 확인할 수 있습니다:

- **timeright-complete.html**: 온보딩부터 지도까지 전체 플로우
  - 10초 걷기 속도 측정
  - 카카오맵 스타일 UI
  - 개인화된 알림 시스템
  - 실시간 경로 애니메이션

브라우저에서 HTML 파일을 열어 체험해보세요!

## 📊 개발 현황

### Phase 1: 프로토타입 ✅ (완료)
- [x] 기본 UI 설계
- [x] 온보딩 플로우 (속도 측정) 구현
- [x] 카카오맵 스타일 인터페이스
- [x] ML 기반 속도 예측 알고리즘 설계
- [x] 인터랙티브 프로토타입 제작
- [x] UX 검증

### Phase 2: MVP 개발 🚧 (진행 중)
- [ ] Week 1-2: 환경 설정 + 기본 UI
- [ ] Week 3-6: GPS 추적 + Geofencing
- [ ] Week 7-10: 대중교통 API 연동
- [ ] Week 11-14: 알림 로직 + 최적화
- [ ] Week 15-16: 테스트 + 배포

자세한 로드맵은 [ROADMAP.md](ROADMAP.md) 참고

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

MIT License - 자세한 내용은 [LICENSE](LICENSE) 파일 참고

## 📧 연락처

- GitHub: [@Hyunbin-code](https://github.com/Hyunbin-code)
- 이슈: [GitHub Issues](https://github.com/Hyunbin-code/map/issues)

## 🙏 감사의 말

- 서울시 공공 데이터 포털
- React Native 커뮤니티
- 모든 기여자들

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**
