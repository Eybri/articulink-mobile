import { Platform } from 'react-native';

// Prioritize the environment variable from .env or .env.local
// This allows you to toggle between Local and Production by simply changing the .env file.
const baseURL = process.env.EXPO_PUBLIC_API_URL || 'https://articulink-backend.onrender.com';

if (__DEV__) {
    console.log(`[Dev] API Base URL: ${baseURL}`);
}

export default baseURL;
