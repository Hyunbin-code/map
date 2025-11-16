import DecisionEngine from '../src/services/DecisionEngine';

describe('DecisionEngine', () => {
  describe('decide', () => {
    test('should return RUN when time is very tight', () => {
      const result = DecisionEngine.decide({
        distance: 200,
        busArrivalTime: 180, // 3분
        signalWaitTimes: [0],
      });

      expect(result.action).toBe('RUN');
      expect(result.urgency).toBe('HIGH');
      expect(result.vibrate).toBe(true);
    });

    test('should return WALK_FAST when time is moderate', () => {
      const result = DecisionEngine.decide({
        distance: 200,
        busArrivalTime: 250, // 4분 10초
        signalWaitTimes: [0],
      });

      expect(result.action).toBe('WALK_FAST');
      expect(result.urgency).toBe('MEDIUM');
      expect(result.vibrate).toBe(true);
    });

    test('should return WALK_NORMAL when plenty of time', () => {
      const result = DecisionEngine.decide({
        distance: 200,
        busArrivalTime: 600, // 10분
        signalWaitTimes: [0],
      });

      expect(result.action).toBe('WALK_NORMAL');
      expect(result.urgency).toBe('LOW');
      expect(result.vibrate).toBe(false);
    });

    test('should return MISSED when time is negative', () => {
      const result = DecisionEngine.decide({
        distance: 500,
        busArrivalTime: 60, // 1분
        signalWaitTimes: [0],
      });

      expect(result.action).toBe('MISSED');
      expect(result.urgency).toBe('INFO');
      expect(result.vibrate).toBe(false);
    });

    test('should account for signal wait times', () => {
      const result = DecisionEngine.decide({
        distance: 200,
        busArrivalTime: 300, // 5분
        signalWaitTimes: [60, 60], // 2개 신호, 각 60초
      });

      // 200m / 1.2m/s = 167초
      // + 120초 (신호)
      // + 30초 (마진)
      // = 317초 > 300초
      expect(result.action).toBe('MISSED');
    });

    test('should return WAIT_NEXT when bus is about to arrive (no time)', () => {
      const result = DecisionEngine.decide({
        distance: 800,
        busArrivalTime: 120, // 2분
        signalWaitTimes: [30],
      });

      // 800m는 너무 멀어서 불가능
      expect(result.action).toBe('MISSED');
    });
  });

  describe('calculateRequiredTime', () => {
    test('should calculate correct time for 200m with no signals', () => {
      const time = DecisionEngine.calculateRequiredTime(200, []);

      // 200m / 1.2m/s = 167초
      // + 30초 (마진) = 197초
      expect(time).toBeCloseTo(197, 0);
    });

    test('should include signal wait times', () => {
      const time = DecisionEngine.calculateRequiredTime(200, [30, 45]);

      // 200m / 1.2m/s = 167초
      // + 75초 (신호)
      // + 30초 (마진) = 272초
      expect(time).toBeCloseTo(272, 0);
    });

    test('should handle zero distance', () => {
      const time = DecisionEngine.calculateRequiredTime(0, []);

      // 0m + 30초 마진 = 30초
      expect(time).toBe(30);
    });
  });

  describe('edge cases', () => {
    test('should handle negative distance gracefully', () => {
      const result = DecisionEngine.decide({
        distance: -100,
        busArrivalTime: 300,
        signalWaitTimes: [],
      });

      // 음수 거리는 0으로 처리되어 여유 있음
      expect(result.action).toBe('WALK_NORMAL');
    });

    test('should handle very large distances', () => {
      const result = DecisionEngine.decide({
        distance: 10000, // 10km
        busArrivalTime: 600, // 10분
        signalWaitTimes: [],
      });

      // 10km를 10분에 갈 수 없음
      expect(result.action).toBe('MISSED');
    });

    test('should handle empty signal wait times array', () => {
      const result = DecisionEngine.decide({
        distance: 300,
        busArrivalTime: 400,
        signalWaitTimes: [],
      });

      // 300m / 1.2m/s = 250초
      // + 30초 (마진) = 280초 < 400초
      expect(result.action).toBe('WALK_NORMAL');
    });
  });

  describe('decision messages', () => {
    test('RUN decision should have urgent message', () => {
      const result = DecisionEngine.decide({
        distance: 200,
        busArrivalTime: 180,
        signalWaitTimes: [],
      });

      expect(result.message).toContain('뛰어');
      expect(result.color).toBe('#FF4444');
    });

    test('WALK_NORMAL decision should have calm message', () => {
      const result = DecisionEngine.decide({
        distance: 100,
        busArrivalTime: 600,
        signalWaitTimes: [],
      });

      expect(result.message).toContain('여유');
      expect(result.color).toBe('#00CC66');
    });

    test('MISSED decision should have informative message', () => {
      const result = DecisionEngine.decide({
        distance: 1000,
        busArrivalTime: 60,
        signalWaitTimes: [],
      });

      expect(result.message).toContain('놓쳤');
      expect(result.color).toBe('#666666');
    });
  });
});
