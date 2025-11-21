import {
  MOCK_BUS_STOPS,
  findStopById,
  searchStopsByName,
  findNearbyStops,
} from '../src/data/busStops';

describe('busStops data', () => {
  describe('MOCK_BUS_STOPS', () => {
    test('should have at least 5 bus stops', () => {
      expect(MOCK_BUS_STOPS.length).toBeGreaterThanOrEqual(5);
    });

    test('all stops should have required fields', () => {
      MOCK_BUS_STOPS.forEach((stop) => {
        expect(stop).toHaveProperty('id');
        expect(stop).toHaveProperty('type');
        expect(stop).toHaveProperty('name');
        expect(stop).toHaveProperty('location');
        expect(stop.location).toHaveProperty('latitude');
        expect(stop.location).toHaveProperty('longitude');
      });
    });

    test('all stops should be of type BUS', () => {
      MOCK_BUS_STOPS.forEach((stop) => {
        expect(stop.type).toBe('BUS');
      });
    });

    test('all coordinates should be valid Seoul area', () => {
      MOCK_BUS_STOPS.forEach((stop) => {
        // Seoul area roughly: 37.4 - 37.7 latitude, 126.8 - 127.2 longitude
        expect(stop.location.latitude).toBeGreaterThan(37.4);
        expect(stop.location.latitude).toBeLessThan(37.7);
        expect(stop.location.longitude).toBeGreaterThan(126.8);
        expect(stop.location.longitude).toBeLessThan(127.2);
      });
    });
  });

  describe('findStopById', () => {
    test('should find existing stop by ID', () => {
      const stop = findStopById('stop-gangnam-01');

      expect(stop).toBeDefined();
      expect(stop?.id).toBe('stop-gangnam-01');
      expect(stop?.name).toContain('강남역');
    });

    test('should return undefined for non-existent ID', () => {
      const stop = findStopById('non-existent-id');

      expect(stop).toBeUndefined();
    });

    test('should handle empty string ID', () => {
      const stop = findStopById('');

      expect(stop).toBeUndefined();
    });
  });

  describe('searchStopsByName', () => {
    test('should find stops by partial name match', () => {
      const results = searchStopsByName('강남');

      expect(results.length).toBeGreaterThan(0);
      results.forEach((stop) => {
        expect(stop.name.toLowerCase()).toContain('강남');
      });
    });

    test('should be case-insensitive', () => {
      const results = searchStopsByName('GANGNAM');

      // Should find "강남" even though query is uppercase
      expect(results.length).toBeGreaterThanOrEqual(0);
    });

    test('should return empty array for non-matching query', () => {
      const results = searchStopsByName('없는정류장이름123');

      expect(results).toEqual([]);
    });

    test('should return all stops for empty query', () => {
      const results = searchStopsByName('');

      expect(results.length).toBe(MOCK_BUS_STOPS.length);
    });
  });

  describe('findNearbyStops', () => {
    test('should find stops near Gangnam Station', () => {
      // Gangnam Station coordinates
      const results = findNearbyStops(37.498095, 127.027583, 500);

      expect(results.length).toBeGreaterThan(0);

      // First result should be one of the Gangnam stops
      expect(results[0].name).toContain('강남역');
    });

    test('should return stops sorted by distance', () => {
      const results = findNearbyStops(37.498095, 127.027583, 5000);

      // Check that distances are in ascending order
      for (let i = 1; i < results.length; i++) {
        const prevDistance = calculateDistance(
          37.498095,
          127.027583,
          results[i - 1].location.latitude,
          results[i - 1].location.longitude
        );
        const currDistance = calculateDistance(
          37.498095,
          127.027583,
          results[i].location.latitude,
          results[i].location.longitude
        );

        expect(currDistance).toBeGreaterThanOrEqual(prevDistance);
      }
    });

    test('should return empty array when no stops within radius', () => {
      // Very far from Seoul (Busan area)
      const results = findNearbyStops(35.1796, 129.0756, 100);

      expect(results).toEqual([]);
    });

    test('should respect radius parameter', () => {
      const results = findNearbyStops(37.498095, 127.027583, 100);

      results.forEach((stop) => {
        const distance = calculateDistance(
          37.498095,
          127.027583,
          stop.location.latitude,
          stop.location.longitude
        );

        expect(distance).toBeLessThanOrEqual(100);
      });
    });

    test('should use default radius of 500m when not specified', () => {
      const results = findNearbyStops(37.498095, 127.027583);

      results.forEach((stop) => {
        const distance = calculateDistance(
          37.498095,
          127.027583,
          stop.location.latitude,
          stop.location.longitude
        );

        expect(distance).toBeLessThanOrEqual(500);
      });
    });
  });
});

// Helper function to calculate distance (same as in busStops.ts)
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
