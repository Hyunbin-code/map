import { create } from 'zustand';
import { Location, Route, Decision, BusArrival, SubwayArrival, Stop } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Favorite {
  id: string;
  from: string;
  to: string;
  timestamp: number;
}

interface SearchHistory {
  id: string;
  from: string;
  to: string;
  timestamp: number;
}

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

  // 즐겨찾기 & 검색 기록
  favorites: Favorite[];
  searchHistory: SearchHistory[];

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
  addFavorite: (from: string, to: string) => void;
  removeFavorite: (id: string) => void;
  loadFavorites: () => Promise<void>;
  addSearchHistory: (from: string, to: string) => void;
  loadSearchHistory: () => Promise<void>;
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
  favorites: [],
  searchHistory: [],

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
      notificationHistory: [...state.notificationHistory, notification].slice(-50), // 최근 50개만 보관
    })),

  clearNotifications: () =>
    set({
      notificationHistory: [],
      lastNotification: null,
    }),

  addFavorite: async (from, to) => {
    const favorite: Favorite = {
      id: Date.now().toString(),
      from,
      to,
      timestamp: Date.now(),
    };
    set((state) => {
      const newFavorites = [...state.favorites, favorite];
      AsyncStorage.setItem('timeright_favorites', JSON.stringify(newFavorites));
      return { favorites: newFavorites };
    });
  },

  removeFavorite: async (id) => {
    set((state) => {
      const newFavorites = state.favorites.filter((f) => f.id !== id);
      AsyncStorage.setItem('timeright_favorites', JSON.stringify(newFavorites));
      return { favorites: newFavorites };
    });
  },

  loadFavorites: async () => {
    try {
      const stored = await AsyncStorage.getItem('timeright_favorites');
      if (stored) {
        set({ favorites: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  },

  addSearchHistory: async (from, to) => {
    const history: SearchHistory = {
      id: Date.now().toString(),
      from,
      to,
      timestamp: Date.now(),
    };
    set((state) => {
      const newHistory = [history, ...state.searchHistory].slice(0, 10); // 최근 10개만
      AsyncStorage.setItem('timeright_search_history', JSON.stringify(newHistory));
      return { searchHistory: newHistory };
    });
  },

  loadSearchHistory: async () => {
    try {
      const stored = await AsyncStorage.getItem('timeright_search_history');
      if (stored) {
        set({ searchHistory: JSON.parse(stored) });
      }
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  },
}));
