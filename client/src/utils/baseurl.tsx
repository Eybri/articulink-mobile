import { Platform } from 'react-native';

// In production, this comes from your .env file or build settings
const productionURL = process.env.EXPO_PUBLIC_API_URL || 'https://articulink-backend.onrender.com/api/v1';

// Default to production URL
let baseURL = productionURL;

if (__DEV__) {
    // For local development
    const LOCAL_IP = '192.168.100.10'; // Your current machine IP
    const PORT = '5000';

    if (Platform.OS === 'android') {
        // Android emulator sees your computer as 10.0.2.2, but physical devices need the IP
        baseURL = `http://${LOCAL_IP}:${PORT}/api/v1`;
    } else if (Platform.OS === 'ios') {
        baseURL = `http://localhost:${PORT}/api/v1`;
    } else {
        baseURL = `http://localhost:${PORT}/api/v1`;
    }
    
    console.log(`[Dev] API Base URL: ${baseURL}`);
}

export default baseURL;