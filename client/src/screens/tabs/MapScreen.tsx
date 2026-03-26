import React, { useState, useEffect } from 'react';
import { View, Linking, Platform, StatusBar, Animated, useWindowDimensions } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  H1,
  SizableText,
  Card,
  Image,
  ScrollView,
  Spinner,
  Theme,
  AnimatePresence,
} from "tamagui";
import {
  Map as MapIcon,
  Navigation,
  Phone,
  LocateFixed,
  RefreshCw,
  Search,
  ChevronRight,
  Car,
  Footprints,
  Bike,
  Clock,
  MapPin,
  AlertCircle,
  Activity,
  Trash2,
  Mic,
  Activity as ActivityIcon,
  GraduationCap,
  Accessibility,
  MessageSquare,
} from "@tamagui/lucide-icons";

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',
  teal: '#2A8FA0',
  tealLight: '#3DAFC4',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

interface Center {
  id: string;
  name: string;
  fullAddress: string;
  latitude: number;
  longitude: number;
  type: string;
  services: string[];
  distance: number;
  source: string;
  isReal: boolean;
  icon: string;
  phone?: string;
}

interface RouteInfo {
  distance: string;
  duration: string;
  geometry: any;
}

const SpeechTherapyMaps: React.FC = () => {
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [centers, setCenters] = useState<Center[]>([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(1);
  const webViewRef = React.useRef<WebView>(null);
  const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'bicycling'>('driving');
  const [isListExpanded, setIsListExpanded] = useState(true);
  const { width, height } = useWindowDimensions();
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const slideAnim = React.useRef(new Animated.Value(30)).current;

  const SEARCH_RADIUS = 10000;
  const MAX_RESULTS = 15;

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  const fetchNominatim = async (lat: number, lng: number, terms: string[], type: 'speech' | 'voice' | 'school' | 'pwd', icon: string) => {
    const facilities: Center[] = [];
    const serviceMap = {
      speech: ['Articulation Therapy', 'Lisp Correction', 'Nasal Speech', 'Voice Therapy'],
      voice: ['Voice Disorders', 'Resonance Therapy', 'Nasal Speech Treatment', 'Articulation'],
      school: ['Special Education', 'Speech Therapy', 'Language Development', 'Communication Skills'],
      pwd: ['Disability Support', 'Speech Services', 'Communication Therapy', 'Rehabilitation']
    } as any;
    const typeMap = {
      speech: 'speech-therapy',
      voice: 'voice-clinic',
      school: 'sped-school',
      pwd: 'pwd-center'
    } as any;

    for (const term of terms) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&lat=${lat}&lon=${lng}&radius=${SEARCH_RADIUS / 1000}&limit=${type === 'speech' ? 5 : 3}`,
          { headers: { 'User-Agent': 'SpeechTherapyApp/1.0' } }
        );
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter((p: any) => {
            const n = p.display_name.toLowerCase();
            const d = calculateDistance(lat, lng, parseFloat(p.lat), parseFloat(p.lon));
            return d <= SEARCH_RADIUS / 1000 && !n.match(/physical therapy|physiotherapy|dental|dentist|orthodont/);
          });
          facilities.push(...filtered.map((p: any) => ({
            id: `${type}-${p.place_id}`,
            name: p.display_name.split(',')[0] || (type === 'school' ? 'SPED School' : type === 'pwd' ? 'PWD Center' : 'Speech Therapy Center'),
            fullAddress: p.display_name,
            latitude: parseFloat(p.lat),
            longitude: parseFloat(p.lon),
            type: typeMap[type],
            services: serviceMap[type],
            distance: calculateDistance(lat, lng, parseFloat(p.lat), parseFloat(p.lon)),
            source: 'nominatim',
            isReal: true,
            icon
          })));
        }
        await new Promise(r => setTimeout(r, 1000));
      } catch (e) { console.log(`Search failed: ${term}`, e); }
    }
    return facilities;
  };

  const searchOverpass = async (lat: number, lng: number): Promise<Center[]> => {
    try {
      const query = `[out:json][timeout:25];(node["amenity"="clinic"]["healthcare:speciality"="speech_therapy"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="clinic"]["name"~"[Ss]peech [Tt]herapy|[Ss]peech [Pp]athology"](around:${SEARCH_RADIUS},${lat},${lng});node["healthcare"="speech_therapist"](around:${SEARCH_RADIUS},${lat},${lng});way["amenity"="clinic"]["healthcare:speciality"="speech_therapy"](around:${SEARCH_RADIUS},${lat},${lng});node["office"="therapist"]["therapist:type"="speech"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="school"]["school:for"="special_education"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="school"]["name"~"SPED|Special Education|Speech"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="social_facility"]["social_facility:for"="disabled"](around:${SEARCH_RADIUS},${lat},${lng});node["office"="association"]["association"~"disability|PWD"](around:${SEARCH_RADIUS},${lat},${lng}););out center;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });
      const data = await res.json();
      return (data.elements || []).map((e: any) => {
        const eLat = e.lat || e.center?.lat;
        const eLon = e.lon || e.center?.lon;
        if (!eLat || !eLon) return null;
        const name = e.tags?.name || '';
        const d = calculateDistance(lat, lng, eLat, eLon);
        if (d > SEARCH_RADIUS / 1000 || name.match(/physical|dental|physiotherapy/i)) return null;

        const isSped = e.tags?.amenity === 'school' || name.match(/school|SPED|education/i);
        const isPwd = e.tags?.amenity === 'social_facility' || e.tags?.office === 'association' || name.match(/PWD|disability|disabled/i);

        return {
          id: `overpass-${e.id}`,
          name: e.tags?.name || (isSped ? 'SPED School' : isPwd ? 'PWD Center' : 'Speech Therapy Center'),
          fullAddress: [e.tags?.['addr:street'], e.tags?.['addr:city'], e.tags?.['addr:province']].filter(Boolean).join(', ') || 'Address not available',
          latitude: eLat,
          longitude: eLon,
          type: isSped ? 'sped-school' : isPwd ? 'pwd-center' : 'speech-therapy',
          services: isSped ? ['Special Education', 'Speech Therapy', 'Language Development'] : isPwd ? ['Disability Support', 'Speech Services', 'Rehabilitation'] : ['Speech Therapy', 'Articulation', 'Voice Disorders'],
          distance: d,
          source: 'overpass',
          isReal: true,
          icon: isSped ? '🏫' : isPwd ? '♿' : '🗣️'
        };
      }).filter(Boolean) as Center[];
    } catch (e) { console.log('Overpass failed', e); return []; }
  };

  const searchCenters = async (lat: number, lng: number) => {
    try {
      console.log('🔍 Searching nearby centers within 10km...');
      let found: Center[] = [];

      const speech = await fetchNominatim(lat, lng, ['speech therapy', 'speech pathology', 'speech language pathologist', 'speech therapist', 'articulation therapy', 'voice therapy', 'speech clinic'], 'speech', '🗣️');
      found.push(...speech);

      const voice = await fetchNominatim(lat, lng, ['speech language hearing center', 'voice clinic', 'communication clinic', 'speech and hearing center'], 'voice', '🎤');
      found.push(...voice);

      const schools = await fetchNominatim(lat, lng, ['special education school', 'SPED school', 'speech disorder school', 'communication disorder school', 'special needs school'], 'school', '🏫');
      found.push(...schools);

      const pwd = await fetchNominatim(lat, lng, ['PWD center', 'persons with disability center', 'disability support center', 'speech disability center', 'communication disability center'], 'pwd', '♿');
      found.push(...pwd);

      const overpass = await searchOverpass(lat, lng);
      found.push(...overpass);

      const unique = found
        .filter((c, i, s) => i === s.findIndex(x => x.latitude.toFixed(4) === c.latitude.toFixed(4) && x.longitude.toFixed(4) === c.longitude.toFixed(4)))
        .sort((a, b) => a.distance - b.distance)
        .filter(c => c.distance <= SEARCH_RADIUS / 1000);

      setCenters(unique.slice(0, MAX_RESULTS));
      setLoading(false);
    } catch (e) {
      console.error('Search error:', e);
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      setError(null);
      setMapLoading(true);
      setSelectedCenter(null);
      setRouteInfo(null);

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Permission to access location was denied. Please enable location services to find nearby speech therapy centers.');
        setLoading(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const { latitude, longitude } = loc.coords;
      setLocation({ latitude, longitude });
      await searchCenters(latitude, longitude);
    } catch (e) {
      console.error('Location error:', e);
      setError('Error getting your location. Please try again.');
      setLoading(false);
    }
  };

  const getRouteInfo = async (center: Center) => {
    try {
      if (!location) return;
      const res = await fetch(`https://router.project-osrm.org/route/v1/${travelMode}/${location.longitude},${location.latitude};${center.longitude},${center.latitude}?overview=full&geometries=geojson`);
      if (res.ok) {
        const data = await res.json();
        if (data.routes?.[0]) {
          const r = data.routes[0];
          const info = {
            distance: `${(r.distance / 1000).toFixed(1)} km`,
            duration: `${Math.ceil(r.duration / 60)} mins`,
            geometry: r.geometry
          };
          setRouteInfo(info);
          
          // Post route to WebView
          webViewRef.current?.injectJavaScript(`
            if (window.showRoute) window.showRoute(${JSON.stringify(r.geometry)});
            true;
          `);
        }
      }
    } catch (e) {
      console.error('Route error:', e);
      if (location) {
        const d = calculateDistance(location.latitude, location.longitude, center.latitude, center.longitude);
        const speeds = { driving: 40, walking: 5, bicycling: 15 };
        setRouteInfo({
          distance: `${d.toFixed(1)} km`,
          duration: `${Math.ceil((d / speeds[travelMode]) * 60)} mins`,
          geometry: null
        });
      }
    }
  };

  const handleCenterSelect = (center: Center) => {
    setSelectedCenter(center);
    setRouteInfo(null);
    getRouteInfo(center);
    setIsListExpanded(false); 
  };

  const openGoogleMaps = () => {
    const url = location
      ? `https://www.google.com/maps/search/speech+therapy+articulation+lisp+near+me/@${location.latitude},${location.longitude},12z`
      : 'https://www.google.com/maps/search/speech+therapy+near+me';
    Linking.openURL(url);
  };

  const openDirections = (center: Center) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}&travelmode=${travelMode}`);
  };

  const changeTravelMode = (mode: 'driving' | 'walking' | 'bicycling') => {
    setTravelMode(mode);
    if (selectedCenter) getRouteInfo(selectedCenter);
  };

  const generateMapHTML = () => {
    if (!location) return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;background:#FAF8F4}.loading{text-align:center;color:#1A4480;font-weight:bold}</style></head><body><div class="loading">Initializing Map...</div></body></html>`;

    // Correctly escape for JSON string safely
    const safeStr = JSON.stringify(centers || []).replace(/`/g, '\\`').replace(/\$/g, '\\$');

    return `<!DOCTYPE html><html><head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <style>
        #map { height: 100vh; width: 100%; position: absolute; top: 0; left: 0; background: #FAF8F4; }
        body { margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif; height: 100vh; }
        
        .user-marker {
          width: 18px; height: 18px;
          background: #1A4480;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 10px rgba(26,68,128,0.4);
          position: relative;
        }
        .user-marker::after {
          content: '';
          position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px;
          border-radius: 50%;
          background: rgba(26,68,128,0.2);
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(0.6); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .leaflet-div-icon {
          background: transparent !important;
          border: none !important;
        }

        .facility-marker {
          background: white !important;
          width: 38px !important; height: 38px !important;
          border-radius: 14px !important;
          display: flex !important; 
          align-items: center !important; 
          justify-content: center !important;
          box-shadow: 0 6px 16px rgba(15,40,71,0.12) !important;
          border: 1.5px solid #DDD6C8 !important;
          transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important;
          padding: 0 !important;
          margin: 0 !important;
          box-sizing: border-box !important;
        }
        .facility-marker svg {
          display: block !important;
          margin: 0 !important;
        }
        .facility-marker:active { transform: scale(0.9); }
        
        .leaflet-popup-content-wrapper { 
          border-radius: 20px; 
          padding: 6px;
          box-shadow: 0 12px 30px rgba(15,40,71,0.25);
        }
        .leaflet-popup-tip { display: none; }
        .popup-card { padding: 8px; text-align: center; }
        .popup-title { font-weight: 900; color: #1C2B3A; font-size: 14px; margin-bottom: 2px; }
        .popup-type { color: #1A4480; font-weight: 800; font-size: 9px; text-transform: uppercase; margin-bottom: 4px; opacity: 0.7; }
        .popup-btn { 
          background: #1A4480; color: white; border: none; 
          padding: 8px 12px; border-radius: 12px; font-weight: 800;
          font-size: 12px; width: 100%; margin-top: 8px; cursor: pointer;
        }
      </style>
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
    </head><body><div id="map"></div><script>
      let map, routeLayer = null;
      const icons = {
        'speech-therapy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A4480" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>',
        'voice-clinic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A8FA0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>',
        'sped-school': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A4480" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>',
        'pwd-center': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A8FA0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="4" r="1"/><path d="M12.3 10a2 2 0 0 0-2.3 1.3l-1.4 3.4c-.2.5-.2 1.1 0 1.6l1.2 3.2c.2.5.7.8 1.2.8h3.3"/><path d="M15 10l-3.5 1.5L9 16l3 5"/></svg>'
      };

      try {
        map = L.map('map', { zoomControl: false }).setView([${location.latitude}, ${location.longitude}], 14);
        L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);

        L.marker([${location.latitude}, ${location.longitude}], {
          icon: L.divIcon({ className: 'user-marker', iconSize: [18, 18], iconAnchor: [9, 9] })
        }).addTo(map);

        let centers = JSON.parse(\`${safeStr}\`);
        centers.forEach(c => {
          const marker = L.marker([c.latitude, c.longitude], {
            icon: L.divIcon({ 
              className: 'facility-marker', 
              html: icons[c.type] || icons['speech-therapy'], 
              iconSize: [38, 38], 
              iconAnchor: [19, 19] 
            })
          }).addTo(map);

          const typeLabel = c.type==='speech-therapy'?'Speech Therapy Center':c.type==='voice-clinic'?'Voice & Speech Clinic':c.type==='sped-school'?'SPED School':c.type==='pwd-center'?'PWD Center':'Center';
          
          marker.bindPopup(\`
            <div class="popup-card">
              <div class="popup-type">\${typeLabel}</div>
              <div class="popup-title">\${c.name}</div>
              <button class="popup-btn" onclick="window.selectCenter(\${c.latitude},\${c.longitude})">View Route</button>
            </div>
          \`, { offset: [0, -10] });
        });

        window.selectCenter = (lat, lng) => {
          if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({ type:'CENTER_SELECT', center:{latitude:lat, longitude:lng} }));
        };

        window.showRoute = (g) => {
          if (routeLayer) map.removeLayer(routeLayer);
          if (g?.coordinates) {
            const latlngs = g.coordinates.map(co => [co[1], co[0]]);
            routeLayer = L.polyline(latlngs, { color: '#1A4480', weight: 6, opacity: 0.8, lineCap: 'round', dashArray: '1, 12' }).addTo(map);
            map.fitBounds(routeLayer.getBounds(), { padding: [40, 40] });
          }
        };

        window.addEventListener('message', e => {
          try {
            const d = JSON.parse(e.data);
            if (d.type === 'SHOW_ROUTE') window.showRoute(d.route);
          } catch(err) {}
        });

        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_LOADED'}));
      } catch (e) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_ERROR', error: e.toString()}));
      }
    </script></body></html>`;
  };

  const handleWebViewMessage = (e: any) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'CENTER_SELECT') {
        const c = centers.find(x => x.latitude === data.center.latitude && x.longitude === data.center.longitude);
        if (c) handleCenterSelect(c);
      } else if (data.type === 'MAP_LOADED' || data.type === 'MAP_ERROR') {
        setMapLoading(false);
      }
    } catch (er) { console.log('WebView message error:', er); }
  };

  const handleRetry = () => {
    setWebViewKey(p => p + 1);
    setLoading(true);
    setError(null);
    setCenters([]);
    setMapLoading(true);
    setSelectedCenter(null);
    setRouteInfo(null);
    getCurrentLocation();
  };

  useEffect(() => { 
    getCurrentLocation(); 
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 20,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  if (loading) {
    return (
      <YStack f={1} jc="center" ai="center" bg={COLORS.cream} p="$6">
        <Spinner size="large" color={COLORS.royalBlue} mb="$4" />
        <SizableText size="$5" fow="700" color={COLORS.textDark} ta="center">Finding nearby speech centers...</SizableText>
        <SizableText size="$2" color={COLORS.textMid} ta="center" mt="$2">Searching your immediate area within 10km</SizableText>
      </YStack>
    );
  }

  if (error) {
    return (
      <YStack flex={1} jc="center" ai="center" bg={COLORS.cream} p="$6" gap="$4">
        <Circle size={80} bg="rgba(239,68,68,0.1)" jc="center" ai="center">
          <AlertCircle size={40} color="#EF4444" />
        </Circle>
        <YStack ai="center">
          <SizableText size="$6" fontWeight="800" color={COLORS.textDark} ta="center">Location Choice Needed</SizableText>
          <SizableText size="$3" color={COLORS.textMid} ta="center" mt="$2">{error}</SizableText>
        </YStack>
        <YStack w="100%" gap="$3">
          <Button bg={COLORS.royalBlue} color="white" fontWeight="700" br={16} h={54} onPress={handleRetry}>Try Again</Button>
          <Button bw={1} bc={COLORS.sandMid} bg="transparent" color={COLORS.textDark} fontWeight="700" br={16} h={54} onPress={openGoogleMaps}>Open in Google Maps</Button>
        </YStack>
      </YStack>
    );
  }

  return (
    <YStack flex={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background blobs */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.1} r={-width * 0.15} size={width * 0.7} bg={COLORS.orbBlue} opacity={0.3} />
        <Circle pos="absolute" b={-height * 0.05} l={-width * 0.1} size={width * 0.6} bg={COLORS.orbTeal} opacity={0.2} />
      </ZStack>

      {/* Map Header */}
      <YStack pt="$4" px="$4" pb="$2.5" bg="transparent">
        <XStack ai="center" jc="space-between" mb="$2">
          <YStack>
            <H1 size="$7" fow="900" color={COLORS.textDark} ls={-1}>Articulink Maps</H1>
            <SizableText size="$2" color={COLORS.textMid} fow="600" o={0.8}>Nearby Speech & Voice Clinics</SizableText>
          </YStack>
          <Circle 
            size={40} 
            circular 
            bg="white" 
            bw={1} 
            bc={COLORS.sandMid} 
            elevation={2}
            shadowColor={COLORS.deepNavy}
            shadowOpacity={0.1}
            onPress={handleRetry}
          >
            <RefreshCw size={18} color={COLORS.royalBlue} />
          </Circle>
        </XStack>
      </YStack>

      <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
        <ZStack f={1} mx="$4" mb="$4" mt="$0" br={28} ov="hidden" bw={1.5} bc={COLORS.sandMid} elevation={4} shadowColor={COLORS.deepNavy}>
        <WebView
          ref={webViewRef}
          key={webViewKey}
          source={{ html: generateMapHTML() }}
          style={{ flex: 1 }}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setMapLoading(false)}
        />
        
        {mapLoading && (
          <YStack fullscreen jc="center" ai="center" bg="rgba(255,255,255,0.7)">
            <Spinner size="large" color={COLORS.royalBlue} />
            <SizableText mt="$2" color={COLORS.royalBlue} fow="700">Loading map data...</SizableText>
          </YStack>
        )}

        <Button
          pos="absolute"
          b={30}
          r={20}
          size="$4"
          circular
          bg="white"
          elevation={5}
          shadowColor={COLORS.deepNavy}
          shadowOpacity={0.2}
          icon={<LocateFixed size={20} color={COLORS.royalBlue} />}
          onPress={() => setWebViewKey(p => p + 1)}
        />
        </ZStack>
      </Animated.View>

      {/* Selected Center Overly */}
      <AnimatePresence>
        {selectedCenter && !isListExpanded && (
          <YStack pos="absolute" b={120} l={20} r={20} zi={100}>
            <Card bg="white" br={24} p="$4" elevation={10} shadowColor="#000" bw={1} bc={COLORS.sandMid}>
              <XStack gap="$3" ai="center" mb="$3">
                <Circle size={44} bg={`${COLORS.royalBlue}0C`} bw={1} bc={`${COLORS.royalBlue}15`} jc="center" ai="center">
                  {selectedCenter.type === 'speech-therapy' ? <Mic size={20} color={COLORS.royalBlue} /> :
                   selectedCenter.type === 'voice-clinic' ? <ActivityIcon size={20} color={COLORS.royalBlue} /> :
                   selectedCenter.type === 'sped-school' ? <GraduationCap size={20} color={COLORS.royalBlue} /> :
                   <Accessibility size={20} color={COLORS.royalBlue} />}
                </Circle>
                <YStack f={1}>
                  <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.3}>{selectedCenter.name}</SizableText>
                  <SizableText size="$1" color={COLORS.textMid} fow="700" textTransform="uppercase">{selectedCenter.distance.toFixed(1)} km away</SizableText>
                </YStack>
                <Button size="$3" circular icon={<Trash2 size={16} color={COLORS.textMid} />} unstyled onPress={() => setSelectedCenter(null)} />
              </XStack>

              {routeInfo ? (
                <YStack gap="$3" mb="$4" bg={COLORS.warmWhite} p="$3" br={16}>
                  <XStack jc="space-around">
                    <XStack ai="center" gap="$1.5">
                      <Navigation size={14} color={COLORS.textMid} />
                      <SizableText size="$2" fow="700" color={COLORS.textDark}>{routeInfo.distance}</SizableText>
                    </XStack>
                    <XStack ai="center" gap="$1.5">
                      <Clock size={14} color={COLORS.textMid} />
                      <SizableText size="$2" fow="700" color={COLORS.textDark}>{routeInfo.duration}</SizableText>
                    </XStack>
                  </XStack>
                  
                  <XStack jc="center" gap="$2">
                    {[
                      { mode: 'driving', icon: <Car size={16} /> },
                      { mode: 'walking', icon: <Footprints size={16} /> },
                      { mode: 'bicycling', icon: <Bike size={16} /> }
                    ].map(m => (
                      <Button
                        key={m.mode}
                        size="$3"
                        circular
                        bg={travelMode === m.mode ? COLORS.royalBlue : "white"}
                        col={travelMode === m.mode ? "white" : COLORS.textMid}
                        bw={1}
                        bc={COLORS.sandMid}
                        icon={m.icon}
                        onPress={() => changeTravelMode(m.mode as any)}
                        elevation={travelMode === m.mode ? 2 : 0}
                      />
                    ))}
                  </XStack>
                </YStack>
              ) : (
                <XStack jc="center" ai="center" py="$4" gap="$2">
                  <Spinner color={COLORS.royalBlue} />
                  <SizableText size="$2" fow="600" color={COLORS.textMid}>Calculating route...</SizableText>
                </XStack>
              )}

              <XStack gap="$3">
                <Button f={1} bg={COLORS.royalBlue} col="white" br={14} icon={<Navigation size={18} color="white" />} onPress={() => openDirections(selectedCenter)}>Directions</Button>
                {selectedCenter.phone && (
                  <Button circular bg={COLORS.teal} icon={<Phone size={18} color="white" />} onPress={() => Linking.openURL(`tel:${selectedCenter.phone}`)} />
                )}
              </XStack>
            </Card>
          </YStack>
        )}
      </AnimatePresence>

      {/* Bottom Info Bar */}
      <YStack 
        bg="white" 
        borderTopLeftRadius={28} 
        borderTopRightRadius={28} 
        p="$4" 
        pb={Platform.OS === 'android' ? 20 : 35} 
        elevation={8} 
        shadowColor={COLORS.deepNavy} 
        shadowOpacity={0.08}
        bw={1} 
        bc={COLORS.sandMid}
      >
        <XStack ai="center" jc="space-between" mb={isListExpanded ? "$3" : "0"}>
          <XStack ai="center" gap="$2" onPress={() => setIsListExpanded(!isListExpanded)}>
            <MapPin size={18} color={COLORS.royalBlue} />
            <SizableText size="$4" fow="800" color={COLORS.textDark}>Nearby Centers</SizableText>
            <YStack bg={`${COLORS.royalBlue}14`} px="$2.5" py={2} br={20} ml="$1">
              <SizableText size="$1" fow="800" color={COLORS.royalBlue}>{centers.length}</SizableText>
            </YStack>
          </XStack>
          <Button 
            size="$2.5" 
            circular 
            bg="transparent" 
            unstyled 
            icon={isListExpanded ? <ChevronRight size={18} color={COLORS.textMid} style={{ transform: [{ rotate: '90deg' }] }} /> : <ChevronRight size={18} color={COLORS.textMid} style={{ transform: [{ rotate: '-90deg' }] }} />} 
            onPress={() => setIsListExpanded(!isListExpanded)} 
          />
        </XStack>

        {isListExpanded && (
          <YStack>

        {centers.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
            {centers.map(c => (
              <Card
                key={c.id}
                w={180}
                p="$3"
                br={20}
                bw={2}
                bc={selectedCenter?.id === c.id ? COLORS.royalBlue : COLORS.sandMid}
                bg={selectedCenter?.id === c.id ? `${COLORS.royalBlue}05` : "white"}
                onPress={() => handleCenterSelect(c)}
                pressStyle={{ scale: 0.95 }}
              >
                <XStack ai="center" gap="$2" mb="$2">
                  <YStack w={28} h={28} br={8} bg={`${COLORS.royalBlue}0A`} ai="center" jc="center">
                    {c.type === 'speech-therapy' ? <Mic size={14} color={COLORS.royalBlue} /> :
                     c.type === 'voice-clinic' ? <ActivityIcon size={14} color={COLORS.royalBlue} /> :
                     c.type === 'sped-school' ? <GraduationCap size={14} color={COLORS.royalBlue} /> :
                     <Accessibility size={14} color={COLORS.royalBlue} />}
                  </YStack>
                  <SizableText f={1} size="$2" fow="800" color={COLORS.textDark} numberOfLines={1}>{c.name}</SizableText>
                </XStack>
                <SizableText size="$1" color={COLORS.textMid} fow="600" mb="$1">{c.distance.toFixed(1)} km away</SizableText>
                {c.services?.length > 0 && (
                  <SizableText size="$1" color={COLORS.teal} fow="700" numberOfLines={1}>
                    {c.services.slice(0, 1).join(' • ')}
                  </SizableText>
                )}
              </Card>
            ))}
          </ScrollView>
        ) : (
          <SizableText size="$2" color={COLORS.textMid} ta="center" py="$4">No centers found within 10km.</SizableText>
        )}

            <XStack mt="$4" gap="$3">
              <Button f={1} bg={COLORS.mediumBlue} col="white" br={16} icon={<Search size={16} color="white" />} onPress={openGoogleMaps}>Find More on Google</Button>
              <Button circular bg="white" bw={1} bc={COLORS.sandMid} icon={<RefreshCw size={18} color={COLORS.textMid} />} onPress={handleRetry} />
            </XStack>
          </YStack>
        )}
      </YStack>
    </YStack>
  );
};

export default SpeechTherapyMaps;