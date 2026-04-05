import { useRef, useEffect } from "react";
import { Animated, Platform, UIManager, useWindowDimensions } from "react-native";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental && !((global as any).nativeFabricUIManager)) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

/**
 * ViewModel for the About Screen.
 */
export const useAboutViewModel = (navigation: any) => {
    const { width, height } = useWindowDimensions();
    const scrollY = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 25, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const headerTranslateY = scrollY.interpolate({
        inputRange: [0, 250],
        outputRange: [0, -60],
        extrapolate: 'clamp',
    });

    const headerOpacity = scrollY.interpolate({
        inputRange: [0, 180],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const headerScale = scrollY.interpolate({
        inputRange: [0, 250],
        outputRange: [1, 0.92],
        extrapolate: 'clamp',
    });

    const handleBack = () => navigation.goBack();

    return {
        width, height,
        scrollY,
        animations: {
            fadeAnim,
            slideAnim,
            headerTranslateY,
            headerOpacity,
            headerScale
        },
        handleBack
    };
};
