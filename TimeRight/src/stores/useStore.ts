import { create } from 'zustand';
import { Location, Route, Decision, BusArrival, SubwayArrival, Stop } from '../types';

interface AppState {
  // 사용자 상태
  userLocation: Location | null;
  route: Route | null;
  isTracking: boolean;
  targetStop: Stop | null;
  isNavigating: boolean;

  // 대중교통 정보
  busArrivals: Record<string, BusArrival[]>;
  subwayArrivals: Record<string, SubwayArrival[]>;

  // 알림 상태
  currentDecision: Decision | null;
  lastNotification: Decision | null;
  notificationHistory: Decision[];

  // Actions
  setUserLocation: (location: Location) => void;
  setRoute: (route: Route | null) => void;
  setIsTracking: (tracking: boolean) => void;
  setTargetStop: (stop: Stop | null) => void;
  setIsNavigating: (navigating: boolean) => void;
  setBusArrivals: (stopId: string, arrivals: BusArrival[]) => void;
  setSubwayArrivals: (stationName: string, arrivals: SubwayArrival[]) => void;
  setCurrentDecision: (decision: Decision | null) => void;
  addNotification: (notification: Decision) => void;
  clearNotifications: () => void;
}

export const useStore = create<AppState>((set) => ({
  // Initial state
  userLocation: null,
  route: null,
  isTracking: false,
  targetStop: null,
  isNavigating: false,
  busArrivals: {},
  subwayArrivals: {},
  currentDecision: null,
  lastNotification: null,
  notificationHistory: [],

  // Actions
  setUserLocation: (location) => set({ userLocation: location }),

  setRoute: (route) => set({ route }),

  setIsTracking: (tracking) => set({ isTracking: tracking }),

  setTargetStop: (stop) => set({ targetStop: stop }),

  setIsNavigating: (navigating) => set({ isNavigating: navigating }),

  setBusArrivals: (stopId, arrivals) =>
    set((state) => ({
      busArrivals: {
        ...state.busArrivals,
        [stopId]: arrivals,
      },
    })),

  setSubwayArrivals: (stationName, arrivals) =>
    set((state) => ({
      subwayArrivals: {
        ...state.subwayArrivals,
        [stationName]: arrivals,
      },
    })),

  setCurrentDecision: (decision) => set({ currentDecision: decision }),

  addNotification: (notification) =>
    set((state) => ({
      lastNotification: notification,
      notificationHistory: [
        ...state.notificationHistory,
        notification,
      ].slice(-50), // 최근 50개만 보관
    })),

  clearNotifications: () =>
    set({
      notificationHistory: [],
      lastNotification: null,
    }),
}));
