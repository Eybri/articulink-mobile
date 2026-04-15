import { Platform } from 'react-native';

// Production URL — set EXPO_PUBLIC_API_URL in .env to override
const productionURL = process.env.EXPO_PUBLIC_API_URL || 'https://articulink-backend.onrender.com';

// Default to production URL
let baseURL = productionURL;

if (__DEV__) {
    // Read from .env.local — set EXPO_PUBLIC_LOCAL_IP to your machine's LAN IP
    const LOCAL_IP = process.env.EXPO_PUBLIC_LOCAL_IP || '192.168.100.10';
    const PORT = process.env.EXPO_PUBLIC_PORT || '8000';

    if (Platform.OS === 'android') {
        // Physical Android devices need your machine's LAN IP
        // Android emulator: use 10.0.2.2 as EXPO_PUBLIC_LOCAL_IP
        baseURL = `http://${LOCAL_IP}:${PORT}`;
    } else if (Platform.OS === 'ios') {
        baseURL = `http://localhost:${PORT}`;
    } else {
        // Web (Expo web)
        baseURL = `http://localhost:${PORT}`;
    }

    console.log(`[Dev] API Base URL: ${baseURL}`);
}

export default baseURL;