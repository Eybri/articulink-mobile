import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

/**
 * ViewModel for the Brand Intro Screen.
 */
export const useBrandIntroViewModel = (navigation: any) => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleGetStarted = () => {
        navigation.navigate('Login');
    };

    return {
        handleGetStarted,
        animations: {
            fadeAnim,
            slideAnim
        }
    };
};
