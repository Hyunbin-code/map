# TimeRight 실행 가이드

## 🚀 실행 방법 (4가지)

---

## 방법 1: 웹 브라우저 (가장 빠름) ⭐ 추천

가장 쉽고 빠른 방법입니다!

```bash
cd /home/user/map/TimeRight

# 개발 서버 시작
npm start

# 또는 직접 웹으로
npm run web
```

**실행 후:**
- 브라우저가 자동으로 열립니다 (http://localhost:8081)
- TimeRight 앱이 웹에서 실행됩니다
- 실시간 코드 수정 가능 (Hot Reload)

**제한사항:**
- ⚠️ GPS 위치는 브라우저 위치로 시뮬레이션됨
- ⚠️ 푸시 알림은 웹에서 제한적

---

## 방법 2: Expo Go 앱 (실제 기기) ⭐⭐ 최고 추천!

실제 스마트폰에서 테스트하는 가장 좋은 방법!

### 1단계: Expo Go 앱 설치

**iOS (iPhone):**
- App Store에서 "Expo Go" 검색 후 설치
- https://apps.apple.com/app/expo-go/id982107779

**Android:**
- Play Store에서 "Expo Go" 검색 후 설치
- https://play.google.com/store/apps/details?id=host.exp.exponent

### 2단계: 개발 서버 시작

```bash
cd /home/user/map/TimeRight
npm start
```

### 3단계: QR 코드 스캔

터미널에 QR 코드가 나타납니다.

**iOS:**
- 기본 카메라 앱으로 QR 코드 스캔
- "Expo Go로 열기" 탭

**Android:**
- Expo Go 앱 실행
- "Scan QR Code" 탭
- QR 코드 스캔

**실행 완료!**
- TimeRight 앱이 실제 기기에서 실행됩니다
- GPS, 알림 등 모든 기능 사용 가능
- 코드 수정 시 자동 리로드

---

## 방법 3: iOS 시뮬레이터 (Mac만 가능)

Mac이 있다면 iOS 시뮬레이터에서 실행 가능합니다.

### 사전 요구사항
```bash
# Xcode 설치 (Mac App Store에서)
# Xcode Command Line Tools 설치
xcode-select --install
```

### 실행
```bash
cd /home/user/map/TimeRight
npm run ios
```

**자동으로:**
- iOS 시뮬레이터 실행
- TimeRight 앱 설치 및 실행

---

## 방법 4: Android 에뮬레이터

Android Studio가 설치되어 있다면 에뮬레이터에서 실행 가능합니다.

### 사전 요구사항
```bash
# Android Studio 설치
# https://developer.android.com/studio

# Android 에뮬레이터 설정
# Android Studio > AVD Manager > Create Virtual Device
```

### 실행
```bash
cd /home/user/map/TimeRight
npm run android
```

**자동으로:**
- Android 에뮬레이터 실행
- TimeRight 앱 설치 및 실행

---

## 🎯 추천 실행 방법 정리

| 방법 | 난이도 | 속도 | 기능 | 추천도 |
|------|--------|------|------|--------|
| 웹 브라우저 | ⭐ 쉬움 | ⚡ 빠름 | 제한적 | ⭐⭐⭐ |
| Expo Go | ⭐⭐ 보통 | ⚡⚡ 보통 | 완전함 | ⭐⭐⭐⭐⭐ |
| iOS 시뮬레이터 | ⭐⭐⭐ 어려움 | ⚡⚡⚡ 느림 | 완전함 | ⭐⭐⭐⭐ |
| Android 에뮬레이터 | ⭐⭐⭐ 어려움 | ⚡⚡⚡ 느림 | 완전함 | ⭐⭐⭐⭐ |

**결론:**
- **처음 테스트**: 웹 브라우저 (npm run web)
- **실제 기능 테스트**: Expo Go 앱 (npm start + QR 스캔)

---

## 📱 실행 후 사용 방법

### 1. 위치 추적 시작

앱 실행 후:
1. "📍 위치 추적 시작" 버튼 클릭
2. 위치 권한 허용
3. 현재 위치가 표시됨

### 2. 테스트 실행

"🚌 테스트 실행" 버튼 클릭하면:
- Mock 버스 데이터를 불러옴
- 실시간 알림 결정 표시
- "지금 뛰어야 해요!" 등의 메시지 확인

### 3. 실시간 알림 확인

알림 박스에서 확인:
- 🏃 **빨강**: 긴급 (뛰어야 함)
- 🚶 **주황**: 주의 (서두르세요)
- ✅ **초록**: 여유 (천천히 가세요)

---

## 🔧 문제 해결

### "Unable to resolve module" 에러

```bash
# 의존성 재설치
cd /home/user/map/TimeRight
rm -rf node_modules
npm install
```

### "Metro bundler error"

```bash
# 캐시 정리
npx expo start --clear
```

### "Permission denied" (위치 권한)

- **웹**: 브라우저 설정 > 위치 권한 허용
- **iOS**: 설정 > Expo Go > 위치 > 항상 허용
- **Android**: 설정 > 앱 > Expo Go > 권한 > 위치 > 항상 허용

### "Network error" (API 호출 실패)

현재는 Mock 데이터를 사용하므로 정상입니다.
실제 API 키가 필요하면 `.env` 파일 설정 필요.

---

## 🎨 개발 팁

### Hot Reload (자동 새로고침)

코드를 수정하면 자동으로 앱이 새로고침됩니다.
- 저장만 하면 즉시 반영
- 앱 재시작 불필요

### 디버깅

**웹:**
- 브라우저 개발자 도구 (F12)
- console.log() 확인

**Expo Go:**
- 기기 흔들기 → Developer Menu
- Remote Debugging 선택
- 크롬 개발자 도구에서 디버깅

### 성능 모니터링

```bash
# 개발 서버 실행 시
npm start

# 터미널에서:
# - r: 리로드
# - m: 개발자 메뉴 토글
# - shift+m: 성능 모니터 표시
```

---

## 📊 실행 확인 체크리스트

실행이 제대로 되었는지 확인:

- [ ] 앱이 로드됨 (TimeRight 헤더 표시)
- [ ] "위치 추적 시작" 버튼이 보임
- [ ] 버튼 클릭 시 위치 권한 요청
- [ ] 위치 정보가 표시됨 (위도/경도)
- [ ] "테스트 실행" 클릭 시 알림 표시
- [ ] 알림 박스에 색상 및 메시지 표시

모두 체크되면 **정상 실행!** ✅

---

## 🚀 빠른 시작 (요약)

```bash
# 1. 프로젝트로 이동
cd /home/user/map/TimeRight

# 2. 개발 서버 시작
npm start

# 3-1. 웹에서 보기
# 브라우저가 자동으로 열림 (http://localhost:8081)

# 3-2. 실제 기기에서 보기
# Expo Go 앱으로 QR 코드 스캔
```

---

**도움이 더 필요하면 물어보세요!** 🙋‍♂️
