import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker } from 'react-native-maps';
import { OnboardingSpeed } from '../components/OnboardingSpeed';
import { SearchBar } from '../components/SearchBar';
import { RouteCard, RouteStep } from '../components/RouteCard';
import { NavigationView } from '../components/NavigationView';
import { useStore } from '../stores/useStore';
import LocationService from '../services/LocationService';

interface SearchQuery {
  from: string;
  to: string;
}

export default function HomeScreen() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userSpeed, setUserSpeed] = useState<number | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({ from: '', to: '' });
  const [isLoading, setIsLoading] = useState(true);

  const { userLocation, setUserLocation } = useStore();

  useEffect(() => {
    checkOnboarding();
    initializeLocation();
  }, []);

  const checkOnboarding = async () => {
    try {
      const onboarded = await AsyncStorage.getItem('timeright_onboarded');
      const speed = await AsyncStorage.getItem('timeright_user_speed');
      if (onboarded) {
        setHasCompletedOnboarding(true);
        if (speed) setUserSpeed(parseFloat(speed));
      }
      setIsLoading(false);
    } catch (error) {
      console.error('Error checking onboarding:', error);
      setIsLoading(false);
    }
  };

  const initializeLocation = async () => {
    try {
      const location = await LocationService.getCurrentLocation();
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error('Error getting location:', error);
      // Fallback to Seoul coordinates
      setUserLocation({
        latitude: 37.5665,
        longitude: 126.978,
      });
    }
  };

  const handleOnboardingComplete = async (speed: number) => {
    try {
      await AsyncStorage.setItem('timeright_onboarded', 'true');
      await AsyncStorage.setItem('timeright_user_speed', speed.toString());
      setUserSpeed(speed);
      setHasCompletedOnboarding(true);
    } catch (error) {
      console.error('Error saving onboarding:', error);
    }
  };

  const handleSearch = (query: SearchQuery) => {
    setSearchQuery(query);
  };

  const handleStartNavigation = (route: any) => {
    setSelectedRoute(route);
    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
  };

  const handleRouteSelect = (routeId: number) => {
    setSelectedRoute({ id: routeId, type: routeId === 1 ? 'fast' : 'less-transfer' });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>로딩 중...</Text>
      </View>
    );
  }

  if (!hasCompletedOnboarding) {
    return <OnboardingSpeed onComplete={handleOnboardingComplete} />;
  }

  if (isNavigating && selectedRoute && userLocation) {
    return (
      <NavigationView
        route={selectedRoute}
        userSpeed={userSpeed || 1.2}
        onStop={handleStopNavigation}
        currentLocation={userLocation}
        destination={{
          latitude: userLocation.latitude + 0.005,
          longitude: userLocation.longitude + 0.005,
        }}
      />
    );
  }

  const mockRoutes = [
    {
      id: 1,
      title: '빠른 경로',
      time: '24분',
      arrivalTime: '14:35',
      steps: [
        { type: 'walk', duration: '3분', distance: '240m', detail: '강남역 7번 출구까지' },
        { type: 'subway', line: '2호선', duration: '12분', detail: '강남 → 역삼 (1정거장)' },
        { type: 'walk', duration: '9분', distance: '720m', detail: '목적지까지' },
      ] as RouteStep[],
      price: '1,400원',
      badge: '추천',
    },
    {
      id: 2,
      title: '환승 적음',
      time: '28분',
      arrivalTime: '14:39',
      steps: [
        { type: 'walk', duration: '5분', distance: '380m', detail: '강남역 3번 출구까지' },
        { type: 'bus', line: '146', duration: '15분', detail: '강남역 → 역삼역 (4정거장)' },
        { type: 'walk', duration: '8분', distance: '640m', detail: '목적지까지' },
      ] as RouteStep[],
      price: '1,400원',
    },
  ];

  return (
    <View style={styles.container}>
      {/* Map */}
      {userLocation && (
        <MapView
          style={styles.map}
          initialRegion={{
            latitude: userLocation.latitude,
            longitude: userLocation.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {selectedRoute && (
            <>
              <Marker
                coordinate={{
                  latitude: userLocation.latitude + 0.005,
                  longitude: userLocation.longitude + 0.005,
                }}
                pinColor="red"
              />
            </>
          )}
        </MapView>
      )}

      {/* Search Bar */}
      <SearchBar onSearch={handleSearch} style={styles.searchBar} />

      {/* Route Cards */}
      {searchQuery.from && searchQuery.to && !selectedRoute && (
        <View style={styles.routeCardsContainer}>
          <ScrollView
            contentContainerStyle={styles.routeCardsContent}
            showsVerticalScrollIndicator={false}
          >
            {mockRoutes.map((route) => (
              <RouteCard
                key={route.id}
                title={route.title}
                time={route.time}
                arrivalTime={route.arrivalTime}
                steps={route.steps}
                price={route.price}
                onSelect={() => handleRouteSelect(route.id)}
                badge={route.badge}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Selected Route - Start Navigation */}
      {selectedRoute && !isNavigating && (
        <View style={styles.selectedRouteCard}>
          <View style={styles.selectedRouteHeader}>
            <View>
              <Text style={styles.selectedRouteTitle}>선택된 경로</Text>
              <Text style={styles.selectedRouteInfo}>24분 소요 · 14:35 도착</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedRoute(null)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity
            style={styles.startButton}
            onPress={() => handleStartNavigation(selectedRoute)}
          >
            <Text style={styles.startButtonText}>네비게이션 시작</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 18,
    color: '#6B7280',
  },
  map: {
    flex: 1,
  },
  searchBar: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
  },
  routeCardsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: '60%',
    backgroundColor: 'transparent',
  },
  routeCardsContent: {
    padding: 16,
    gap: 12,
  },
  selectedRouteCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  selectedRouteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  selectedRouteTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2563EB',
    marginBottom: 4,
  },
  selectedRouteInfo: {
    fontSize: 14,
    color: '#6B7280',
  },
  closeButton: {
    fontSize: 24,
    color: '#9CA3AF',
  },
  startButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
