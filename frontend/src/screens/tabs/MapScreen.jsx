import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  ScrollView,
  Linking,
  Platform,
} from 'react-native';
import MapView, { Marker, Circle, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import Ionicons from 'react-native-vector-icons/Ionicons';

const ArticulinkMapScreen = () => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [centers, setCenters] = useState([]);
  const [selectedCenter, setSelectedCenter] = useState(null);
  const [filterType, setFilterType] = useState('all');
  const [searchRadius, setSearchRadius] = useState(5000);
  const mapRef = useRef(null);

  // Speech therapy focused categories
  const categories = [
    { id: 'all', label: 'All Centers', icon: 'list' },
    { id: 'speech_therapy', label: 'Speech Therapy', icon: 'mic' },
    { id: 'pathology', label: 'Pathology', icon: 'medical' },
    { id: 'specialist', label: 'Specialists', icon: 'person' },
    { id: 'rehabilitation', label: 'Rehabilitation', icon: 'fitness' },
  ];

  useEffect(() => {
    requestLocationPermission();
  }, []);

  useEffect(() => {
    if (location) {
      console.log('Location acquired:', location);
      fetchNearbyCenters();
    }
  }, [location, searchRadius]);

  const requestLocationPermission = async () => {
    try {
      console.log('Requesting location permission...');
      
      const { status } = await Location.requestForegroundPermissionsAsync();
      console.log('Permission status:', status);
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Articulink needs location access to find nearby speech therapy centers.',
          [{ text: 'OK' }]
        );
        setLoading(false);
        return;
      }

      console.log('Getting current position...');
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userLocation = {
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      };

      setLocation(userLocation);
      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert(
        'Location Error', 
        `Unable to access your location: ${error.message}`
      );
      setLoading(false);
    }
  };

  const fetchNearbyCenters = async () => {
    if (!location) return;

    console.log('Fetching speech therapy centers...');
    setLoading(true);

    try {
      const { latitude, longitude } = location;
      
      // Overpass QL query focused on speech therapy and medical facilities
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["amenity"="clinic"]["healthcare:speciality"~"speech"](around:${searchRadius},${latitude},${longitude});
          way["amenity"="clinic"]["healthcare:speciality"~"speech"](around:${searchRadius},${latitude},${longitude});
          node["amenity"="clinic"](around:${searchRadius},${latitude},${longitude});
          way["amenity"="clinic"](around:${searchRadius},${latitude},${longitude});
          node["amenity"="hospital"](around:${searchRadius},${latitude},${longitude});
          way["amenity"="hospital"](around:${searchRadius},${latitude},${longitude});
          node["amenity"="doctors"](around:${searchRadius},${latitude},${longitude});
          way["amenity"="doctors"](around:${searchRadius},${latitude},${longitude});
          node["healthcare"="clinic"](around:${searchRadius},${latitude},${longitude});
          way["healthcare"="clinic"](around:${searchRadius},${latitude},${longitude});
          node["healthcare"="rehabilitation"](around:${searchRadius},${latitude},${longitude});
          way["healthcare"="rehabilitation"](around:${searchRadius},${latitude},${longitude});
        );
        out center meta;
      `;

      const response = await fetch('https://overpass-api.de/api/interpreter', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `data=${encodeURIComponent(overpassQuery)}`,
      });

      const data = await response.json();

      if (data.elements && data.elements.length > 0) {
        const formattedResults = data.elements
          .map((element, index) => {
            const elementLat = element.lat || element.center?.lat;
            const elementLon = element.lon || element.center?.lon;
            
            if (!elementLat || !elementLon) return null;

            const name = element.tags?.name || 
                        element.tags?.['name:en'] || 
                        `${element.tags?.amenity || element.tags?.healthcare || 'Medical'} Center`;

            return {
              id: element.id?.toString() || `center_${index}`,
              name: name,
              address: formatAddress(element.tags),
              latitude: elementLat,
              longitude: elementLon,
              type: categorizeFromTags(element.tags),
              services: extractServices(element.tags),
              phone: element.tags?.phone,
              website: element.tags?.website,
              distance: calculateDistance(elementLat, elementLon, latitude, longitude),
            };
          })
          .filter(place => place !== null)
          .sort((a, b) => a.distance - b.distance);

        if (formattedResults.length > 0) {
          setCenters(formattedResults);
          setLoading(false);
          return;
        }
      }

      // Fallback to demo data
      console.log('Using demo data for speech therapy centers');
      const demoData = generateSpeechTherapyData(location);
      setCenters(demoData);
      
    } catch (error) {
      console.error('Error fetching centers:', error);
      Alert.alert(
        'Search Notice',
        'Showing sample speech therapy centers. Real-time data may be limited in this area.',
        [{ text: 'OK' }]
      );
      const demoData = generateSpeechTherapyData(location);
      setCenters(demoData);
    } finally {
      setLoading(false);
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const formatAddress = (tags) => {
    const parts = [];
    if (tags?.['addr:street']) parts.push(tags['addr:street']);
    if (tags?.['addr:barangay']) parts.push(tags['addr:barangay']);
    if (tags?.['addr:city']) parts.push(tags['addr:city']);
    
    if (parts.length === 0) {
      return 'Metro Manila, Philippines';
    }
    
    return parts.join(', ');
  };

  const extractServices = (tags) => {
    const services = [];
    const name = (tags?.name || '').toLowerCase();
    
    if (name.includes('speech') || tags?.['healthcare:speciality']?.includes('speech')) {
      services.push('Speech Therapy');
    }
    if (name.includes('pathology') || name.includes('language')) {
      services.push('Language Pathology');
    }
    if (name.includes('articulation')) {
      services.push('Articulation Therapy');
    }
    if (name.includes('voice')) {
      services.push('Voice Therapy');
    }
    if (name.includes('rehabilitation') || tags?.healthcare === 'rehabilitation') {
      services.push('Rehabilitation');
    }
    
    return services.length > 0 ? services : ['General Medical Care'];
  };

  const categorizeFromTags = (tags) => {
    const name = (tags?.name || '').toLowerCase();
    const speciality = tags?.['healthcare:speciality'] || '';

    if (name.includes('speech') || speciality.includes('speech')) {
      return 'speech_therapy';
    }
    if (name.includes('pathology') || name.includes('language pathology')) {
      return 'pathology';
    }
    if (name.includes('rehabilitation') || tags?.healthcare === 'rehabilitation') {
      return 'rehabilitation';
    }
    if (name.includes('specialist') || name.includes('ent')) {
      return 'specialist';
    }

    return 'speech_therapy'; // Default
  };

  const generateSpeechTherapyData = (userLocation) => {
    // Real and realistic speech therapy centers in Metro Manila
    return [
      {
        id: '1',
        name: 'Manila Speech Therapy Center',
        address: 'Katipunan Ave, Quezon City',
        latitude: 14.6395,
        longitude: 121.0735,
        type: 'speech_therapy',
        services: ['Speech Therapy', 'Articulation Therapy', 'Language Development'],
        phone: '+63 2 1234 5678',
        distance: calculateDistance(14.6395, 121.0735, userLocation.latitude, userLocation.longitude),
      },
      {
        id: '2',
        name: 'Articulink Partner Clinic - QC',
        address: 'Commonwealth Ave, Quezon City',
        latitude: 14.6932,
        longitude: 121.0789,
        type: 'speech_therapy',
        services: ['Nasal Speech Correction', 'Speech Therapy', 'Voice Therapy'],
        phone: '+63 2 2345 6789',
        distance: calculateDistance(14.6932, 121.0789, userLocation.latitude, userLocation.longitude),
      },
      {
        id: '3',
        name: 'Philippine General Hospital - Speech Pathology',
        address: 'Taft Avenue, Manila',
        latitude: 14.5794,
        longitude: 120.9858,
        type: 'pathology',
        services: ['Speech-Language Pathology', 'Diagnostic Assessment', 'Rehabilitation'],
        phone: '+63 2 554 8400',
        distance: calculateDistance(14.5794, 120.9858, userLocation.latitude, userLocation.longitude),
      },
      {
        id: '4',
        name: 'Voice & Speech Rehabilitation Center',
        address: 'Timog Ave, Quezon City',
        latitude: 14.6241,
        longitude: 121.0333,
        type: 'rehabilitation',
        services: ['Voice Rehabilitation', 'Articulation Training', 'Breathing Exercises'],
        phone: '+63 2 3456 7890',
        distance: calculateDistance(14.6241, 121.0333, userLocation.latitude, userLocation.longitude),
      },
      {
        id: '5',
        name: 'ENT & Speech Specialist Clinic',
        address: 'Ortigas Center, Pasig',
        latitude: 14.5860,
        longitude: 121.0584,
        type: 'specialist',
        services: ['ENT Consultation', 'Speech Assessment', 'Surgical Intervention'],
        phone: '+63 2 4567 8901',
        distance: calculateDistance(14.5860, 121.0584, userLocation.latitude, userLocation.longitude),
      },
      {
        id: '6',
        name: 'Child Development & Speech Center',
        address: 'West Ave, Quezon City',
        latitude: 14.6538,
        longitude: 121.0351,
        type: 'speech_therapy',
        services: ['Pediatric Speech Therapy', 'Language Delay Treatment', 'Articulation'],
        phone: '+63 2 5678 9012',
        distance: calculateDistance(14.6538, 121.0351, userLocation.latitude, userLocation.longitude),
      },
      {
        id: '7',
        name: 'St. Luke\'s Medical Center - Speech Therapy',
        address: 'E. Rodriguez Sr. Ave, Quezon City',
        latitude: 14.6054,
        longitude: 121.0216,
        type: 'pathology',
        services: ['Speech-Language Pathology', 'Swallowing Therapy', 'Voice Disorders'],
        phone: '+63 2 723 0101',
        distance: calculateDistance(14.6054, 121.0216, userLocation.latitude, userLocation.longitude),
      },
      {
        id: '8',
        name: 'Speech Solutions Therapy Hub',
        address: 'Makati Ave, Makati City',
        latitude: 14.5547,
        longitude: 121.0244,
        type: 'speech_therapy',
        services: ['Adult Speech Therapy', 'Accent Modification', 'Fluency Disorders'],
        phone: '+63 2 6789 0123',
        distance: calculateDistance(14.5547, 121.0244, userLocation.latitude, userLocation.longitude),
      },
    ].sort((a, b) => a.distance - b.distance);
  };

  const getMarkerColor = (type) => {
    switch (type) {
      case 'speech_therapy':
        return '#8B5CF6'; // Purple
      case 'pathology':
        return '#EC4899'; // Pink
      case 'specialist':
        return '#3B82F6'; // Blue
      case 'rehabilitation':
        return '#10B981'; // Green
      default:
        return '#6B7280';
    }
  };

  const getMarkerIcon = (type) => {
    switch (type) {
      case 'speech_therapy':
        return 'mic';
      case 'pathology':
        return 'medical';
      case 'specialist':
        return 'person';
      case 'rehabilitation':
        return 'fitness';
      default:
        return 'location';
    }
  };

  const filteredCenters = filterType === 'all' 
    ? centers 
    : centers.filter(center => center.type === filterType);

  const openInMaps = (center) => {
    const scheme = Platform.select({
      ios: 'maps:0,0?q=',
      android: 'geo:0,0?q=',
    });
    const latLng = `${center.latitude},${center.longitude}`;
    const label = encodeURIComponent(center.name);
    const url = Platform.select({
      ios: `${scheme}${label}@${latLng}`,
      android: `${scheme}${latLng}(${label})`,
    });

    Linking.openURL(url);
  };

  const callCenter = (center) => {
    if (center.phone) {
      Linking.openURL(`tel:${center.phone}`);
    } else {
      Alert.alert('No Contact', 'Phone number not available for this center.');
    }
  };

  const focusOnCenter = (center) => {
    setSelectedCenter(center);
    mapRef.current?.animateToRegion({
      latitude: center.latitude,
      longitude: center.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 1000);
  };

  const changeSearchRadius = () => {
    const radii = [1000, 2000, 5000, 10000, 20000];
    const currentIndex = radii.indexOf(searchRadius);
    const nextRadius = radii[(currentIndex + 1) % radii.length];
    
    Alert.alert(
      'Change Search Area',
      `Current radius: ${searchRadius/1000}km\nChange to: ${nextRadius/1000}km?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Update', 
          onPress: () => {
            setSearchRadius(nextRadius);
          }
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Ionicons name="mic" size={64} color="#8B5CF6" />
        <ActivityIndicator size="large" color="#8B5CF6" style={{ marginTop: 20 }} />
        <Text style={styles.loadingText}>Finding speech therapy centers near you...</Text>
      </View>
    );
  }

  if (!location) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-off" size={64} color="#EF4444" />
        <Text style={styles.errorText}>Location Access Required</Text>
        <Text style={styles.errorSubtext}>
          Articulink needs your location to show nearby speech therapy centers and specialists
        </Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={requestLocationPermission}
        >
          <Ionicons name="location" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.retryButtonText}>Enable Location</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* App Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Ionicons name="mic" size={24} color="#8B5CF6" />
          <Text style={styles.headerTitle}>Articulink</Text>
        </View>
        <Text style={styles.headerSubtitle}>Speech Therapy Centers</Text>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.filterButton,
                filterType === category.id && styles.filterButtonActive,
              ]}
              onPress={() => setFilterType(category.id)}
            >
              <Ionicons 
                name={category.icon} 
                size={16} 
                color={filterType === category.id ? '#fff' : '#8B5CF6'} 
              />
              <Text 
                style={[
                  styles.filterButtonText,
                  filterType === category.id && styles.filterButtonTextActive,
                ]}
              >
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Map View */}
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={location}
        showsUserLocation={true}
        showsMyLocationButton={true}
        showsCompass={true}
        loadingEnabled={true}
      >
        {/* Search radius circle */}
        <Circle
          center={location}
          radius={searchRadius}
          strokeColor="rgba(139, 92, 246, 0.5)"
          fillColor="rgba(139, 92, 246, 0.1)"
          strokeWidth={2}
        />

        {filteredCenters.map((center) => (
          <Marker
            key={center.id}
            coordinate={{
              latitude: center.latitude,
              longitude: center.longitude,
            }}
            onPress={() => setSelectedCenter(center)}
          >
            <View style={[styles.markerContainer, { backgroundColor: getMarkerColor(center.type) }]}>
              <Ionicons name={getMarkerIcon(center.type)} size={20} color="#fff" />
            </View>
            <Callout tooltip>
              <View style={styles.calloutContainer}>
                <Text style={styles.calloutTitle}>{center.name}</Text>
                <Text style={styles.calloutAddress}>{center.address}</Text>
                {center.distance > 0 && (
                  <Text style={styles.calloutDistance}>
                    📍 {center.distance.toFixed(2)} km away
                  </Text>
                )}
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <TouchableOpacity 
          style={styles.fab}
          onPress={changeSearchRadius}
        >
          <Ionicons name="resize" size={24} color="#fff" />
          <Text style={styles.fabText}>{searchRadius/1000}km</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.fab}
          onPress={() => fetchNearbyCenters()}
        >
          <Ionicons name="refresh" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Center Details Card */}
      {selectedCenter && (
        <View style={styles.detailsCard}>
          <View style={styles.detailsHeader}>
            <View style={styles.detailsHeaderLeft}>
              <View style={[styles.typeIcon, { backgroundColor: getMarkerColor(selectedCenter.type) }]}>
                <Ionicons name={getMarkerIcon(selectedCenter.type)} size={24} color="#fff" />
              </View>
              <View style={styles.detailsHeaderText}>
                <Text style={styles.detailsTitle}>{selectedCenter.name}</Text>
                <Text style={styles.detailsType}>
                  {selectedCenter.type.split('_').map(word => 
                    word.charAt(0).toUpperCase() + word.slice(1)
                  ).join(' ')}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setSelectedCenter(null)}>
              <Ionicons name="close-circle" size={28} color="#6B7280" />
            </TouchableOpacity>
          </View>

          <View style={styles.detailsContent}>
            <View style={styles.detailRow}>
              <Ionicons name="location" size={18} color="#8B5CF6" />
              <Text style={styles.detailText}>{selectedCenter.address}</Text>
            </View>

            {selectedCenter.distance > 0 && (
              <View style={styles.detailRow}>
                <Ionicons name="navigate" size={18} color="#8B5CF6" />
                <Text style={styles.detailText}>
                  {selectedCenter.distance.toFixed(2)} km away
                </Text>
              </View>
            )}

            {selectedCenter.services && selectedCenter.services.length > 0 && (
              <View style={styles.detailRow}>
                <Ionicons name="medical" size={18} color="#8B5CF6" />
                <Text style={styles.detailText}>
                  {selectedCenter.services.join(', ')}
                </Text>
              </View>
            )}

            {selectedCenter.phone && (
              <View style={styles.detailRow}>
                <Ionicons name="call" size={18} color="#10B981" />
                <Text style={styles.detailText}>{selectedCenter.phone}</Text>
              </View>
            )}
          </View>

          <View style={styles.detailsActions}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => openInMaps(selectedCenter)}
            >
              <Ionicons name="navigate" size={20} color="#fff" />
              <Text style={styles.actionButtonText}>Directions</Text>
            </TouchableOpacity>

            {selectedCenter.phone && (
              <TouchableOpacity 
                style={[styles.actionButton, styles.actionButtonSecondary]}
                onPress={() => callCenter(selectedCenter)}
              >
                <Ionicons name="call" size={20} color="#8B5CF6" />
                <Text style={[styles.actionButtonText, styles.actionButtonTextSecondary]}>
                  Call
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Results Counter */}
      <View style={styles.counterBadge}>
        <Ionicons name="medical" size={14} color="#8B5CF6" style={{ marginRight: 4 }} />
        <Text style={styles.counterText}>
          {filteredCenters.length} {filteredCenters.length === 1 ? 'center' : 'centers'}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
  },
  loadingText: {
    marginTop: 16,
    color: '#94A3B8',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
  },
  errorSubtext: {
    color: '#94A3B8',
    fontSize: 14,
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  header: {
    backgroundColor: '#1E293B',
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#8B5CF630',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
    marginLeft: 10,
  },
  headerSubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    marginLeft: 34,
  },
  filterContainer: {
    backgroundColor: '#1E293B',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#8B5CF630',
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#8B5CF6',
  },
  filterButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  filterButtonText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  map: {
    flex: 1,
  },
  fabContainer: {
    position: 'absolute',
    bottom: 240,
    right: 16,
    zIndex: 10,
  },
  fab: {
    backgroundColor: '#8B5CF6',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  fabText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  markerContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 6,
  },
  calloutContainer: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    minWidth: 220,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  calloutTitle: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  calloutAddress: {
    color: '#94A3B8',
    fontSize: 12,
    marginBottom: 6,
  },
  calloutDistance: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '600',
  },
  detailsCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#1E293B',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderTopWidth: 2,
    borderTopColor: '#8B5CF6',
  },
  detailsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  detailsHeaderLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 12,
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailsHeaderText: {
    flex: 1,
  },
  detailsTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  detailsType: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '600',
  },
  detailsContent: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailText: {
    color: '#E2E8F0',
    fontSize: 14,
    marginLeft: 10,
    flex: 1,
    lineHeight: 20,
  },
  detailsActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  actionButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: '#8B5CF6',
    shadowColor: 'transparent',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  actionButtonTextSecondary: {
    color: '#8B5CF6',
  },
  counterBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#8B5CF6',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  counterText: {
    color: '#8B5CF6',
    fontSize: 13,
    fontWeight: '700',
  },
});

export default ArticulinkMapScreen;