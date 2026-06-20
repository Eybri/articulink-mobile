import { useState, useRef, useEffect, useCallback, useContext } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { Animated } from 'react-native';
import { AuthContext, AuthContextType } from '../../../context/AuthContext';

export type FeedbackItem = {
    id: string;
    rating: number;
    categories: string[];
    feedbackText: string;
    dateSubmitted: string;
    adminReply?: string;
};

export const useMyFeedbacksViewModel = (navigation: any) => {
    const auth = useContext(AuthContext) as AuthContextType;
    const { fetchFeedbacks: apiFetchFeedbacks } = auth;

    const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const fetchFeedbacks = useCallback(async () => {
        try {
            setLoading(true);
            const data = await apiFetchFeedbacks();
            const formatted = data.map((item: any) => {
                const d = new Date(item.createdAt);
                const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                return {
                    id: item._id,
                    rating: item.rating,
                    categories: item.categories || [],
                    feedbackText: item.feedbackText || "",
                    dateSubmitted: dateStr,
                    adminReply: item.adminReply
                };
            });
            setFeedbacks(formatted);
        } catch (error) {
            console.error("Failed to fetch feedbacks:", error);
        } finally {
            setLoading(false);
        }
    }, [apiFetchFeedbacks]);

    useFocusEffect(
        useCallback(() => {
            fetchFeedbacks();
        }, [fetchFeedbacks])
    );

    return {
        feedbacks,
        loading,
        animations: { fadeAnim, slideAnim }
    };
};
