// Update your baseurl.js
import { Platform } from 'react-native';

// For Android emulator
let baseURL = 'http://10.0.2.2:5000/api/v1';

// For iOS simulator
if (Platform.OS === 'ios') {
    baseURL = 'http://localhost:5000/api/v1';
}

// For physical device testing (use your computer's IP)
if (__DEV__) {
    // Get your computer's local IP automatically or set manually
    baseURL = 'http://192.168.100.11:5000/api/v1';
}

export default baseURL;