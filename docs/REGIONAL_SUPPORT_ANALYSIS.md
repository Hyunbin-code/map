# Regional Support Analysis for TimeRight

## Research Summary (2025-11-18)

### Kakao API Ecosystem Investigation

After thorough research of Kakao's developer platforms, here are the findings:

#### 1. Kakao Mobility Developers (developers.kakaomobility.com)
**Available APIs:**
- Car navigation/routing APIs (길찾기 API)
- Multi-waypoint navigation
- Future driving information
- Logistics/delivery APIs

**NOT Available:**
- ❌ Public transportation real-time arrival API
- ❌ Bus/subway route search API
- ❌ Transit navigation API

#### 2. Kakao Developers (developers.kakao.com)
**Available APIs:**
- Local API: Address/coordinate conversion, place search
- KakaoNavi: Car navigation start API
- KakaoMap: Map display SDK

**NOT Available:**
- ❌ Public transportation real-time arrival API
- ❌ Transit routing API

#### 3. Kakao Consumer Apps (Not Developer APIs)
**KakaoBus App:**
- Bus real-time arrival: **57 regions nationwide**
- Subway real-time arrival: **Seoul, Gwangju, Daegu, Daejeon, Busan**
- ⚠️ Consumer app only, no public developer API available

**KakaoMetro App:**
- Seoul subway navigation
- ⚠️ Consumer app only, no public developer API available

### Conclusion: API Architecture for TimeRight

Since Kakao does not provide a public developer API for real-time public transportation arrival information, we need to use **direct integration with public data portal APIs**.

## Recommended API Architecture

### Map & Location Services
- **Kakao Local API** (developers.kakao.com)
  - Place search
  - Address/coordinate conversion
  - General location services

### Public Transportation Services
- **Public Data Portal APIs** (data.go.kr)
  - Real-time bus arrival information
  - Real-time subway arrival information
  - Subway congestion data

### Route Search
**Option 1: TMAP Public Transit API** (transit.tmapmobility.com)
- Provides comprehensive public transportation routing
- Supports multiple regions

**Option 2: Public Data Portal + Custom Algorithm**
- Use public APIs for real-time data
- Implement custom route calculation

## Regional Support Matrix

Based on **Public Data Portal APIs** (not Kakao APIs):

### Bus Real-time Arrival API
| Region | Status | API Source |
|--------|--------|------------|
| Seoul | ✅ | 서울시 버스도착정보 API |
| Gyeonggi | ✅ | 경기도 버스도착정보 API |
| Incheon | ✅ | 인천시 버스도착정보 API |
| Changwon | ✅ | 창원시 버스도착정보 API |
| Naju | ✅ | 나주시 버스도착정보 API |
| Busan | ⚠️ | Needs verification |
| Daegu | ⚠️ | Needs verification |
| Daejeon | ⚠️ | Needs verification |
| Gwangju | ⚠️ | Needs verification |

### Subway Real-time Arrival API
| City | Status | API Source |
|------|--------|------------|
| Seoul | ✅ | 서울시 지하철 실시간 도착정보 API |
| Busan | ❌ | Not found in public data portal |
| Daegu | ❌ | Not found in public data portal |
| Daejeon | ❌ | Not found in public data portal |
| Gwangju | ❌ | Not found in public data portal |

### Subway Congestion Data
| City | Status | API Source |
|------|--------|------------|
| Seoul | ✅ | 서울교통공사 실시간 혼잡도 API (4 levels) |
| All others | ❌ | Not available |

## Implementation Strategy

### Phase 1: Seoul Metropolitan Area (수도권)
**Supported regions:**
- Seoul (서울)
- Gyeonggi (경기)
- Incheon (인천)

**Available features:**
- ✅ Real-time bus arrival
- ✅ Real-time subway arrival (Seoul only)
- ✅ Subway congestion (Seoul only)
- ✅ Route comparison
- ✅ Decision engine with alerts

### Phase 2: Other Major Cities (검증 후 추가)
**Regions to verify:**
- Busan (부산)
- Daegu (대구)
- Daejeon (대전)
- Gwangju (광주)

**Available features:**
- ⚠️ Real-time bus arrival (needs API verification)
- ❌ Real-time subway arrival (not available via public API)
- ❌ Subway congestion (not available)

## Technical Implementation

### RegionService

```typescript
interface RegionCapabilities {
  cityName: string;
  cityCode: string;
  busRealtime: boolean;
  subwayRealtime: boolean;
  subwayCongestion: boolean;
  apiEndpoints: {
    bus?: string;
    subway?: string;
    congestion?: string;
  };
}

const SUPPORTED_REGIONS: Record<string, RegionCapabilities> = {
  seoul: {
    cityName: '서울',
    cityCode: 'SEL',
    busRealtime: true,
    subwayRealtime: true,
    subwayCongestion: true,
    apiEndpoints: {
      bus: 'http://ws.bus.go.kr/api/rest/arrive1',
      subway: 'http://swopenapi.seoul.go.kr/api/subway',
      congestion: 'http://swopenAPI.seoul.go.kr/api/subway/congestion',
    },
  },
  gyeonggi: {
    cityName: '경기',
    cityCode: 'GG',
    busRealtime: true,
    subwayRealtime: false,
    subwayCongestion: false,
    apiEndpoints: {
      bus: 'https://apis.data.go.kr/6410000/busarrivalservice',
    },
  },
  incheon: {
    cityName: '인천',
    cityCode: 'ICN',
    busRealtime: true,
    subwayRealtime: false,
    subwayCongestion: false,
    apiEndpoints: {
      bus: 'https://apis.data.go.kr/6280000/busArrivalService',
    },
  },
};

class RegionService {
  static async detectRegion(latitude: number, longitude: number): Promise<string> {
    // Use Kakao Local API to convert coordinates to administrative district
    // Determine region code based on address
  }

  static getCapabilities(regionCode: string): RegionCapabilities | null {
    return SUPPORTED_REGIONS[regionCode] || null;
  }

  static isFeatureSupported(regionCode: string, feature: string): boolean {
    const capabilities = this.getCapabilities(regionCode);
    if (!capabilities) return false;
    return capabilities[feature as keyof RegionCapabilities] === true;
  }
}
```

### User Experience

When user is in unsupported region:

```typescript
// Example notification
{
  title: '지역 제한 안내',
  message: '현재 위치(부산)에서는 일부 기능이 제한됩니다.',
  details: [
    '✅ 경로 검색 가능',
    '⚠️ 실시간 지하철 도착정보 제공 불가',
    '⚠️ 지하철 혼잡도 정보 제공 불가',
  ],
  action: '계속 사용하기',
}
```

## Next Steps

1. ✅ Research completed - Kakao does not provide public transit API
2. ⏳ Verify other city APIs (Busan, Daegu, Daejeon, Gwangju) on public data portal
3. ⏳ Implement RegionService with GPS-based detection
4. ⏳ Update UI to show feature availability by region
5. ⏳ Test with Seoul metropolitan area first
6. ⏳ Expand to other cities after verification

## References

- Public Data Portal: https://www.data.go.kr
- Kakao Developers: https://developers.kakao.com
- Kakao Mobility Developers: https://developers.kakaomobility.com
- TMAP Transit API: https://transit.tmapmobility.com
