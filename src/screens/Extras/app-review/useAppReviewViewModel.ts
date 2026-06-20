import { useState, useRef, useEffect, useContext } from 'react';
import { Animated, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
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
    const [images, setImages] = useState<string[]>([]);
    
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(20)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const toggleCategory = (category: string) => {
        if (selectedCategories.includes(category)) {
            setSelectedCategories(selectedCategories.filter(c => c !== category));
        } else {
            setSelectedCategories([...selectedCategories, category]);
        }
    };

    const pickImage = async () => {
        if (images.length >= 3) {
            Alert.alert("Limit Reached", "You can only attach up to 3 images.");
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
            setImages(prev => [...prev, result.assets[0].uri]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async () => {
        if (rating === 0) {
            Alert.alert("Wait a second", "Please select a star rating before submitting.");
            return;
        }

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append('rating', rating.toString());
            formData.append('categories', JSON.stringify(selectedCategories));
            formData.append('feedbackText', feedback);

            images.forEach((imageUri, index) => {
                const filename = imageUri.split('/').pop() || `image_${index}.jpg`;
                const match = /\.(\w+)$/.exec(filename);
                const type = match ? `image/${match[1]}` : `image`;
                formData.append('images', { uri: imageUri, name: filename, type } as any);
            });

            await submitFeedback(formData);

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
        images,
        pickImage,
        removeImage,
        toggleCategory,
        handleSubmit,
        animations: { fadeAnim, slideAnim }
    };
};
