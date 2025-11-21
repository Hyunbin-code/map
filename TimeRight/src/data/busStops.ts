import { Stop } from '../types';

/**
 * 서울 주요 버스 정류장 목록
 * 실제 앱에서는 서울시 버스 API에서 동적으로 가져와야 함
 */
export const MOCK_BUS_STOPS: Stop[] = [
  {
    id: 'stop-gangnam-01',
    type: 'BUS',
    name: '강남역 (신한은행 앞)',
    location: {
      latitude: 37.498095,
      longitude: 127.027583,
    },
  },
  {
    id: 'stop-gangnam-02',
    type: 'BUS',
    name: '강남역 (강남파이낸스센터)',
    location: {
      latitude: 37.497942,
      longitude: 127.027625,
    },
  },
  {
    id: 'stop-yeoksam-01',
    type: 'BUS',
    name: '역삼역 (5번출구)',
    location: {
      latitude: 37.500775,
      longitude: 127.036508,
    },
  },
  {
    id: 'stop-samsung-01',
    type: 'BUS',
    name: '삼성역 (무역센터 앞)',
    location: {
      latitude: 37.5088,
      longitude: 127.063247,
    },
  },
  {
    id: 'stop-jamsil-01',
    type: 'BUS',
    name: '잠실역 (롯데월드몰)',
    location: {
      latitude: 37.513294,
      longitude: 127.100017,
    },
  },
  {
    id: 'stop-hongdae-01',
    type: 'BUS',
    name: '홍대입구역 (2번출구)',
    location: {
      latitude: 37.557527,
      longitude: 126.92532,
    },
  },
  {
    id: 'stop-sinchon-01',
    type: 'BUS',
    name: '신촌역 (북쪽)',
    location: {
      latitude: 37.555946,
      longitude: 126.936893,
    },
  },
  {
    id: 'stop-city-hall-01',
    type: 'BUS',
    name: '서울시청 (덕수궁 앞)',
    location: {
      latitude: 37.566293,
      longitude: 126.977829,
    },
  },
  {
    id: 'stop-gwanghwamun-01',
    type: 'BUS',
    name: '광화문 (세종문화회관)',
    location: {
      latitude: 37.571607,
      longitude: 126.976881,
    },
  },
  {
    id: 'stop-jonggak-01',
    type: 'BUS',
    name: '종각역 (YMCA 앞)',
    location: {
      latitude: 37.56972,
      longitude: 126.983189,
    },
  },
];

/**
 * ID로 정류장 찾기
 */
export function findStopById(id: string): Stop | undefined {
  return MOCK_BUS_STOPS.find((stop) => stop.id === id);
}

/**
 * 이름으로 정류장 검색
 */
export function searchStopsByName(query: string): Stop[] {
  const lowerQuery = query.toLowerCase();
  return MOCK_BUS_STOPS.filter((stop) => stop.name.toLowerCase().includes(lowerQuery));
}

/**
 * 가까운 정류장 찾기
 */
export function findNearbyStops(
  userLatitude: number,
  userLongitude: number,
  radiusMeters: number = 500
): Stop[] {
  return MOCK_BUS_STOPS.filter((stop) => {
    const distance = calculateDistance(
      userLatitude,
      userLongitude,
      stop.location.latitude,
      stop.location.longitude
    );
    return distance <= radiusMeters;
  }).sort((a, b) => {
    const distanceA = calculateDistance(
      userLatitude,
      userLongitude,
      a.location.latitude,
      a.location.longitude
    );
    const distanceB = calculateDistance(
      userLatitude,
      userLongitude,
      b.location.latitude,
      b.location.longitude
    );
    return distanceA - distanceB;
  });
}

/**
 * 거리 계산 (Haversine 공식)
 */
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // 지구 반지름 (m)
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // 미터
}
