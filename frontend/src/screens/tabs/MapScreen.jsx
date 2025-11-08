import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, Linking, TouchableOpacity, ScrollView } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { styles } from "../../styles/SpeechMaps";

const SpeechTherapyMaps = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [centers, setCenters] = useState([]);
  const [mapLoading, setMapLoading] = useState(true);
  const [webViewKey, setWebViewKey] = useState(1);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [routeInfo, setRouteInfo] = useState(null);
  const [travelMode, setTravelMode] = useState('driving');

  const SEARCH_RADIUS = 10000;
  const MAX_RESULTS = 15;

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  };

  const fetchNominatim = async (lat, lng, terms, type, icon) => {
    const facilities = [];
    const serviceMap = {
      speech: ['Articulation Therapy', 'Lisp Correction', 'Nasal Speech', 'Voice Therapy'],
      voice: ['Voice Disorders', 'Resonance Therapy', 'Nasal Speech Treatment', 'Articulation'],
      school: ['Special Education', 'Speech Therapy', 'Language Development', 'Communication Skills'],
      pwd: ['Disability Support', 'Speech Services', 'Communication Therapy', 'Rehabilitation']
    };
    const typeMap = {
      speech: 'speech-therapy',
      voice: 'voice-clinic',
      school: 'sped-school',
      pwd: 'pwd-center'
    };
    
    for (const term of terms) {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(term)}&format=json&lat=${lat}&lon=${lng}&radius=${SEARCH_RADIUS/1000}&limit=${type === 'speech' ? 5 : 3}`,
          { headers: { 'User-Agent': 'SpeechTherapyApp/1.0' } }
        );
        if (res.ok) {
          const data = await res.json();
          const filtered = data.filter(p => {
            const n = p.display_name.toLowerCase();
            const d = calculateDistance(lat, lng, parseFloat(p.lat), parseFloat(p.lon));
            return d <= SEARCH_RADIUS/1000 && !n.match(/physical therapy|physiotherapy|dental|dentist|orthodont/);
          });
          facilities.push(...filtered.map(p => ({
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

  const searchOverpass = async (lat, lng) => {
    try {
      const query = `[out:json][timeout:25];(node["amenity"="clinic"]["healthcare:speciality"="speech_therapy"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="clinic"]["name"~"[Ss]peech [Tt]herapy|[Ss]peech [Pp]athology"](around:${SEARCH_RADIUS},${lat},${lng});node["healthcare"="speech_therapist"](around:${SEARCH_RADIUS},${lat},${lng});way["amenity"="clinic"]["healthcare:speciality"="speech_therapy"](around:${SEARCH_RADIUS},${lat},${lng});node["office"="therapist"]["therapist:type"="speech"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="school"]["school:for"="special_education"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="school"]["name"~"SPED|Special Education|Speech"](around:${SEARCH_RADIUS},${lat},${lng});node["amenity"="social_facility"]["social_facility:for"="disabled"](around:${SEARCH_RADIUS},${lat},${lng});node["office"="association"]["association"~"disability|PWD"](around:${SEARCH_RADIUS},${lat},${lng}););out center;`;
      const res = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `data=${encodeURIComponent(query)}`
      });
      const data = await res.json();
      return (data.elements || []).map(e => {
        const lat = e.lat || e.center?.lat;
        const lon = e.lon || e.center?.lon;
        if (!lat || !lon) return null;
        const name = e.tags?.name || '';
        const d = calculateDistance(lat, lng, lat, lon);
        if (d > SEARCH_RADIUS/1000 || name.match(/physical|dental|physiotherapy/i)) return null;
        
        const isSped = e.tags?.amenity === 'school' || name.match(/school|SPED|education/i);
        const isPwd = e.tags?.amenity === 'social_facility' || e.tags?.office === 'association' || name.match(/PWD|disability|disabled/i);
        
        return {
          id: `overpass-${e.id}`,
          name: e.tags?.name || (isSped ? 'SPED School' : isPwd ? 'PWD Center' : 'Speech Therapy Center'),
          fullAddress: [e.tags?.['addr:street'], e.tags?.['addr:city'], e.tags?.['addr:province']].filter(Boolean).join(', ') || 'Address not available',
          latitude: lat,
          longitude: lon,
          type: isSped ? 'sped-school' : isPwd ? 'pwd-center' : 'speech-therapy',
          services: isSped ? ['Special Education', 'Speech Therapy', 'Language Development'] : isPwd ? ['Disability Support', 'Speech Services', 'Rehabilitation'] : ['Speech Therapy', 'Articulation', 'Voice Disorders'],
          distance: d,
          source: 'overpass',
          isReal: true,
          icon: isSped ? '🏫' : isPwd ? '♿' : '🗣️'
        };
      }).filter(Boolean);
    } catch (e) { console.log('Overpass failed', e); return []; }
  };

  const searchCenters = async (lat, lng) => {
    try {
      console.log('🔍 Searching nearby centers within 10km...');
      let found = [];
      
      const speech = await fetchNominatim(lat, lng, ['speech therapy', 'speech pathology', 'speech language pathologist', 'speech therapist', 'articulation therapy', 'voice therapy', 'speech clinic'], 'speech', '🗣️');
      found.push(...speech);
      console.log(`🗣️ Found ${speech.length} speech centers`);
      
      const voice = await fetchNominatim(lat, lng, ['speech language hearing center', 'voice clinic', 'communication clinic', 'speech and hearing center'], 'voice', '🎤');
      found.push(...voice);
      console.log(`👂 Found ${voice.length} voice clinics`);
      
      const schools = await fetchNominatim(lat, lng, ['special education school', 'SPED school', 'speech disorder school', 'communication disorder school', 'special needs school'], 'school', '🏫');
      found.push(...schools);
      console.log(`🏫 Found ${schools.length} SPED schools`);
      
      const pwd = await fetchNominatim(lat, lng, ['PWD center', 'persons with disability center', 'disability support center', 'speech disability center', 'communication disability center'], 'pwd', '♿');
      found.push(...pwd);
      console.log(`♿ Found ${pwd.length} PWD centers`);
      
      const overpass = await searchOverpass(lat, lng);
      found.push(...overpass);
      console.log(`📍 Found ${overpass.length} via Overpass`);

      const unique = found
        .filter((c, i, s) => i === s.findIndex(x => x.latitude.toFixed(4) === c.latitude.toFixed(4) && x.longitude.toFixed(4) === c.longitude.toFixed(4)))
        .sort((a, b) => a.distance - b.distance)
        .filter(c => c.distance <= SEARCH_RADIUS/1000);

      console.log(`🎯 Total unique centers: ${unique.length}`);
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

  const getRouteInfo = async (center) => {
    try {
      if (!location) return;
      const res = await fetch(`https://router.project-osrm.org/route/v1/${travelMode}/${location.longitude},${location.latitude};${center.longitude},${center.latitude}?overview=full&geometries=geojson`);
      if (res.ok) {
        const data = await res.json();
        if (data.routes?.[0]) {
          const r = data.routes[0];
          setRouteInfo({
            distance: `${(r.distance/1000).toFixed(1)} km`,
            duration: `${Math.ceil(r.duration/60)} mins`,
            geometry: r.geometry
          });
          if (window.ReactNativeWebView) {
            window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SHOW_ROUTE', route: r.geometry, center }));
          }
        }
      }
    } catch (e) {
      console.error('Route error:', e);
      const d = calculateDistance(location.latitude, location.longitude, center.latitude, center.longitude);
      const speeds = { driving: 40, walking: 5, bicycling: 15 };
      setRouteInfo({
        distance: `${d.toFixed(1)} km`,
        duration: `${Math.ceil((d/speeds[travelMode])*60)} mins`,
        geometry: null
      });
    }
  };

  const handleCenterSelect = (center) => {
    setSelectedCenter(center);
    setRouteInfo(null);
    getRouteInfo(center);
  };

  const openGoogleMaps = () => {
    const url = location 
      ? `https://www.google.com/maps/search/speech+therapy+articulation+lisp+near+me/@${location.latitude},${location.longitude},12z`
      : 'https://www.google.com/maps/search/speech+therapy+near+me';
    Linking.openURL(url);
  };

  const openDirections = (center) => {
    Linking.openURL(`https://www.google.com/maps/dir/?api=1&destination=${center.latitude},${center.longitude}&travelmode=${travelMode}`);
  };

  const changeTravelMode = (mode) => {
    setTravelMode(mode);
    if (selectedCenter) getRouteInfo(selectedCenter);
  };

  const generateMapHTML = () => {
    if (!location) return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>body{margin:0;padding:20px;font-family:Arial;display:flex;justify-content:center;align-items:center;height:100vh;background:#f5f5f5}.error-message{text-align:center;color:#666}</style></head><body><div class="error-message"><h3>Loading map...</h3><p>Please wait while we load your location.</p></div></body></html>`;

    const safe = JSON.stringify(centers || []).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/'/g, '\\u0027').replace(/"/g, '\\u0022').replace(/&/g, '\\u0026').replace(/\//g, '\\/');

    return `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0"><style>#map{height:100vh;width:100%;position:absolute;top:0;left:0}body{margin:0;padding:0;font-family:Arial;height:100vh}.user-marker,.facility-icon{font-size:24px}.facility-icon{font-size:20px}.route-popup{padding:10px;max-width:250px}</style><link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/><script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script></head><body><div id="map"></div><script>let map,routeLayer=null;try{map=L.map('map').setView([${location.latitude},${location.longitude}],13);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap',maxZoom:18}).addTo(map);L.circle([${location.latitude},${location.longitude}],{color:'#2E8B57',fillColor:'#2E8B57',fillOpacity:0.1,radius:${SEARCH_RADIUS}}).addTo(map);L.marker([${location.latitude},${location.longitude}],{icon:L.divIcon({className:'user-marker',html:'📍',iconSize:[30,30],iconAnchor:[15,30]})}).addTo(map).bindPopup('<b>Your Location</b><br>You are here<br><small>Search radius: ${SEARCH_RADIUS/1000}km</small>').openPopup();let centers=JSON.parse('${safe}');centers.forEach(c=>{try{const m=L.marker([c.latitude,c.longitude],{icon:L.divIcon({className:'facility-icon',html:c.icon||'🗣️',iconSize:[25,25],iconAnchor:[12,25]})}).addTo(map);const typeLabel=c.type==='speech-therapy'?'Speech Therapy Center':c.type==='voice-clinic'?'Voice & Speech Clinic':c.type==='sped-school'?'SPED School':c.type==='pwd-center'?'PWD Center':'Speech Therapy Center';m.bindPopup('<div class="route-popup"><strong>'+(c.name||'Speech Therapy Center')+'</strong><br/><em style="color:#2E8B57;">'+typeLabel+'</em><br/><small>'+(c.fullAddress||'Address not available')+'</small><br/><small style="color:#666;">'+c.distance.toFixed(1)+' km away</small><br/><button onclick="window.selectCenter('+c.latitude+','+c.longitude+')" style="background:#2E8B57;color:white;border:none;padding:5px 10px;border-radius:3px;margin-top:5px;cursor:pointer;width:100%">Show Route</button></div>')}catch(e){console.error('Marker error:',e)}});window.showRoute=(g,c)=>{try{if(routeLayer)map.removeLayer(routeLayer);if(g?.coordinates){const ll=g.coordinates.map(co=>[co[1],co[0]]);routeLayer=L.polyline(ll,{color:'#2E8B57',weight:5,opacity:0.7,dashArray:'10, 10'}).addTo(map);map.fitBounds(routeLayer.getBounds())}}catch(e){console.error('Route error:',e)}};window.selectCenter=(lat,lng)=>{if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:'CENTER_SELECT',center:{latitude:lat,longitude:lng}}))};window.addEventListener('message',e=>{try{const d=JSON.parse(e.data);if(d.type==='SHOW_ROUTE')window.showRoute(d.route,d.center)}catch(er){console.error('Message error:',er)}});if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_LOADED',centerCount:centers.length}))}catch(e){console.error('Map error:',e);if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_ERROR',error:e.toString()}))}</script></body></html>`;
  };

  const handleWebViewMessage = (e) => {
    try {
      const data = JSON.parse(e.nativeEvent.data);
      if (data.type === 'CENTER_SELECT') {
        const c = centers.find(x => x.latitude === data.center.latitude && x.longitude === data.center.longitude);
        if (c) handleCenterSelect(c);
      } else if (data.type === 'MAP_LOADED' || data.type === 'MAP_ERROR') {
        setMapLoading(false);
      }
    } catch (er) { console.log('WebView message:', e.nativeEvent.data); }
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

  useEffect(() => { getCurrentLocation(); }, []);

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2E8B57" />
          <Text style={styles.loadingText}>Finding nearby speech therapy centers within 10km...</Text>
          <Text style={styles.loadingSubtext}>Searching your immediate area</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Location Access Needed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.alternativeButton} onPress={openGoogleMaps}>
            <Text style={styles.alternativeButtonText}>Open in Google Maps</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.mapContainer}>
        <WebView
          key={webViewKey}
          source={{ html: generateMapHTML() }}
          style={styles.map}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          startInLoadingState={true}
          onMessage={handleWebViewMessage}
          onLoadEnd={() => setMapLoading(false)}
        />
        {mapLoading && (
          <View style={styles.mapOverlay}>
            <ActivityIndicator size="large" color="#2E8B57" />
            <Text style={styles.loadingText}>Loading nearby places...</Text>
          </View>
        )}
        <TouchableOpacity 
          style={styles.myLocationButton}
          onPress={() => {
            if (location) {
              setWebViewKey(p => p + 1);
            }
          }}
        >
          <Ionicons name="locate" size={24} color="#2E8B57" />
        </TouchableOpacity>
      </View>

      {selectedCenter && (
        <View style={styles.routePanel}>
          <View style={styles.routeHeader}>
            <Text style={styles.routePanelIcon}>{selectedCenter.icon || '🏫'}</Text>
            <View style={styles.routeTitleContainer}>
              <Text style={styles.routeTitle}>{selectedCenter.name}</Text>
              <Text style={styles.routeDistance}>{selectedCenter.distance.toFixed(1)} km away</Text>
            </View>
          </View>
          {routeInfo ? (
            <View style={styles.routeInfo}>
              <View style={styles.routeDetail}>
                <Ionicons name="navigate" size={16} color="#666" />
                <Text style={styles.routeLabel}>Distance:</Text>
                <Text style={styles.routeValue}>{routeInfo.distance}</Text>
              </View>
              <View style={styles.routeDetail}>
                <Ionicons name="time" size={16} color="#666" />
                <Text style={styles.routeLabel}>Time:</Text>
                <Text style={styles.routeValue}>{routeInfo.duration}</Text>
              </View>
              <View style={styles.travelModes}>
                <Text style={styles.modeLabel}>Travel Mode:</Text>
                <View style={styles.modeButtons}>
                  {['driving', 'walking', 'bicycling'].map(m => (
                    <TouchableOpacity key={m} style={[styles.modeButton, travelMode === m && styles.modeButtonActive]} onPress={() => changeTravelMode(m)}>
                      <Ionicons name={m === 'driving' ? 'car' : m === 'walking' ? 'walk' : 'bicycle'} size={16} color={travelMode === m ? '#fff' : '#666'} />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          ) : (
            <View style={styles.loadingRoute}>
              <ActivityIndicator size="small" color="#2E8B57" />
              <Text style={styles.loadingRouteText}>Calculating route...</Text>
            </View>
          )}
          <View style={styles.routeActions}>
            <TouchableOpacity style={styles.directionsButton} onPress={() => openDirections(selectedCenter)}>
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.directionsButtonText}>Directions</Text>
            </TouchableOpacity>
            {selectedCenter.phone && (
              <TouchableOpacity style={styles.callButton} onPress={() => Linking.openURL(`tel:${selectedCenter.phone}`)}>
                <Ionicons name="call" size={20} color="#fff" />
                <Text style={styles.callButtonText}>Call</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      <View style={[styles.infoPanel, selectedCenter && styles.infoPanelWithRoute]}>
        <View style={styles.infoHeader}>
          <Ionicons name="mic" size={20} color="#2E8B57" />
          <Text style={styles.infoTitle}>Nearby Centers (10km)</Text>
          <View style={styles.counterBadge}>
            <Text style={styles.counterText}>{centers.length}</Text>
          </View>
        </View>
        <Text style={styles.infoText}>
          {centers.length > 0 ? `Found ${centers.length} place${centers.length !== 1 ? 's' : ''} within 10km` : 'No speech therapy centers found within 10km. Try expanding your search.'}
        </Text>
        {centers.length > 0 && (
          <ScrollView style={styles.centersList} horizontal showsHorizontalScrollIndicator={false}>
            {centers.map(c => (
              <TouchableOpacity key={c.id} style={[styles.centerChip, selectedCenter?.id === c.id && styles.centerChipSelected]} onPress={() => handleCenterSelect(c)}>
                <View style={styles.chipHeader}>
                  <Text style={styles.chipIcon}>{c.icon || '🏫'}</Text>
                  <Text style={styles.centerChipText} numberOfLines={1}>{c.name}</Text>
                </View>
                <Text style={styles.centerChipDistance}>{c.distance ? `${c.distance.toFixed(1)} km away` : 'Nearby'}</Text>
                {c.services?.length > 0 && <Text style={styles.centerChipServices} numberOfLines={1}>{c.services.slice(0, 2).join(' • ')}</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.googleMapsButton} onPress={openGoogleMaps}>
            <Ionicons name="map" size={20} color="#fff" />
            <Text style={styles.googleMapsButtonText}>Find More</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRetry}>
            <Ionicons name="refresh" size={20} color="#2E8B57" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default SpeechTherapyMaps;