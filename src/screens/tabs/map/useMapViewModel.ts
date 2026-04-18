import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Animated, useWindowDimensions, Linking } from 'react-native';
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

// ─── Interfaces ──────────────────────────────────────────
export interface Center {
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
  _score?: number;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  geometry: any;
}

const SEARCH_RADIUS = 10000;
const MAX_RESULTS = 15;

// ─── Utility Functions ────────────────────────────────────────────
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const getBoundingBox = (lat: number, lng: number, radiusKm: number) => {
  const latDelta = radiusKm / 111.32;
  const lngDelta = radiusKm / (111.32 * Math.cos(lat * Math.PI / 180));
  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
};

const classifyFacility = (name: string, tags: Record<string, string> = {}): {
  type: string; services: string[]; icon: string;
} => {
  const n = name.toLowerCase();
  const amenity = (tags.amenity || '').toLowerCase();
  const healthcare = (tags.healthcare || '').toLowerCase();
  const speciality = (tags['healthcare:speciality'] || '').toLowerCase();

  if (n.match(/cleft|smile.?train|craniofacial|palate/i))
    return { type: 'cleft-clinic', services: ['Cleft Speech Therapy', 'Palate Rehab', 'Consultation'], icon: '😊' };

  if (speciality.includes('speech') || n.match(/speech.?(therap|patholog|clinic)|slp\b|speech.?lang/i))
    return { type: 'speech-therapy', services: ['Articulation Therapy', 'Lisp Correction', 'Voice Therapy'], icon: '🗣️' };

  if (n.match(/\bent\b|ear.?nose|otol|audiolog|hearing|cochlear/i) || speciality.includes('otolaryngology'))
    return { type: 'voice-clinic', services: ['ENT Consultation', 'Hearing Assessment', 'Voice Therapy'], icon: '🎤' };

  if (n.match(/rehab|physical.?therap|occupational.?therap|therapy.?center|wellness.?center/i) ||
      amenity === 'social_facility' || tags['social_facility:for'] === 'disabled')
    return { type: 'pwd-center', services: ['Rehabilitation', 'Speech Services', 'Disability Support'], icon: '♿' };

  if (n.match(/sped|special.?ed|special.?need|learning.?center|developmental|autism|inclusive/i) ||
      tags['school:for'] === 'special_education')
    return { type: 'sped-school', services: ['Special Education', 'Speech Therapy', 'Communication Skills'], icon: '🏫' };

  if (n.match(/hospital|medical.?center|general.?hospital|community.?hospital|provincial.?hospital/i) ||
      amenity === 'hospital')
    return { type: 'speech-therapy', services: ['Medical Rehab', 'Speech Pathology', 'Consultation'], icon: '🏥' };

  if (amenity === 'clinic' || healthcare === 'clinic' || n.match(/clinic|polyclinic|health.?center/i))
    return { type: 'voice-clinic', services: ['Clinical Assessment', 'Therapy Referral', 'Consultation'], icon: '🏥' };

  return { type: 'speech-therapy', services: ['Speech Services'], icon: '🗣️' };
};

const searchOverpass = async (lat: number, lng: number): Promise<Center[]> => {
  try {
    const query = `[out:json][timeout:30];(
      node["amenity"="hospital"](around:${SEARCH_RADIUS},${lat},${lng});
      node["amenity"="clinic"](around:${SEARCH_RADIUS},${lat},${lng});
      node["healthcare"](around:${SEARCH_RADIUS},${lat},${lng});
      node["name"~"Cleft|Smile Train|Craniofacial"](around:${SEARCH_RADIUS},${lat},${lng});
      node["amenity"="clinic"]["healthcare:speciality"~"speech|rehabilitation|otolaryngology"](around:${SEARCH_RADIUS},${lat},${lng});
      node["healthcare"="rehabilitation"](around:${SEARCH_RADIUS},${lat},${lng});
      node["amenity"="school"]["name"~"SPED|Special Education|Special Needs|Inclusive"](around:${SEARCH_RADIUS},${lat},${lng});
      node["amenity"="social_facility"](around:${SEARCH_RADIUS},${lat},${lng});
    );out center body;`;

    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: `data=${encodeURIComponent(query)}`,
    });
    const data = await res.json();

    return (data.elements || []).map((e: any) => {
      const eLat = e.lat || e.center?.lat;
      const eLon = e.lon || e.center?.lon;
      if (!eLat || !eLon) return null;
      const name = e.tags?.name || '';
      if (!name) return null;

      const dist = calculateDistance(lat, lng, eLat, eLon);
      if (dist > SEARCH_RADIUS / 1000) return null;

      const classification = classifyFacility(name, e.tags || {});
      const addr = [e.tags?.['addr:street'], e.tags?.['addr:city'], e.tags?.['addr:province']].filter(Boolean).join(', ');

      return {
        id: `overpass-${e.id}`,
        name,
        fullAddress: addr || 'Address available on map',
        latitude: eLat,
        longitude: eLon,
        type: classification.type,
        services: classification.services,
        distance: dist,
        source: 'overpass',
        isReal: true,
        icon: classification.icon,
        phone: e.tags?.phone || e.tags?.['contact:phone'],
      };
    }).filter(Boolean) as Center[];
  } catch (e) {
    console.warn('Overpass search failed:', e);
    return [];
  }
};

const fetchNominatim = async (lat: number, lng: number): Promise<Center[]> => {
  const facilities: Center[] = [];
  const searches = [
    { term: 'rehabilitation center', fallbackType: 'pwd-center' },
    { term: 'speech therapy clinic', fallbackType: 'speech-therapy' },
    { term: 'cleft clinic', fallbackType: 'cleft-clinic' },
    { term: 'Smile Train', fallbackType: 'cleft-clinic' },
    { term: 'ENT clinic', fallbackType: 'voice-clinic' },
    { term: 'SPED center', fallbackType: 'sped-school' },
    { term: 'hospital rehabilitation', fallbackType: 'speech-therapy' },
    { term: 'therapy center', fallbackType: 'pwd-center' },
  ];

  for (const { term, fallbackType } of searches) {
    try {
      const bbox = getBoundingBox(lat, lng, SEARCH_RADIUS / 1000);
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&viewbox=${bbox.minLng},${bbox.maxLat},${bbox.maxLng},${bbox.minLat}&bounded=1&countrycodes=ph&limit=5`,
        { headers: { 'User-Agent': 'Articulink/1.0' } }
      );
      if (res.ok) {
        const data = await res.json();
        for (const p of data) {
          const pLat = parseFloat(p.lat);
          const pLng = parseFloat(p.lon);
          const dist = calculateDistance(lat, lng, pLat, pLng);
          if (dist > SEARCH_RADIUS / 1000) continue;
          const classification = classifyFacility(p.display_name.split(',')[0] || 'Center');
          facilities.push({
            id: `nom-${p.place_id}`,
            name: p.display_name.split(',')[0] || 'Center',
            fullAddress: p.display_name,
            latitude: pLat,
            longitude: pLng,
            type: classification.type || fallbackType,
            services: classification.services,
            distance: dist,
            source: 'nominatim',
            isReal: true,
            icon: classification.icon,
          });
        }
      }
      await new Promise(r => setTimeout(r, 1100));
    } catch (e) { console.warn(`Nominatim failed for: ${term}`); }
  }
  return facilities;
};

/**
 * ViewModel for the Map Screen.
 */
export const useMapViewModel = () => {
    const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [centers, setCenters] = useState<Center[]>([]);
    const [mapLoading, setMapLoading] = useState(true);
    const [selectedCenter, setSelectedCenter] = useState<Center | null>(null);
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
    const [travelMode, setTravelMode] = useState<'driving' | 'walking' | 'bicycling'>('driving');
    const [isListExpanded, setIsListExpanded] = useState(true);
    
    const { width, height } = useWindowDimensions();
    const webViewRef = useRef<WebView>(null);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    const searchCenters = useCallback(async (lat: number, lng: number) => {
        try {
            const [overpassResults, nominatimResults] = await Promise.all([
                searchOverpass(lat, lng),
                fetchNominatim(lat, lng),
            ]);

            const allFound = [...overpassResults, ...nominatimResults];

            const unique = allFound.filter((c, i, arr) =>
                i === arr.findIndex(x =>
                    Math.abs(x.latitude - c.latitude) < 0.001 &&
                    Math.abs(x.longitude - c.longitude) < 0.001
                )
            );

            const sorted = unique.map(c => {
                let score = 0;
                const n = c.name.toLowerCase();
                if (n.match(/speech|therap|slp|patholog|cleft|smile.?train|palate/)) score += 50;
                if (n.match(/rehab|ent\b|ear.?nose|audiolog|hearing/)) score += 40;
                if (n.match(/sped|special.?ed|developmental|autism|inclusive/)) score += 35;
                if (n.match(/hospital|medical.?center/)) score += 20;
                if (n.match(/clinic|health.?center|polyclinic/)) score += 15;
                score += Math.max(0, 10 - c.distance);
                return { ...c, _score: score };
            })
            .sort((a, b) => (b._score || 0) - (a._score || 0) || a.distance - b.distance)
            .slice(0, MAX_RESULTS);

            setCenters(sorted);
            webViewRef.current?.injectJavaScript(
                "if (window.updateCenters) window.updateCenters(" + JSON.stringify(sorted) + "); true;"
            );
            setLoading(false);
        } catch (e) {
            console.warn('Search failed:', e);
            setLoading(false);
        }
    }, []);

    const getCurrentLocation = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            setMapLoading(true);
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                setError('Location permission denied.');
                setLoading(false);
                return;
            }
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            setLocation(loc.coords);
            await searchCenters(loc.coords.latitude, loc.coords.longitude);
        } catch (e) {
            setError('Failed to get location.');
            setLoading(false);
        }
    }, [searchCenters]);

    const getRouteInfo = useCallback(async (center: Center, currentTravelMode: string) => {
        if (!location) return;
        try {
            const profile = currentTravelMode === 'bicycling' ? 'cycling' : currentTravelMode;
            const osrmUrl = "https://router.project-osrm.org/route/v1/" + profile + "/" + location.longitude + "," + location.latitude + ";" + center.longitude + "," + center.latitude + "?overview=full&geometries=geojson";
            const res = await fetch(osrmUrl);
            const data = await res.json();
            if (data.routes?.[0]) {
                const r = data.routes[0];
                const info = { 
                    distance: (r.distance / 1000).toFixed(1) + " km", 
                    duration: Math.ceil(r.duration / 60) + " mins", 
                    geometry: r.geometry 
                };
                setRouteInfo(info);
                webViewRef.current?.injectJavaScript("if (window.showRoute) window.showRoute(" + JSON.stringify(r.geometry) + "); true;");
            }
        } catch (e) {
            const d = calculateDistance(location.latitude, location.longitude, center.latitude, center.longitude);
            const speeds: any = { driving: 40, walking: 5, bicycling: 15 };
            setRouteInfo({ 
                distance: d.toFixed(1) + " km", 
                duration: Math.ceil((d / (speeds[currentTravelMode] || 40)) * 60) + " mins", 
                geometry: null 
            });
        }
    }, [location]);

    const handleCenterSelect = useCallback((center: Center) => {
        setSelectedCenter(center);
        setRouteInfo(null);
        getRouteInfo(center, travelMode);
        setIsListExpanded(false); 
    }, [getRouteInfo, travelMode]);

    useEffect(() => { 
        getCurrentLocation(); 
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, tension: 20, friction: 8, useNativeDriver: true }),
        ]).start();
    }, []);

    const openGoogleMaps = () => {
        const url = location
            ? "https://www.google.com/maps/search/speech+therapy+clinics/@" + location.latitude + "," + location.longitude + ",12z"
            : 'https://www.google.com/maps/search/speech+therapy+near+me';
        Linking.openURL(url);
    };

    const openDirections = (center: Center) => {
        Linking.openURL("https://www.google.com/maps/dir/?api=1&destination=" + center.latitude + "," + center.longitude + "&travelmode=" + travelMode);
    };

    return {
        location,
        loading,
        error,
        centers,
        mapLoading, setMapLoading,
        selectedCenter, setSelectedCenter,
        routeInfo,
        travelMode, setTravelMode,
        isListExpanded, setIsListExpanded,
        width, height,
        webViewRef,
        getCurrentLocation,
        handleCenterSelect,
        getRouteInfo,
        openGoogleMaps,
        openDirections,
        animations: {
            fadeAnim,
            slideAnim
        }
    };
};
