import { useState, useRef, useEffect, useContext } from 'react';
import { Animated, Alert } from 'react-native';
import { AuthContext, AuthContextType } from '../../../context/AuthContext';

export const CATEGORIES = [
    "Speech Recognition",
    "Pronunciation Feedback",
    "User Interface",
    "Performance",
    "Overall Experience",
    "Others"
];

export const useAppReviewViewModel = (navigation: any) => {
    const auth = useContext(AuthContext) as AuthContextType;
    const { submitFeedback } = auth;

    const [rating, setRating] = useState(0);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [feedback, setFeedback] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const toggleCategory = (category: string) => {
        setSelectedCategories(prev => 
            prev.includes(category) 
                ? prev.filter(c => c !== category) 
                : [...prev, category]
        );
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert("Wait a second", "Please select a star rating before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            await submitFeedback({
                rating,
                categories: selectedCategories,
                feedbackText: feedback
            });

            Alert.alert(
                "Thank You!",
                "Your feedback has been submitted successfully and is visible only to administrators.",
                [
                    { 
                        text: "OK", 
                        onPress: () => {
                            // Go back to the previous screen
                            navigation.goBack();
                        } 
                    }
                ]
            );
        } catch (error) {
            console.error("Failed to submit feedback:", error);
            Alert.alert("Error", "Could not submit your feedback right now. Please try again later.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        rating, setRating,
        selectedCategories,
        feedback, setFeedback,
        isSubmitting,
        toggleCategory,
        handleSubmit,
        animations: { fadeAnim, slideAnim }
    };
};
