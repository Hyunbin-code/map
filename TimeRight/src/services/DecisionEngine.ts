import { Decision } from '../types';

interface DecisionParams {
  distance: number; // 미터
  busArrivalTime: number; // 초
  signalWaitTimes: number[]; // 초 배열
}

interface TransferParams {
  platformDistance: number; // 미터
  nextTrainArrival: number; // 초
  crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH';
}

class DecisionEngine {
  private readonly SAFETY_MARGIN = 30; // 30초 안전 마진
  private readonly WALK_SPEED = 1.2; // 평균 보행 속도 (m/s)

  /**
   * 필요한 총 이동 시간 계산
   */
  calculateRequiredTime(distance: number, signalWaitTimes: number[]): number {
    // 순수 이동 시간
    const walkTime = distance / this.WALK_SPEED;

    // 신호 대기 시간 합산
    const totalSignalWait = signalWaitTimes.reduce((sum, wait) => sum + wait, 0);

    // 안전 마진 추가
    return walkTime + totalSignalWait + this.SAFETY_MARGIN;
  }

  /**
   * 행동 결정 (핵심 알고리즘)
   */
  decide(params: DecisionParams): Decision {
    const { distance, busArrivalTime, signalWaitTimes } = params;

    const requiredTime = this.calculateRequiredTime(distance, signalWaitTimes);
    const timeDiff = busArrivalTime - requiredTime;

    if (timeDiff < 0) {
      // 버스를 놓칠 상황
      return {
        action: 'MISSED',
        message: '😢 이번 버스는 놓쳤어요',
        detail: '다음 버스를 이용하세요',
        urgency: 'INFO',
        color: '#666666',
        vibrate: false,
      };
    } else if (timeDiff < 30) {
      // 뛰어야 함!
      return {
        action: 'RUN',
        message: '🏃 지금 빠르게 이동하세요!',
        detail: `${Math.floor(distance)}m 남음, ${Math.floor(timeDiff)}초 여유`,
        urgency: 'HIGH',
        color: '#FF4444',
        vibrate: true,
        sound: 'urgent.mp3',
        voiceAlert: true,
      };
    } else if (timeDiff < 60) {
      // 빠르게 걷기
      return {
        action: 'WALK_FAST',
        message: '🚶 조금 서두르세요',
        detail: `${Math.floor(timeDiff)}초 여유`,
        urgency: 'MEDIUM',
        color: '#FF9900',
        vibrate: true,
        sound: 'normal.mp3',
      };
    } else {
      // 여유있음
      return {
        action: 'WALK_NORMAL',
        message: '✅ 여유있게 가세요',
        detail: `${Math.floor(timeDiff / 60)}분 ${Math.floor(timeDiff % 60)}초 여유`,
        urgency: 'LOW',
        color: '#00CC66',
        vibrate: false,
      };
    }
  }

  /**
   * 환승 타이밍 결정
   */
  decideTransfer(params: TransferParams): Decision {
    const { platformDistance, nextTrainArrival, crowdLevel } = params;

    // 환승 시간 계산
    const transferTime = this.calculateTransferTime(platformDistance, crowdLevel);

    if (nextTrainArrival < transferTime) {
      return {
        action: 'WAIT_NEXT',
        message: '⏳ 다음 열차를 이용하세요',
        detail: '현재 열차는 놓칠 확률이 높습니다',
        urgency: 'INFO',
        color: '#666666',
        vibrate: false,
      };
    } else if (nextTrainArrival - transferTime < 30) {
      return {
        action: 'RUN',
        message: '🏃 빠르게 환승하세요!',
        detail: `${Math.floor(platformDistance)}m 이동`,
        urgency: 'HIGH',
        color: '#FF4444',
        vibrate: true,
      };
    } else {
      return {
        action: 'WALK_NORMAL',
        message: '✅ 여유있게 환승하세요',
        detail: `${Math.floor((nextTrainArrival - transferTime) / 60)}분 여유`,
        urgency: 'LOW',
        color: '#00CC66',
        vibrate: false,
      };
    }
  }

  /**
   * 환승 시간 계산
   */
  private calculateTransferTime(distance: number, crowdLevel: 'LOW' | 'MEDIUM' | 'HIGH'): number {
    const baseTime = distance / this.WALK_SPEED;

    const crowdMultiplier = {
      LOW: 1.0,
      MEDIUM: 1.2,
      HIGH: 1.5,
    }[crowdLevel];

    const stairPenalty = 30; // 계단 평균 30초

    return (baseTime + stairPenalty) * crowdMultiplier;
  }
}

export default new DecisionEngine();
