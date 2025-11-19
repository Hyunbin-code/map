import { useState, useEffect } from 'react';
import { MapView } from './components/MapView';
import { SearchBar } from './components/SearchBar';
import { RouteCard } from './components/RouteCard';
import { NavigationView } from './components/NavigationView';
import { OnboardingSpeed } from './components/OnboardingSpeed';

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);
  const [userSpeed, setUserSpeed] = useState<number | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [isNavigating, setIsNavigating] = useState(false);
  const [searchQuery, setSearchQuery] = useState({ from: '', to: '' });

  useEffect(() => {
    const onboarded = localStorage.getItem('timeright_onboarded');
    const speed = localStorage.getItem('timeright_user_speed');
    if (onboarded) {
      setHasCompletedOnboarding(true);
      if (speed) setUserSpeed(parseFloat(speed));
    }
  }, []);

  const handleOnboardingComplete = (speed: number) => {
    localStorage.setItem('timeright_onboarded', 'true');
    localStorage.setItem('timeright_user_speed', speed.toString());
    setUserSpeed(speed);
    setHasCompletedOnboarding(true);
  };

  const handleStartNavigation = (route: any) => {
    setSelectedRoute(route);
    setIsNavigating(true);
  };

  const handleStopNavigation = () => {
    setIsNavigating(false);
    setSelectedRoute(null);
  };

  if (!hasCompletedOnboarding) {
    return <OnboardingSpeed onComplete={handleOnboardingComplete} />;
  }

  return (
    <div className="relative h-screen w-full bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 overflow-hidden max-w-[480px] mx-auto">
      {isNavigating && selectedRoute ? (
        <NavigationView
          route={selectedRoute}
          userSpeed={userSpeed || 1.2}
          onStop={handleStopNavigation}
        />
      ) : (
        <>
          <MapView selectedRoute={selectedRoute} />
          
          <SearchBar
            onSearch={setSearchQuery}
            className="absolute top-4 left-4 right-4 z-10"
          />

          {searchQuery.from && searchQuery.to && !selectedRoute && (
            <div className="absolute bottom-0 left-0 right-0 z-20 p-4 space-y-3 max-h-[60vh] overflow-y-auto">
              <RouteCard
                title="빠른 경로"
                time="24분"
                arrivalTime="14:35"
                steps={[
                  { type: 'walk', duration: '3분', distance: '240m', detail: '강남역 7번 출구까지' },
                  { type: 'subway', line: '2호선', duration: '12분', detail: '강남 → 역삼 (1정거장)' },
                  { type: 'walk', duration: '9분', distance: '720m', detail: '목적지까지' }
                ]}
                price="1,400원"
                onSelect={() => setSelectedRoute({ id: 1, type: 'fast' })}
                badge="추천"
              />
              <RouteCard
                title="환승 적음"
                time="28분"
                arrivalTime="14:39"
                steps={[
                  { type: 'walk', duration: '5분', distance: '380m', detail: '강남역 3번 출구까지' },
                  { type: 'bus', line: '146', duration: '15분', detail: '강남역 → 역삼역 (4정거장)' },
                  { type: 'walk', duration: '8분', distance: '640m', detail: '목적지까지' }
                ]}
                price="1,400원"
                onSelect={() => setSelectedRoute({ id: 2, type: 'less-transfer' })}
              />
            </div>
          )}

          {selectedRoute && !isNavigating && (
            <div className="absolute bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur-xl rounded-t-[2rem] p-6 shadow-[0_-8px_32px_rgba(0,0,0,0.08)] border-t border-white/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-cyan-600 mb-1.5">선택된 경로</h3>
                  <p className="text-gray-600">24분 소요 · 14:35 도착</p>
                </div>
                <button
                  onClick={() => setSelectedRoute(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                >
                  ✕
                </button>
              </div>
              <button
                onClick={() => handleStartNavigation(selectedRoute)}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white py-4 rounded-2xl hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
              >
                네비게이션 시작
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}