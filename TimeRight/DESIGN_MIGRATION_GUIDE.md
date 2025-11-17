# 🎨 디자인 마이그레이션 완료 가이드

## 📋 변경 사항 요약

### 새로 추가된 컴포넌트
1. **ActionAlert** (`src/components/ActionAlert.tsx`)
   - 실시간 행동 알림 (긴급/경고/정보)
   - Animated 애니메이션
   - 3가지 타입별 색상 시스템

2. **OnboardingSpeed** (`src/components/OnboardingSpeed.tsx`)
   - 걷기 속도 측정 온보딩
   - 3단계 플로우 (환영 → 측정 → 결과)
   - AsyncStorage 연동

3. **SearchBar** (`src/components/SearchBar.tsx`)
   - 출발/도착지 검색
   - **최근 검색 기록** (AsyncStorage, 삭제 가능)
   - **즐겨찾기** (가로 스크롤)
   - 확장/축소 UI

4. **RouteCard** (`src/components/RouteCard.tsx`)
   - 경로 카드 (걷기/버스/지하철 아이콘)
   - AI 인사이트 표시
   - **실시간 날씨 정보** (온도, 날씨 상태)
   - 배지 시스템

5. **NavigationView** (`src/components/NavigationView.tsx`)
   - 실시간 네비게이션 화면
   - 지도 + 단계별 안내
   - Progress bar
   - **잠금화면 알림** (음악 플레이어처럼)

### 새로 추가된 서비스
1. **WeatherService** (`src/services/WeatherService.ts`)
   - OpenWeather API 연동
   - 10분 캐시
   - 온도, 날씨 상태, 습도, 풍속

2. **HistoryService** (`src/services/HistoryService.ts`)
   - 검색 기록 관리 (최대 10개)
   - 중복 제거, 상대 시간 표시

3. **FavoritesService** (`src/services/FavoritesService.ts`)
   - 즐겨찾기 관리 (최대 20개)
   - 아이콘 지원 (🏠, 🏢, 🏫 등)

4. **NavigationNotificationService** (`src/services/NavigationNotificationService.ts`)
   - expo-notifications 기반
   - 잠금화면 persistent notification
   - 긴급 알림 (진동 포함)

### 업데이트된 파일
- **HomeScreen** (`src/screens/HomeScreen.tsx`) - 완전 재작성, 날씨 연동
- **package.json** - AsyncStorage, expo-notifications (기존 설치됨)

---

## 🚀 테스트 방법

### 1단계: 의존성 설치

```bash
cd TimeRight
npm install
```

### 2단계: Expo 앱 시작

#### 방법 A: iOS 시뮬레이터 (macOS만 가능)
```bash
npm run ios
```

#### 방법 B: Android 에뮬레이터
```bash
npm run android
```

#### 방법 C: 실제 스마트폰 (권장)
```bash
npm start
```

그런 다음:
1. 스마트폰에 **Expo Go** 앱 설치
   - iOS: App Store에서 "Expo Go" 검색
   - Android: Play Store에서 "Expo Go" 검색

2. QR 코드 스캔
   - iOS: 카메라 앱으로 터미널의 QR 코드 스캔
   - Android: Expo Go 앱 내에서 QR 코드 스캔

---

## 📱 테스트 시나리오

### ✅ 1. 온보딩 테스트
1. 앱 최초 실행
2. **환영 화면** 확인
   - "TimeRight에 오신 것을 환영합니다" 제목
   - 3가지 기능 소개 카드
   - "걷기 속도 측정 시작" 버튼
   - "나중에 하기" 버튼

3. **측정 화면** 테스트
   - "걷기 속도 측정 시작" 클릭
   - 진행 바 0% → 100% 애니메이션 확인
   - 펄스 애니메이션 확인

4. **결과 화면** 확인
   - 측정된 속도 (1.0~1.5 m/s) 표시
   - 속도 카테고리 (여유롭게/보통/빠르게)
   - "TimeRight 시작하기" 버튼

### ✅ 2. 검색 기능 테스트
1. 메인 화면에서 **검색창** 클릭
2. 검색창 확장 확인
3. **즐겨찾기** 섹션 확인 (가로 스크롤)
   - 아이콘 + 이름 표시
   - 클릭 시 도착지에 자동 입력
4. **최근 검색** 섹션 확인
   - 검색 기록 표시 (출발지 → 도착지)
   - 상대 시간 표시 ("방금 전", "5분 전", "어제")
   - ✕ 버튼으로 삭제 가능
5. **출발지** 입력 (예: "강남역")
6. **도착지** 입력 (예: "역삼역")
7. **검색** 버튼 클릭
8. 검색 후 기록이 **최근 검색**에 추가되는지 확인

### ✅ 3. 경로 카드 테스트
1. 검색 후 **2개의 경로 카드** 표시 확인
   - "빠른 경로" (추천 배지)
   - "환승 적음"

2. 카드 UI 확인
   - 시간, 도착 시간
   - 걷기/지하철/버스 아이콘
   - 요금 표시
   - AI 인사이트 ("당신의 걷기 속도로 예측...")
   - **날씨 정보**: "신호등 대기 2분 · ☀️ 맑음 22°C"

3. **카드 클릭** → 경로 선택

### ✅ 4. 네비게이션 테스트
1. 선택된 경로 하단 카드 확인
2. **"네비게이션 시작"** 버튼 클릭
3. 네비게이션 화면 확인:
   - 지도 (현재 위치 + 목적지)
   - 상단: 남은 시간, 정지 버튼
   - 하단: 거리, 안내 메시지, 진행 바

4. **앱 내 알림 테스트** (5초마다 체크)
   - 경고: 주황색 "조금 서두르세요"
   - 긴급: 빨강색 "지금 빠르게 이동하세요!"

5. **정지 버튼** 클릭 → 메인 화면 복귀

### ✅ 5. 잠금화면 알림 테스트
1. 네비게이션 시작 후 **홈 버튼** 또는 **전원 버튼** 눌러 잠금
2. 잠금화면에서 **알림** 확인:
   - 제목: "🧭 강남역 7번 출구 방향으로 걸어가세요"
   - 내용: "남은 거리: 240m · 예상 시간: 3분 20초"
   - **음악 플레이어처럼 상단에 고정**

3. 긴급 상황 시:
   - 제목: "🏃 지금 빠르게 이동하세요!"
   - **진동** 발생 확인

4. 네비게이션 종료 시 알림 자동 삭제 확인

---

## 🎨 디자인 체크리스트

### 색상 시스템
- [ ] 🔴 긴급 (Urgent): `#DC2626` (빨강)
- [ ] 🟠 경고 (Warning): `#F97316` (주황)
- [ ] 🔵 정보 (Info): `#2563EB` (파랑)
- [ ] 🟢 성공: `#10B981` (초록)

### 애니메이션
- [ ] ActionAlert 슬라이드 인
- [ ] OnboardingSpeed 펄스 효과
- [ ] Progress bar 전환
- [ ] 지도 마커 펄스

### 폰트 크기
- [ ] 제목: 28px (bold)
- [ ] 부제목: 16px
- [ ] 본문: 14-16px
- [ ] 작은 텍스트: 12-14px

### 간격
- [ ] 카드 padding: 16-24px
- [ ] 카드 gap: 12-16px
- [ ] Border radius: 12-24px

---

## 🐛 알려진 이슈 및 해결 방법

### Issue 1: "Cannot find module '@react-native-async-storage/async-storage'"
**해결방법:**
```bash
cd TimeRight
npm install @react-native-async-storage/async-storage
```

### Issue 2: Android에서 지도가 안 보임
**해결방법:**
`android/app/src/main/AndroidManifest.xml`에 Google Maps API 키 추가 필요
(현재는 mock 데이터로 테스트 가능)

### Issue 3: iOS에서 위치 권한 요청 안 뜸
**해결방법:**
`Info.plist`에 위치 권한 설명 추가 필요
(Expo가 자동으로 처리하지만, 수동 설정 필요 시)

---

## 📊 성능 최적화 팁

1. **이미지 최적화**: 아이콘은 이모지 사용 (🚶🚌🚇)으로 번들 크기 감소
2. **애니메이션**: `useNativeDriver: true` 사용으로 60fps 유지
3. **리스트 렌더링**: FlatList 대신 ScrollView (아이템 2개만)
4. **상태 관리**: Zustand로 전역 상태 최소화

---

## 🎯 다음 단계 (향후 개선)

### Phase 1: Mock 데이터 → 실제 API 연동
- [ ] Kakao Mobility API 통합
- [ ] 실시간 경로 검색
- [ ] 실제 도착 시간 계산

### Phase 2: 고급 기능
- [ ] 즐겨찾기 저장
- [ ] 알림 설정
- [ ] 오프라인 모드
- [ ] 다크 모드

### Phase 3: 배포
- [ ] iOS App Store
- [ ] Google Play Store
- [ ] 프로덕션 API 키 설정

---

## 📞 문제 해결

문제가 발생하면:
1. `npm install` 재실행
2. `npm start --clear` (캐시 삭제)
3. Expo Go 앱 재시작
4. 시뮬레이터/에뮬레이터 재시작

---

## ✨ 디자인 크레딧

이 디자인은 **Real-time Navigation App** Figma 프로토타입을 기반으로:
- Tailwind CSS 색상 팔레트
- shadcn/ui 디자인 시스템
- Google Maps 스타일 지도
- iOS/Android Material Design 가이드라인 준수

변환 작업: React (Web) → React Native (Mobile)
