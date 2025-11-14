# TimeRight - 실시간 대중교통 네비게이션

> "지금 뛰어!" - 버스를 놓치지 않도록 도와주는 실시간 알림 앱

## 🎯 프로젝트 개요

TimeRight는 기존 지도 앱과 차별화된 **실시간 행동 가이드**를 제공하는 대중교통 네비게이션 앱입니다.

### 핵심 기능
- 🏃 **실시간 행동 알림**: "지금 뛰어야 해요!", "여유있게 가세요" 등 상황별 알림
- 🚌 **버스 정류장 자동 감지**: Geofencing으로 정류장 접근 시 자동 알림
- 🚇 **환승 타이밍 알림**: "환승 지하철 3분 후 도착, 서두르세요!"
- 🚦 **신호등 대기 시간 예측**: 서울 지역 실시간 신호 API 연동
- 🔋 **배터리 최적화**: 지능적 GPS 폴링으로 배터리 소모 최소화

## 🚀 빠른 시작

### 필수 요구사항
- Node.js 18+
- Expo CLI
- Expo Go 앱 (테스트용)

### 설치

```bash
# 레포지토리 클론
git clone https://github.com/Hyunbin-code/map.git
cd map/TimeRight

# 의존성 설치
npm install

# 환경 변수 설정
cp .env.example .env
# .env 파일을 열어서 API 키를 입력하세요

# 개발 서버 시작
npm start

# iOS
npm run ios

# Android
npm run android
```

### 환경 변수 설정

`.env` 파일에 다음 API 키를 설정하세요:

```bash
EXPO_PUBLIC_SEOUL_BUS_API_KEY=your_api_key_here
EXPO_PUBLIC_SEOUL_SUBWAY_API_KEY=your_api_key_here
EXPO_PUBLIC_SEOUL_TRAFFIC_SIGNAL_API_KEY=your_api_key_here
```

API 키 발급:
- 서울시 버스/지하철: https://www.data.go.kr/
- 서울시 신호등: https://t-data.seoul.go.kr/

## 🛠 기술 스택

### 프론트엔드
- **React Native** (Expo) - 크로스플랫폼 모바일 앱
- **TypeScript** - 타입 안정성
- **Zustand** - 상태 관리

### 핵심 라이브러리
- `expo-location` - GPS 추적
- `react-native-maps` - 지도 표시
- `expo-notifications` - 로컬 알림
- `axios` - API 통신

### 외부 API
- 서울시 버스 실시간 도착 정보
- 서울시 지하철 실시간 도착 정보
- 서울시 교통 신호 정보 (788개소)

## 📁 프로젝트 구조

```
TimeRight/
├── src/
│   ├── services/           # 비즈니스 로직
│   │   ├── DecisionEngine.ts    # 핵심 알림 결정 알고리즘
│   │   ├── LocationService.ts   # GPS 추적
│   │   └── BusAPIService.ts     # 버스 API
│   ├── screens/            # 화면 컴포넌트
│   │   └── HomeScreen.tsx
│   ├── components/         # UI 컴포넌트
│   ├── stores/             # Zustand 상태 관리
│   │   └── useStore.ts
│   ├── types/              # TypeScript 타입
│   │   └── index.ts
│   └── utils/              # 유틸리티 함수
├── App.tsx                 # 메인 앱
└── package.json
```

## 💡 주요 알고리즘

### 행동 결정 알고리즘

TimeRight의 핵심은 "지금 뛰어야 하는가"를 결정하는 알고리즘입니다.

```typescript
필요한 시간 = (거리 ÷ 보행속도) + 신호등대기시간 + 안전마진

if (버스도착시간 - 필요한시간 < 30초) {
  return "🏃 지금 뛰어야 해요!";
} else if (버스도착시간 - 필요한시간 < 60초) {
  return "🚶 조금 서두르세요";
} else {
  return "✅ 여유있게 가세요";
}
```

자세한 알고리즘은 [ARCHITECTURE.md](../ARCHITECTURE.md) 참고

## 🎨 사용 방법

1. **위치 추적 시작**: "위치 추적 시작" 버튼 클릭
2. **테스트 실행**: "테스트 실행" 버튼으로 알림 확인
3. **실시간 알림**: 버스 정류장 근처에서 실시간 알림 수신

## 📊 개발 현황

- ✅ 프로젝트 구조 설정
- ✅ 핵심 알고리즘 구현
- ✅ GPS 위치 추적
- ✅ 버스 API 연동 (Mock)
- ✅ 기본 UI 구현
- 🚧 실제 API 연동
- 🚧 지도 표시
- 🚧 알림 시스템
- ⏳ 베타 테스트
- ⏳ 앱스토어 배포

## 🤝 기여하기

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 라이선스

MIT License

## 📧 연락처

- GitHub: [@Hyunbin-code](https://github.com/Hyunbin-code)
- 이슈: [GitHub Issues](https://github.com/Hyunbin-code/map/issues)

---

**⭐ 이 프로젝트가 도움이 되었다면 Star를 눌러주세요!**
