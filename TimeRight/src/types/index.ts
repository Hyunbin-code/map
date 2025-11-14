// 위치 관련 타입
export interface Location {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp?: number;
}

// 버스 도착 정보
export interface BusArrival {
  busNumber: string;
  routeId: string;
  arrivalMessage1: string;
  arrivalTimeMinutes1: number;
  stationsLeft1: number;
  congestion1: 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH';
  arrivalMessage2?: string;
  arrivalTimeMinutes2?: number;
  stationsLeft2?: number;
  congestion2?: 'UNKNOWN' | 'LOW' | 'MEDIUM' | 'HIGH';
  routeType: string;
  firstTime: string;
  lastTime: string;
  interval: number;
}

// 지하철 도착 정보
export interface SubwayArrival {
  line: string;
  lineName: string;
  lineColor: string;
  direction: string;
  destination: string;
  currentLocation: string;
  arrivalMessage: string;
  arrivalSeconds: number;
  arrivalStatus: string;
  trainNumber: string;
  isLastTrain: boolean;
}

// 정류장/역 정보
export interface Stop {
  id: string;
  type: 'BUS' | 'SUBWAY';
  name: string;
  location: Location;
  line?: string; // 지하철 노선
  direction?: string; // 지하철 방향
}

// 경로 정보
export interface Route {
  id: string;
  startPoint: Location;
  endPoint: Location;
  stops: Stop[];
  distance: number;
  estimatedTime: number;
  trafficSignals: TrafficSignal[];
}

// 신호등 정보
export interface TrafficSignal {
  id: string;
  location: Location;
  currentPhase: 'RED' | 'GREEN' | 'YELLOW' | 'UNKNOWN';
  timeRemaining: number;
  cycleTime: number;
  confidence: number;
  source: 'API' | 'LEARNED' | 'DEFAULT';
}

// 결정 (행동 가이드)
export interface Decision {
  action: 'RUN' | 'WALK_FAST' | 'WALK_NORMAL' | 'MISSED' | 'WAIT_NEXT';
  message: string;
  detail?: string;
  urgency: 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';
  color: string;
  vibrate: boolean;
  sound?: string;
  voiceAlert?: boolean;
}

// GPS 추적 모드
export enum GPSMode {
  STOPPED = 0,
  WALKING = 1,
  RUNNING = 2,
  IN_TRANSIT = 3,
}
