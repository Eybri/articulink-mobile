import { useState, useRef, useCallback, useMemo } from 'react';
import { Animated, useWindowDimensions, NativeSyntheticEvent, NativeScrollEvent } from 'react-native';

/**
 * ViewModel for the StartUp (Onboarding) Screen.
 */
export const useStartUpViewModel = (navigation: any, slidesCount: number) => {
  const { width, height } = useWindowDimensions();
  const [activeIndex, setActiveIndex] = useState(0);
  const flatListRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const isLastSlide = activeIndex === slidesCount - 1;

  const onMomentumScrollEnd = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setActiveIndex(Math.round(e.nativeEvent.contentOffset.x / width));
    }, [width],
  );

  const handleNext = useCallback(() => {
    if (isLastSlide) {
      navigation.navigate('BrandIntro');
    } else {
      const next = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setActiveIndex(next);
    }
  }, [activeIndex, isLastSlide, navigation]);

  const handleSkip = useCallback(() => navigation.navigate('BrandIntro'), [navigation]);

  const interp = useCallback(
    (index: number, out: [number, number, number]) =>
      scrollX.interpolate({
        inputRange: [(index - 1) * width, index * width, (index + 1) * width],
        outputRange: out,
        extrapolate: 'clamp',
      }),
    [scrollX, width],
  );

  const onScroll = useMemo(
    () => Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], { useNativeDriver: false }),
    [scrollX],
  );

  return {
    width,
    height,
    activeIndex,
    setActiveIndex,
    flatListRef,
    scrollX,
    isLastSlide,
    handleNext,
    handleSkip,
    interp,
    onScroll,
    onMomentumScrollEnd,
  };
};
