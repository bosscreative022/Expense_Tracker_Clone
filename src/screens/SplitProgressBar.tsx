// components/SplitProgressBar.tsx
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing } from 'react-native';

const TOTAL_STEPS = 3;

export default function SplitProgressBar({ step }: { step: number }) {
  const bars = useRef(
    Array.from({ length: TOTAL_STEPS }, () => new Animated.Value(0))
  ).current;

  const prevStep = useRef(step);
  const mounted = useRef(false);

  useEffect(() => {
    // 🔹 FIRST RENDER → just set values, no animation
    if (!mounted.current) {
      bars.forEach((bar, index) => {
        if (index + 1 <= step) {
          bar.setValue(1); // ✅ line visible on start
        }
      });
      mounted.current = true;
      return;
    }

    const from = prevStep.current;
    const to = step;

    // 🔹 Static bars (do NOT touch animated one)
    bars.forEach((bar, index) => {
      const barStep = index + 1;

      if (barStep < Math.min(from, to)) bar.setValue(1);
      if (barStep > Math.max(from, to)) bar.setValue(0);
    });

    // 🔹 NEXT
    if (to > from) {
      bars[to - 1].setValue(0);
      Animated.timing(bars[to - 1], {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }

    // 🔹 BACK
    if (to < from) {
      bars[from - 1].setValue(1);
      Animated.timing(bars[from - 1], {
        toValue: 0,
        duration: 350,
        easing: Easing.inOut(Easing.cubic),
        useNativeDriver: false,
      }).start();
    }

    prevStep.current = step;
  }, [step]);

  return (
    <View style={{ flexDirection: 'row', gap: 6, marginTop: 10 }}>
      {bars.map((bar, index) => (
        <View
          key={index}
          style={{
            flex: 1,
            height: 4,
            backgroundColor: '#222',
            borderRadius: 4,
            overflow: 'hidden',
          }}
        >
          <Animated.View
            style={{
              height: 4,
              backgroundColor: '#fff',
              width: bar.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            }}
          />
        </View>
      ))}
    </View>
  );
}