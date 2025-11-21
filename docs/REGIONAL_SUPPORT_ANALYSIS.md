# Regional Support Analysis for TimeRight (2025년 최신 검증판)

## Research Summary (2025-11-18)

### API 검증 결과

대중교통 앱 개발을 위한 API 조사 결과, **카카오와 네이버는 대중교통 API를 제공하지 않음**을 확인했습니다.

#### ❌ 카카오모빌리티 API - 대중교통 기능 없음
**검증 방법:**
- developers.kakaomobility.com 문서 확인
- devtalk.kakao.com 공식 답변 확인
- WebSearch로 2025년 최신 정보 검증

**결과:**
- ✅ 자동차 길찾기 API만 제공
- ❌ 대중교통 경로 검색 API 없음
- ❌ 실시간 버스/지하철 API 없음
- 카카오 공식: "길찾기는 URL Scheme으로 제공" (앱 연동만 가능, REST API 아님)

#### ❌ 네이버 클라우드 Maps API - 대중교통 기능 없음
**검증 방법:**
- api.ncloud-docs.com 문서 확인
- Directions 5/15 API 스펙 확인

**결과:**
- ✅ 자동차 길찾기 API만 제공
- ❌ 대중교통 경로 검색 API 없음
- ❌ 실시간 버스/지하철 API 없음

## Recommended API Architecture

### ⭐ 최종 선택: ODsay API + 공공데이터 API 조합

```
TimeRight 앱 아키텍처
├── 대중교통 경로 검색: ODsay API (전국)
├── 실시간 버스 도착: 공공데이터 API (서울/경기/인천)
├── 실시간 지하철 도착: 공공데이터 API (서울)
├── 지하철 혼잡도: 공공데이터 API (서울)
└── 지도 표시: 카카오맵 SDK or 네이버맵 SDK
```

### API 역할 분담

#### 1. ODsay API - 경로 검색 전담
**URL**: https://lab.odsay.com/

**제공 기능:**
- ✅ 전국 대중교통 경로 검색
- ✅ 버스/지하철/기차 통합 경로
- ✅ 환승 정보
- ✅ 소요시간, 요금 계산
- ✅ 노선/정류장 정보

**요금:**
- Free: 30,000 호출/일 (DAU 750명)
- Pro: $99/월, 1,000,000 호출/일 (DAU 25,000명)

**커버리지:** 전국

#### 2. 공공데이터 API - 실시간 정보 전담
**URL**: https://www.data.go.kr/

**제공 기능:**
- ✅ 실시간 버스 도착정보
- ✅ 실시간 지하철 도착정보
- ✅ 지하철 혼잡도 (서울만)

**요금:** 완전 무료, 무제한

**커버리지:** 서울/경기/인천 (수도권)

## Regional Support Matrix

### 버스 실시간 도착정보

| Region | Status | Data Source | API Endpoint |
|--------|--------|-------------|--------------|
| **서울** | ✅ | 서울시 공공 API | http://ws.bus.go.kr/api/rest/arrive/getArrInfoByRouteAll |
| **경기** | ✅ | 경기도 공공 API | https://apis.data.go.kr/6410000/busarrivalservice |
| **인천** | ✅ | 인천시 공공 API | https://apis.data.go.kr/6280000/busArrivalService |
| 부산 | ⚠️ | 검증 필요 | 추후 확인 |
| 대구 | ⚠️ | 검증 필요 | 추후 확인 |
| 대전 | ⚠️ | 검증 필요 | 추후 확인 |
| 광주 | ⚠️ | 검증 필요 | 추후 확인 |
| 기타 | ❌ | 없음 | ODsay 스케줄 정보만 |

### 지하철 실시간 도착정보

| City | Status | Data Source | API Endpoint |
|------|--------|-------------|--------------|
| **서울** | ✅ | 서울시 공공 API | http://swopenapi.seoul.go.kr/api/subway/{key}/json/realtimeStationArrival |
| 부산 | ❌ | 없음 | ODsay 스케줄 정보만 |
| 대구 | ❌ | 없음 | ODsay 스케줄 정보만 |
| 대전 | ❌ | 없음 | ODsay 스케줄 정보만 |
| 광주 | ❌ | 없음 | ODsay 스케줄 정보만 |

### 지하철 혼잡도 정보

| City | Status | Data Source | API Endpoint |
|------|--------|-------------|--------------|
| **서울** | ✅ (4단계) | 서울교통공사 | http://swopenAPI.seoul.go.kr/api/subway/{key}/json/realtimeCongestion |
| 기타 | ❌ | 없음 | 제공 안함 |

**혼잡도 단계:**
- 1: 여유 (0-20%)
- 2: 보통 (20-40%)
- 3: 약간혼잡 (40-60%)
- 4: 매우혼잡 (60%+)

## Implementation Strategy

### Phase 1: 수도권 우선 (서울/경기/인천)

**기간:** MVP ~ 6개월
**목표 사용자:** DAU 500-1,000명

**지원 기능:**
```
✅ 대중교통 경로 검색 (ODsay - 전국)
✅ 실시간 버스 도착정보 (공공 API - 서울/경기/인천)
✅ 실시간 지하철 도착정보 (공공 API - 서울)
✅ 지하철 혼잡도 (공공 API - 서울)
✅ 의사결정 엔진 (뛰어야 하는지 판단)
✅ 실시간 알림
```

**지원 지역:**
- 서울: 모든 기능 지원
- 경기/인천: 버스 실시간 정보 지원, 지하철은 스케줄 기반
- 기타 지역: 경로 검색만 가능 (실시간 정보 없음)

**API 비용:**
- ODsay: 무료 (30k/일)
- 공공데이터: 무료
- **총 비용: $0/월**

### Phase 2: 타 지역 확장 검증

**기간:** 6-12개월
**목표:** 부산, 대구, 대전, 광주 실시간 정보 확인

**조사 항목:**
- [ ] 부산 버스 실시간 API 확인
- [ ] 부산 지하철 실시간 API 확인
- [ ] 대구/대전/광주 각 지역 API 확인
- [ ] ODsay 실시간 연동 지역 확인

**확장 전략:**
```
IF 실시간 API 있음:
  → 공공 API 연동
ELSE:
  → ODsay 스케줄 기반으로 제공
  → "실시간 정보가 제공되지 않는 지역입니다" 안내
```

### Phase 3: 전국 서비스 (스케줄 기반)

**기간:** 12개월+
**목표:** 모든 지역에서 기본 기능 제공

**전국 제공 기능:**
- ✅ 대중교통 경로 검색 (ODsay - 스케줄 기반)
- ✅ 대략적인 도착 시간 예측
- ⚠️ 실시간 정보는 지원 지역만

**사용자 안내:**
```
수도권 사용자:
"실시간 버스/지하철 도착정보를 제공합니다"

타 지역 사용자:
"현재 [지역명]에서는 스케줄 기반 정보를 제공합니다.
실시간 정보는 서울/경기/인천에서만 가능합니다."
```

## Technical Implementation

### RegionService

```typescript
interface RegionCapabilities {
  cityName: string;
  cityCode: string;

  // ODsay로 전국 제공
  routeSearch: boolean;  // 항상 true

  // 공공 API로 일부 지역만
  busRealtime: boolean;
  subwayRealtime: boolean;
  subwayCongestion: boolean;

  apiEndpoints: {
    // ODsay (전국 공통)
    odsay: {
      baseUrl: string;
      apiKey: string;
    };
    // 공공 API (지역별 다름)
    bus?: string;
    subway?: string;
    congestion?: string;
  };
}

const SUPPORTED_REGIONS: Record<string, RegionCapabilities> = {
  seoul: {
    cityName: '서울',
    cityCode: 'SEL',
    routeSearch: true,       // ODsay
    busRealtime: true,       // 서울시 API
    subwayRealtime: true,    // 서울시 API
    subwayCongestion: true,  // 서울시 API
    apiEndpoints: {
      odsay: {
        baseUrl: 'https://api.odsay.com/v1',
        apiKey: process.env.ODSAY_API_KEY,
      },
      bus: 'http://ws.bus.go.kr/api/rest/arrive1',
      subway: 'http://swopenapi.seoul.go.kr/api/subway',
      congestion: 'http://swopenAPI.seoul.go.kr/api/subway',
    },
  },

  gyeonggi: {
    cityName: '경기',
    cityCode: 'GG',
    routeSearch: true,       // ODsay
    busRealtime: true,       // 경기도 API
    subwayRealtime: false,   // 없음 (ODsay 스케줄만)
    subwayCongestion: false,
    apiEndpoints: {
      odsay: {
        baseUrl: 'https://api.odsay.com/v1',
        apiKey: process.env.ODSAY_API_KEY,
      },
      bus: 'https://apis.data.go.kr/6410000/busarrivalservice',
    },
  },

  incheon: {
    cityName: '인천',
    cityCode: 'ICN',
    routeSearch: true,
    busRealtime: true,
    subwayRealtime: false,
    subwayCongestion: false,
    apiEndpoints: {
      odsay: {
        baseUrl: 'https://api.odsay.com/v1',
        apiKey: process.env.ODSAY_API_KEY,
      },
      bus: 'https://apis.data.go.kr/6280000/busArrivalService',
    },
  },

  // 기타 지역: 경로 검색만 가능
  busan: {
    cityName: '부산',
    cityCode: 'PUS',
    routeSearch: true,       // ODsay
    busRealtime: false,      // 검증 필요
    subwayRealtime: false,
    subwayCongestion: false,
    apiEndpoints: {
      odsay: {
        baseUrl: 'https://api.odsay.com/v1',
        apiKey: process.env.ODSAY_API_KEY,
      },
    },
  },

  // 나머지 지역도 동일 패턴
};

class RegionService {
  /**
   * GPS 좌표로 현재 지역 감지
   */
  static async detectRegion(latitude: number, longitude: number): Promise<string> {
    // 카카오 Local API로 좌표 → 주소 변환
    const response = await fetch(
      `https://dapi.kakao.com/v2/local/geo/coord2regioncode.json?x=${longitude}&y=${latitude}`,
      {
        headers: {
          Authorization: `KakaoAK ${process.env.KAKAO_REST_API_KEY}`,
        },
      }
    );

    const data = await response.json();
    const region = data.documents[0].region_1depth_name;

    // "서울특별시" → "seoul"
    const regionCode = this.parseRegionCode(region);
    return regionCode;
  }

  /**
   * 지역별 기능 확인
   */
  static getCapabilities(regionCode: string): RegionCapabilities {
    return SUPPORTED_REGIONS[regionCode] || this.getDefaultCapabilities(regionCode);
  }

  /**
   * 기본 기능 (경로 검색만)
   */
  static getDefaultCapabilities(regionCode: string): RegionCapabilities {
    return {
      cityName: regionCode,
      cityCode: regionCode.toUpperCase(),
      routeSearch: true,  // ODsay로 전국 제공
      busRealtime: false,
      subwayRealtime: false,
      subwayCongestion: false,
      apiEndpoints: {
        odsay: {
          baseUrl: 'https://api.odsay.com/v1',
          apiKey: process.env.ODSAY_API_KEY,
        },
      },
    };
  }

  /**
   * 기능 지원 여부 확인
   */
  static isFeatureSupported(regionCode: string, feature: keyof RegionCapabilities): boolean {
    const capabilities = this.getCapabilities(regionCode);
    return capabilities[feature] === true;
  }

  /**
   * 지역명 파싱
   */
  private static parseRegionCode(regionName: string): string {
    const map: Record<string, string> = {
      '서울특별시': 'seoul',
      '경기도': 'gyeonggi',
      '인천광역시': 'incheon',
      '부산광역시': 'busan',
      '대구광역시': 'daegu',
      '대전광역시': 'daejeon',
      '광주광역시': 'gwangju',
    };

    return map[regionName] || 'other';
  }
}

export default RegionService;
```

### TransportAPIService

```typescript
class TransportAPIService {
  /**
   * 경로 검색 (ODsay - 전국)
   */
  static async searchRoute(origin: Point, destination: Point): Promise<Route[]> {
    const response = await fetch(
      `https://api.odsay.com/v1/api/searchPubTransPath?` +
      `SX=${origin.lng}&SY=${origin.lat}&EX=${destination.lng}&EY=${destination.lat}` +
      `&apiKey=${process.env.ODSAY_API_KEY}`
    );

    const data = await response.json();
    return this.parseODsayRoutes(data);
  }

  /**
   * 실시간 버스 도착정보 (공공 API - 지역별)
   */
  static async getBusArrival(stopId: string, regionCode: string): Promise<BusArrival[]> {
    const capabilities = RegionService.getCapabilities(regionCode);

    if (!capabilities.busRealtime) {
      // 실시간 정보 없음 → ODsay 스케줄 정보 사용
      return this.getBusScheduleFromODsay(stopId);
    }

    // 지역별 공공 API 호출
    const endpoint = capabilities.apiEndpoints.bus;
    const response = await fetch(`${endpoint}?stopId=${stopId}&serviceKey=${process.env.PUBLIC_API_KEY}`);

    const data = await response.json();
    return this.parseBusArrival(data);
  }

  /**
   * 실시간 지하철 도착정보 (공공 API - 서울만)
   */
  static async getSubwayArrival(stationName: string, regionCode: string): Promise<SubwayArrival[]> {
    const capabilities = RegionService.getCapabilities(regionCode);

    if (!capabilities.subwayRealtime) {
      // 실시간 정보 없음 → ODsay 스케줄 정보 사용
      return this.getSubwayScheduleFromODsay(stationName);
    }

    // 서울시 공공 API 호출
    const endpoint = capabilities.apiEndpoints.subway;
    const response = await fetch(
      `${endpoint}/${process.env.SEOUL_SUBWAY_API_KEY}/json/realtimeStationArrival/0/10/${encodeURIComponent(stationName)}`
    );

    const data = await response.json();
    return this.parseSubwayArrival(data);
  }

  /**
   * 지하철 혼잡도 (서울만)
   */
  static async getSubwayCongestion(stationName: string, lineNum: string): Promise<CongestionInfo | null> {
    const capabilities = RegionService.getCapabilities('seoul');

    if (!capabilities.subwayCongestion) {
      return null;
    }

    const endpoint = capabilities.apiEndpoints.congestion;
    const response = await fetch(
      `${endpoint}/${process.env.SEOUL_SUBWAY_API_KEY}/json/realtimeCongestion/0/10/${encodeURIComponent(stationName)}/${lineNum}`
    );

    const data = await response.json();
    return this.parseCongestion(data);
  }
}
```

## User Experience

### 수도권 사용자 (Full Feature)

```typescript
// 서울/경기/인천 사용자
const region = await RegionService.detectRegion(lat, lng);
// → "seoul"

const capabilities = RegionService.getCapabilities(region);
// {
//   routeSearch: true,
//   busRealtime: true,
//   subwayRealtime: true,
//   subwayCongestion: true
// }

// UI에 모든 기능 표시
<FeatureBadge>실시간 도착정보</FeatureBadge>
<FeatureBadge>혼잡도 정보</FeatureBadge>
```

### 타 지역 사용자 (Limited Feature)

```typescript
// 부산 사용자
const region = await RegionService.detectRegion(lat, lng);
// → "busan"

const capabilities = RegionService.getCapabilities(region);
// {
//   routeSearch: true,
//   busRealtime: false,
//   subwayRealtime: false,
//   subwayCongestion: false
// }

// UI에 제한 안내
<Alert type="info">
  현재 부산에서는 경로 검색 기능만 제공됩니다.
  실시간 도착정보는 서울/경기/인천에서만 가능합니다.
</Alert>
```

## Cost Estimation

### Phase 1 (DAU 750, 수도권만)

```
ODsay API:
├── 호출: 30,000/일 (무료 한도)
├── 비용: $0/월
└── 충분

공공데이터 API:
├── 호출: 무제한
├── 비용: $0/월
└── 충분

총 비용: $0/월 ✅
```

### Phase 2 (DAU 10,000, 전국)

```
ODsay API:
├── 호출: 400,000/일
├── Pro 요금제: $99/월 (1M/일)
└── 충분

공공데이터 API:
├── 호출: 무제한
├── 비용: $0/월
└── 충분

총 비용: $99/월 ✅
```

## Next Steps

1. ✅ API 조사 완료 (카카오/네이버 검증 완료)
2. ⏳ ODsay API 키 발급 및 테스트
3. ⏳ 공공데이터 API 키 발급 (서울시 버스/지하철/혼잡도)
4. ⏳ RegionService 구현
5. ⏳ TransportAPIService 구현
6. ⏳ 수도권 우선 출시
7. ⏳ 타 지역 API 검증 및 확장

## References

- **ODsay API**: https://lab.odsay.com/
- **공공데이터포털**: https://www.data.go.kr/
- **서울시 열린데이터광장**: https://data.seoul.go.kr/
- **카카오 Local API**: https://developers.kakao.com/docs/latest/ko/local/dev-guide
- **네이버 클라우드 Maps**: https://www.ncloud.com/product/applicationService/maps
