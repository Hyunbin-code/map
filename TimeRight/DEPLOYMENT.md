# TimeRight - 앱스토어/플레이스토어 배포 가이드

## 📱 현재 구조의 배포 가능성

### ✅ **YES! 앱스토어/플레이스토어에 올릴 수 있는 구조입니다!**

현재 코드는 **Expo + EAS Build**를 사용하여 iOS App Store와 Google Play Store에 배포할 수 있는 완전한 구조입니다.

---

## 🏗️ 현재 구현된 프로덕션 준비 사항

### ✅ 완료된 항목

1. **앱 구조**
   - ✅ TypeScript로 타입 안정성 확보
   - ✅ Zustand로 전역 상태 관리
   - ✅ 서비스 레이어 분리 (LocationService, BusAPIService, DecisionEngine)
   - ✅ 컴포넌트 구조화 (screens, components, services, stores)

2. **권한 설정**
   - ✅ iOS: Info.plist 위치 권한 설정 완료
   - ✅ Android: Manifest 권한 설정 완료
   - ✅ 백그라운드 위치 추적 권한 설정

3. **빌드 설정**
   - ✅ app.json: 프로덕션 메타데이터 설정
   - ✅ eas.json: EAS Build 설정 완료
   - ✅ Bundle Identifier: `com.timeright.app`
   - ✅ Version: 1.0.0

4. **UI/UX**
   - ✅ SafeAreaView로 노치/상태바 대응
   - ✅ StatusBar 스타일 설정
   - ✅ 반응형 디자인 (StyleSheet)

---

## 🚧 배포 전 필요한 작업

### 1. **Expo 계정 및 프로젝트 설정**

```bash
# Expo 계정 생성 (무료)
npm install -g eas-cli
eas login

# 프로젝트 초기화
cd /home/user/map/TimeRight
eas init
```

### 2. **아이콘 및 스플래시 스크린**

**필요한 이미지:**
- `assets/icon.png` - 1024x1024px (앱 아이콘)
- `assets/adaptive-icon.png` - 1024x1024px (Android 적응형 아이콘)
- `assets/splash-icon.png` - 1284x2778px (스플래시 스크린)
- `assets/notification-icon.png` - 96x96px (알림 아이콘)

**디자인 가이드라인:**
- 아이콘: TimeRight 로고 + ⏱️ 이모티콘
- 색상: #4A90E2 (파랑) 메인 컬러
- 스플래시: 흰색/파랑 그라데이션 배경

**생성 도구:**
```bash
# Expo 아이콘 생성기 사용 (권장)
npx expo-icon-generator --input=./path/to/logo.png
```

### 3. **API 키 관리**

**현재 상태:**
- `.env` 파일 사용 중 ✅
- `.gitignore`에 `.env` 추가됨 ✅

**배포 시 필요:**
```bash
# EAS Secrets로 API 키 저장 (권장)
eas secret:create --scope project --name SEOUL_BUS_API_KEY --value "your_api_key"
eas secret:create --scope project --name SEOUL_SUBWAY_API_KEY --value "your_api_key"
eas secret:create --scope project --name SEOUL_TRAFFIC_SIGNAL_API_KEY --value "your_api_key"
```

**app.json 업데이트:**
```json
{
  "expo": {
    "extra": {
      "eas": {
        "projectId": "실제-프로젝트-ID"
      }
    }
  }
}
```

### 4. **앱스토어 준비물**

#### **Apple App Store (iOS)**

**필요한 것:**
1. Apple Developer Account ($99/년)
2. Apple ID
3. ASC App ID (App Store Connect에서 생성)
4. Apple Team ID

**제출 자료:**
- 앱 이름: TimeRight
- 카테고리: Navigation (또는 Travel)
- 스크린샷: iPhone 6.7", 6.5", 5.5" (각 5-8장)
- 앱 설명 (4000자 이내)
- 키워드: 대중교통,버스,지하철,네비게이션,서울,실시간
- 개인정보 처리방침 URL (필수)
- 지원 URL

**eas.json 업데이트:**
```json
{
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@example.com",
        "ascAppId": "1234567890",
        "appleTeamId": "ABCD1234"
      }
    }
  }
}
```

#### **Google Play Store (Android)**

**필요한 것:**
1. Google Play Console 계정 ($25 일회성)
2. Service Account Key (JSON)

**제출 자료:**
- 앱 이름: TimeRight
- 카테고리: Maps & Navigation
- 스크린샷: 최소 2장 (권장 8장)
- 512x512px 아이콘
- 1024x500px 배너 이미지
- 앱 설명 (짧은 설명 80자, 긴 설명 4000자)
- 개인정보 처리방침 URL (필수)

### 5. **개인정보 처리방침 (필수!)**

**필요한 이유:**
- App Store/Play Store 제출 필수 요구사항
- 위치 정보 수집/사용에 대한 명시

**포함 내용:**
- 수집하는 정보: 위치 정보 (GPS 좌표)
- 사용 목적: 실시간 대중교통 알림 제공
- 보관 기간: 앱 사용 중에만 일시적 저장
- 제3자 제공: 없음 (서울시 공공 API만 사용)
- 사용자 권리: 언제든 위치 권한 해제 가능

**호스팅:**
- GitHub Pages (무료)
- Notion (무료)
- Google Sites (무료)

---

## 🚀 배포 프로세스

### Step 1: 개발 빌드 테스트

```bash
# iOS 시뮬레이터 빌드
eas build --profile development --platform ios

# Android 에뮬레이터 빌드
eas build --profile development --platform android
```

### Step 2: 프리뷰 빌드 (내부 테스트)

```bash
# iOS TestFlight용 빌드
eas build --profile preview --platform ios

# Android 내부 테스트 APK
eas build --profile preview --platform android
```

**테스트 방법:**
```bash
# TestFlight에 업로드
eas submit --platform ios --profile preview

# Google Play 내부 테스트
eas submit --platform android --profile preview
```

### Step 3: 프로덕션 빌드

```bash
# 프로덕션 빌드 (iOS + Android)
eas build --profile production --platform all

# 또는 개별 빌드
eas build --profile production --platform ios
eas build --profile production --platform android
```

### Step 4: 스토어 제출

```bash
# App Store 제출
eas submit --platform ios --latest

# Play Store 제출
eas submit --platform android --latest
```

---

## 📊 빌드 예상 시간 및 비용

### **시간**
- iOS 빌드: 15-20분
- Android 빌드: 10-15분
- 스토어 심사: 1-3일 (iOS), 몇 시간-1일 (Android)

### **비용**
- Expo EAS Build: **무료 티어 30빌드/월** ✅
- Apple Developer: $99/년
- Google Play Console: $25 (일회성)

**총 첫 해 비용: $124**

---

## 🔍 앱 심사 통과 체크리스트

### iOS App Store

- [ ] 앱이 크래시 없이 안정적으로 동작
- [ ] 위치 권한 요청 이유 명시 (app.json에 이미 설정됨 ✅)
- [ ] 개인정보 처리방침 URL 제공
- [ ] 스크린샷 및 앱 설명 준비
- [ ] 테스트 계정 제공 (필요 시)
- [ ] App Store Guidelines 준수
  - 실제 기능 동작 (Mock 데이터만 사용하면 거절될 수 있음)
  - 광고 없음 (현재 ✅)
  - 유료 구매 없음 (현재 ✅)

### Google Play Store

- [ ] 앱이 크래시 없이 안정적으로 동작
- [ ] 위치 권한 설명 (app.json에 이미 설정됨 ✅)
- [ ] 개인정보 처리방침 URL 제공
- [ ] 타겟 SDK 버전: Android 13 이상 (Expo 기본값 ✅)
- [ ] 64비트 지원 (Expo 기본 지원 ✅)
- [ ] Content Rating 설정 (모든 연령 가능)

---

## ⚠️ 현재 코드의 제한사항 및 개선 필요 사항

### 1. **Mock 데이터 사용 중**

**현재:**
```typescript
// BusAPIService.ts
private getMockData(): BusArrival[] {
  return [/* 하드코딩된 버스 정보 */];
}
```

**개선 필요:**
- 실제 서울시 API 연동 필수
- API 키 발급 후 `.env`에 설정
- 네트워크 에러 핸들링 강화

**심사 영향:**
- iOS: Mock 데이터만 사용하면 **거절 가능성 높음**
- Android: 경고 받을 수 있음

### 2. **백그라운드 위치 추적**

**현재:** 설정은 되어 있으나 실제 구현 필요

**추가 구현 필요:**
```bash
npm install react-native-background-fetch
```

### 3. **푸시 알림 구현**

**현재:** expo-notifications 설치됨, 구현 필요

**구현 필요 사항:**
- NotificationService.ts 작성
- 알림 권한 요청
- 로컬 알림 스케줄링

### 4. **지도 표시**

**현재:** react-native-maps 설치됨, 미사용

**추가 구현 권장:**
- MapView 컴포넌트
- 경로 표시
- 버스 정류장 마커

### 5. **에러 바운더리**

**추가 권장:**
```typescript
// ErrorBoundary.tsx
import * as Sentry from '@sentry/react-native';
```

---

## 🎯 최소 배포 가능 버전 (MVP)

### **현재 상태로 배포 가능한 조건**

1. **실제 API 연동** (필수)
   - 서울시 버스 API 키 발급 ✅
   - Mock 데이터 제거
   - 실제 데이터로 테스트

2. **개인정보 처리방침** (필수)
   - URL 준비
   - app.json에 추가

3. **아이콘/스플래시** (필수)
   - 디자인 작업
   - 이미지 생성

4. **기본 기능 테스트** (필수)
   - 위치 추적 동작 확인
   - 버스 정보 조회 동작 확인
   - 알림 표시 동작 확인

### **배포 타임라인**

**최소 버전 (1-2주):**
- Day 1-3: 실제 API 연동
- Day 4-5: 아이콘/스플래시 디자인
- Day 6-7: 개인정보 처리방침 작성
- Day 8-10: 테스트 및 버그 수정
- Day 11: 빌드 및 제출
- Day 12-14: 심사 대기

**완성 버전 (1-2개월):**
- 지도 표시
- 푸시 알림
- Geofencing
- 환승 가이드
- 신호등 예측

---

## 🔗 유용한 링크

- [Expo EAS Build 문서](https://docs.expo.dev/build/introduction/)
- [App Store Connect](https://appstoreconnect.apple.com/)
- [Google Play Console](https://play.google.com/console/)
- [서울시 공공 API](https://data.seoul.go.kr/)

---

## 📝 요약

### ✅ **YES! 배포 가능합니다!**

**현재 코드 구조:**
- ✅ TypeScript + React Native
- ✅ 프로덕션 빌드 설정 완료
- ✅ 권한 설정 완료
- ✅ EAS Build 설정 완료

**추가 필요 사항:**
1. 실제 API 연동 (가장 중요!)
2. 아이콘/스플래시 디자인
3. 개인정보 처리방침
4. 앱스토어 계정 ($124)

**예상 배포 시기:**
- 최소 버전: 1-2주
- 완성 버전: 1-2개월

**비용:**
- 개발 비용: $0 (Expo 무료 티어)
- 스토어 비용: $124 (첫 해)
- 서버 비용: $0 (공공 API만 사용)

---

**결론: 현재 코드는 앱스토어/플레이스토어에 배포 가능한 완전한 구조입니다!** 🎉
