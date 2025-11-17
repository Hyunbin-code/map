import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
} from 'react-native';

interface OnboardingSpeedProps {
  onComplete: (speed: number) => void;
}

type Step = 'welcome' | 'measuring' | 'result';

export function OnboardingSpeed({ onComplete }: OnboardingSpeedProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [progress, setProgress] = useState(0);
  const [measuredSpeed, setMeasuredSpeed] = useState(0);
  const pulseAnim = new Animated.Value(1);

  useEffect(() => {
    if (step === 'measuring') {
      // Progress animation
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setStep('result');
            // Simulate measured speed (1.0 - 1.5 m/s)
            const speed = 1.0 + Math.random() * 0.5;
            setMeasuredSpeed(parseFloat(speed.toFixed(2)));
            return 100;
          }
          return prev + 2;
        });
      }, 100);

      // Pulse animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();

      return () => clearInterval(interval);
    }
  }, [step]);

  const getSpeedCategory = (speed: number) => {
    if (speed < 1.1)
      return { label: '여유롭게', emoji: '🚶', color: '#2563EB' };
    if (speed < 1.3)
      return { label: '보통', emoji: '🚶‍♂️', color: '#10B981' };
    return { label: '빠르게', emoji: '🏃', color: '#F97316' };
  };

  if (step === 'welcome') {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Text style={styles.iconLarge}>👣</Text>
            </View>
            <Text style={styles.title}>TimeRight에 오신 것을 환영합니다</Text>
            <Text style={styles.subtitle}>
              당신의 걷기 속도를 측정하여 맞춤형 길안내를 제공합니다
            </Text>
          </View>

          <View style={styles.featureList}>
            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#DBEAFE' }]}>
                <Text style={styles.featureEmoji}>⚡</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>정확한 도착 시간</Text>
                <Text style={styles.featureDescription}>
                  당신의 걷기 속도로 계산된 실제 도착 시간
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#D1FAE5' }]}>
                <Text style={styles.featureEmoji}>⏱️</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>실시간 행동 알림</Text>
                <Text style={styles.featureDescription}>
                  지금 뛰어야 할지, 여유있게 걸어도 될지 알려드립니다
                </Text>
              </View>
            </View>

            <View style={styles.featureCard}>
              <View style={[styles.featureIcon, { backgroundColor: '#E9D5FF' }]}>
                <Text style={styles.featureEmoji}>✅</Text>
              </View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>환승 타이밍</Text>
                <Text style={styles.featureDescription}>
                  환승할 지하철/버스 도착 시간 실시간 확인
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={() => setStep('measuring')}
            >
              <Text style={styles.primaryButtonText}>걷기 속도 측정 시작</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => onComplete(1.2)}
            >
              <Text style={styles.secondaryButtonText}>나중에 하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    );
  }

  if (step === 'measuring') {
    return (
      <View style={styles.container}>
        <View style={styles.centerContent}>
          <Animated.View
            style={[
              styles.measuringIconContainer,
              { transform: [{ scale: pulseAnim }] },
            ]}
          >
            <Text style={styles.iconXLarge}>👣</Text>
          </Animated.View>

          <Text style={styles.title}>걷기 속도 측정 중...</Text>
          <Text style={styles.subtitle}>평소대로 편안하게 걸어주세요</Text>

          <View style={styles.progressCard}>
            <View style={styles.progressHeader}>
              <Text style={styles.progressLabel}>측정 진행도</Text>
              <Text style={styles.progressPercent}>{progress}%</Text>
            </View>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${progress}%` }]} />
            </View>
            <Text style={styles.progressDescription}>
              GPS를 사용하여 정확한 속도를 측정하고 있습니다
            </Text>
          </View>

          <View style={styles.tipContainer}>
            <Text style={styles.tipText}>💡 팁: 이 측정은 한 번만 하면 됩니다</Text>
            <Text style={styles.tipText}>설정에서 언제든 재측정할 수 있습니다</Text>
          </View>
        </View>
      </View>
    );
  }

  // Result step
  const speedInfo = getSpeedCategory(measuredSpeed);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.centerContent}>
        <View style={styles.successIconContainer}>
          <Text style={styles.iconXLarge}>✅</Text>
        </View>

        <Text style={styles.title}>측정 완료!</Text>
        <Text style={styles.subtitle}>당신의 걷기 속도가 측정되었습니다</Text>

        <View style={styles.resultCard}>
          <View style={styles.resultHeader}>
            <Text style={styles.resultLabel}>당신의 걷기 속도</Text>
            <View style={styles.speedDisplay}>
              <Text style={styles.speedValue}>{measuredSpeed}</Text>
              <Text style={styles.speedUnit}>m/s</Text>
            </View>
            <View style={[styles.categoryBadge, { backgroundColor: '#F3F4F6' }]}>
              <Text style={styles.categoryEmoji}>{speedInfo.emoji}</Text>
              <Text style={[styles.categoryText, { color: speedInfo.color }]}>
                {speedInfo.label} 걷는 스타일
              </Text>
            </View>
          </View>

          <View style={styles.comparisonContainer}>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>평균 속도</Text>
              <Text style={styles.comparisonValue}>1.2 m/s</Text>
            </View>
            <View style={styles.comparisonItem}>
              <Text style={styles.comparisonLabel}>당신</Text>
              <Text style={[styles.comparisonValue, { color: '#2563EB' }]}>
                {measuredSpeed} m/s
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.successBanner}>
          <Text style={styles.successText}>
            🎯 이제 당신에게 딱 맞는 경로 안내를 제공합니다!
          </Text>
        </View>

        <TouchableOpacity
          style={styles.startButton}
          onPress={() => onComplete(measuredSpeed)}
        >
          <Text style={styles.startButtonText}>TimeRight 시작하기</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
  },
  centerContent: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 60,
  },
  iconContainer: {
    width: 80,
    height: 80,
    backgroundColor: '#2563EB',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  iconLarge: {
    fontSize: 40,
  },
  iconXLarge: {
    fontSize: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 24,
  },
  featureList: {
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    gap: 16,
  },
  featureIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  featureEmoji: {
    fontSize: 20,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  buttonGroup: {
    gap: 12,
    paddingBottom: 24,
  },
  primaryButton: {
    backgroundColor: '#2563EB',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#6B7280',
    fontSize: 16,
  },
  measuringIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#2563EB',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  progressPercent: {
    fontSize: 14,
    color: '#2563EB',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#F3F4F6',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#2563EB',
    borderRadius: 6,
  },
  progressDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  tipContainer: {
    marginTop: 24,
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },
  successIconContainer: {
    width: 96,
    height: 96,
    backgroundColor: '#10B981',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  resultCard: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    marginTop: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  resultLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 8,
  },
  speedDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  speedValue: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#111827',
  },
  speedUnit: {
    fontSize: 18,
    color: '#6B7280',
    marginLeft: 8,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    gap: 8,
  },
  categoryEmoji: {
    fontSize: 24,
  },
  categoryText: {
    fontSize: 16,
    fontWeight: '600',
  },
  comparisonContainer: {
    flexDirection: 'row',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    gap: 16,
  },
  comparisonItem: {
    flex: 1,
    alignItems: 'center',
  },
  comparisonLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  comparisonValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  successBanner: {
    backgroundColor: '#DBEAFE',
    padding: 16,
    borderRadius: 16,
    marginTop: 24,
    width: '100%',
    maxWidth: 400,
  },
  successText: {
    fontSize: 16,
    color: '#1E40AF',
    textAlign: 'center',
    fontWeight: '500',
  },
  startButton: {
    backgroundColor: '#10B981',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 24,
    width: '100%',
    maxWidth: 400,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
