import React, { useMemo } from 'react';
import { View, Linking, Platform, StatusBar, Animated } from 'react-native';
import { useNavigation } from "@react-navigation/native";
import { WebView } from 'react-native-webview';
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Circle,
    H1,
    SizableText,
    Card,
    ScrollView,
    Spinner,
    AnimatePresence,
} from "tamagui";
import {
    Navigation,
    Phone,
    RefreshCw,
    Search,
    ChevronRight,
    Car,
    Footprints,
    Bike,
    Clock,
    MapPin,
    Trash2,
    Smile,
    Mic,
    Activity as ActivityIcon,
    GraduationCap,
    Accessibility,
    Home
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { Center } from "./useMapViewModel";

const SEARCH_RADIUS = 10000;

const FacilityIconComponent = ({ type, size = 20, color = COLORS.royalBlue }: { type: string, size?: number, color?: string }) => {
    switch (type) {
        case 'cleft-clinic': return <Smile size={size} color={color} />;
        case 'speech-therapy': return <Mic size={size} color={color} />;
        case 'voice-clinic': return <ActivityIcon size={size} color={color} />;
        case 'sped-school': return <GraduationCap size={size} color={color} />;
        default: return <Accessibility size={size} color={color} />;
    }
};

const generateMapHTML = (lat: number, lng: number) => `
<!DOCTYPE html><html><head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <style>
    #map { height: 100vh; width: 100%; position: absolute; top: 0; left: 0; background: #FAF8F4; }
    body { margin: 0; padding: 0; font-family: -apple-system, system-ui, sans-serif; height: 100vh; }
    .user-marker { width: 18px; height: 18px; background: #1A4480; border: 3px solid white; border-radius: 50%; box-shadow: 0 0 10px rgba(26,68,128,0.4); position: relative; }
    .user-marker::after { content: ''; position: absolute; top: -10px; left: -10px; right: -10px; bottom: -10px; border-radius: 50%; background: rgba(26,68,128,0.2); animation: pulse 2s infinite; }
    @keyframes pulse { 0% { transform: scale(0.6); opacity: 1; } 100% { transform: scale(1.6); opacity: 0; } }
    .facility-marker { background: white !important; width: 38px !important; height: 38px !important; border-radius: 14px !important; display: flex !important; align-items: center !important; justify-content: center !important; box-shadow: 0 6px 16px rgba(15,40,71,0.12) !important; border: 1.5px solid #DDD6C8 !important; transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275) !important; padding: 0 !important; margin: 0 !important; box-sizing: border-box !important; }
    .leaflet-div-icon { background: transparent !important; border: none !important; }
    .leaflet-popup-content-wrapper { border-radius: 20px; padding: 8px; box-shadow: 0 12px 30px rgba(15,40,71,0.25); background: #FFFFFF !important; }
    .leaflet-popup-tip { display: none; }
    .popup-card { padding: 10px; text-align: center; }
    .popup-title { font-weight: 900; color: #0F2847 !important; font-size: 15px; margin-bottom: 3px; }
    .popup-type { color: #1A4480 !important; font-weight: 800; font-size: 10px; text-transform: uppercase; margin-bottom: 5px; opacity: 0.9 !important; letter-spacing: 0.5px; }
    .popup-btn { background: #1A4480; color: white; border: none; padding: 10px 14px; border-radius: 12px; font-weight: 800; font-size: 13px; width: 100%; margin-top: 10px; cursor: pointer; box-shadow: 0 4px 12px rgba(26,68,128,0.2); }
  </style>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.7.1/dist/leaflet.css"/>
  <script src="https://unpkg.com/leaflet@1.7.1/dist/leaflet.js"></script>
</head><body><div id="map"></div><script>
  let map, routeLayer = null, markers = [];
  const icons = {
    'cleft-clinic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A8FA0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>',
    'speech-therapy': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A4480" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg>',
    'voice-clinic': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A8FA0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"></path></svg>',
    'sped-school': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1A4480" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"></path><path d="M6 12v5c0 2 2 3 6 3s6-1 6-3v-5"></path></svg>',
    'pwd-center': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2A8FA0" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="16" cy="4" r="1"/><path d="M12.3 10a2 2 0 0 0-2.3 1.3l-1.4 3.4c-.2.5-.2 1.1 0 1.6l1.2 3.2c.2.5.7.8 1.2.8h3.3"/><path d="M15 10l-3.5 1.5L9 16l3 5"/></svg>'
  };

  function init() {
    map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { maxZoom: 20 }).addTo(map);
    L.circle([${lat}, ${lng}], { color: '#1A4480', fillColor: '#1A4480', fillOpacity: 0.05, weight: 1.5, dashArray: '10, 10', radius: ${SEARCH_RADIUS} }).addTo(map);
    L.marker([${lat}, ${lng}], { icon: L.divIcon({ className: 'user-marker', iconSize: [18, 18], iconAnchor: [9, 9] }) }).addTo(map);
    if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify({type:'MAP_LOADED'}));
  }

  window.updateCenters = (cs) => {
    markers.forEach(m => map.removeLayer(m));
    markers = cs.map(c => {
      const marker = L.marker([c.latitude, c.longitude], {
        icon: L.divIcon({ className: 'facility-marker', html: icons[c.type] || icons['speech-therapy'], iconSize: [38, 38], iconAnchor: [19, 19] })
      }).addTo(map);
      const typeLabel = c.type === 'cleft-clinic' ? 'Cleft Clinic' : c.type === 'speech-therapy' ? 'Speech Therapy' : c.type === 'voice-clinic' ? 'Voice Clinic' : c.type === 'sped-school' ? 'SPED School' : 'PWD Center';
      marker.bindPopup(\`<div class="popup-card"><div class="popup-type">\${typeLabel}</div><div class="popup-title">\${c.name}</div><button class="popup-btn" onclick="window.selectCenter(\${c.latitude},\${c.longitude})">View Route</button></div>\`, { offset: [0, -12] });
      return marker;
    });
  };

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

  init();
</script></body></html>`;

interface MapViewProps {
    vm: any;
}

export const MapView: React.FC<MapViewProps> = ({ vm }) => {
    const navigation = useNavigation<any>();
    const mapHTML = useMemo(() => {
        if (!vm.location) return '<html><body></body></html>';
        return generateMapHTML(vm.location.latitude, vm.location.longitude);
    }, [vm.location?.latitude, vm.location?.longitude]);

    const handleWebViewMessage = (e: any) => {
        try {
            const data = JSON.parse(e.nativeEvent.data);
            if (data.type === 'CENTER_SELECT') {
                const c = vm.centers.find((x: any) => Math.abs(x.latitude - data.center.latitude) < 0.0001 && Math.abs(x.longitude - data.center.longitude) < 0.0001);
                if (c) vm.handleCenterSelect(c);
            } else if (data.type === 'MAP_LOADED') {
                vm.setMapLoading(false);
            }
        } catch (er) { }
    };

    if (vm.loading && !vm.location) {
        return (
            <YStack f={1} jc="center" ai="center" bg={COLORS.cream} p="$6">
                <Spinner size="large" color={COLORS.royalBlue} mb="$4" />
                <SizableText size="$5" fow="700" color={COLORS.textDark} ta="center">Optimizing map route...</SizableText>
            </YStack>
        );
    }

    return (
        <YStack flex={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" t={-vm.height * 0.1} r={-vm.width * 0.15} size={vm.width * 0.7} bg={COLORS.orbBlue} opacity={0.3} />
                <Circle pos="absolute" b={-vm.height * 0.05} l={-vm.width * 0.1} size={vm.width * 0.6} bg={COLORS.orbTeal} opacity={0.2} />
            </ZStack>

            <YStack pt={Platform.OS === 'ios' ? 45 : 10} px="$4" pb="$0.5" bg="transparent">
                <XStack ai="center" jc="space-between">
                    <XStack ai="center" gap="$2.5">
                        <Button
                            circular
                            size="$3"
                            bg="white"
                            bw={1}
                            bc={COLORS.sandMid}
                            elevation={1}
                            icon={<Home size={16} color={COLORS.royalBlue} />}
                            onPress={() => navigation.navigate("Home")}
                            pressStyle={{ scale: 0.9, opacity: 0.8 }}
                        />
                        <YStack>
                            <H1 size="$5" fow="900" color={COLORS.textDark} ls={-0.5} mt="$1">Articulink Maps</H1>
                            <SizableText size="$1" color={COLORS.textMid} fow="700" opacity={0.6} mt={-4}>Nearby Clinics</SizableText>
                        </YStack>
                    </XStack>
                    <Circle size={36} circular bg="white" bw={1} bc={COLORS.sandMid} elevation={1} onPress={vm.getCurrentLocation}>
                        <RefreshCw size={16} color={COLORS.royalBlue} />
                    </Circle>
                </XStack>
            </YStack>

            <Animated.View style={{ flex: 1, opacity: vm.animations.fadeAnim, transform: [{ translateY: vm.animations.slideAnim }] }}>
                <ZStack f={1} mx="$4" mb="$2" br={28} ov="hidden" bw={1.5} bc={COLORS.sandMid} elevation={4} shadowColor={COLORS.deepNavy}>
                    <WebView
                        ref={vm.webViewRef}
                        source={{ html: mapHTML }}
                        style={{ flex: 1 }}
                        javaScriptEnabled domStorageEnabled startInLoadingState
                        onMessage={handleWebViewMessage}
                        onLoadEnd={() => vm.setMapLoading(false)}
                    />
                    {vm.mapLoading && (
                        <YStack fullscreen jc="center" ai="center" bg="rgba(255,255,255,0.7)">
                            <Spinner size="large" color={COLORS.royalBlue} />
                        </YStack>
                    )}
                </ZStack>
            </Animated.View>

            <AnimatePresence>
                {vm.selectedCenter && !vm.isListExpanded && (
                    <YStack pos="absolute" b={120} l={20} r={20} zIndex={100}>
                        <Card bg="white" br={24} p="$4" elevation={10} shadowColor="#000" bw={1} bc={COLORS.sandMid}>
                            <XStack gap="$3" ai="center" mb="$3">
                                <Circle size={44} bg={COLORS.royalBlue + "0C"} bw={1} bc={COLORS.royalBlue + "15"} jc="center" ai="center">
                                    <FacilityIconComponent type={vm.selectedCenter.type} size={20} color={COLORS.royalBlue} />
                                </Circle>
                                <YStack f={1}>
                                    <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.3}>{vm.selectedCenter.name}</SizableText>
                                    <SizableText size="$1" color={COLORS.textMid} fow="700" textTransform="uppercase">{vm.selectedCenter.distance.toFixed(1)} km away</SizableText>
                                </YStack>
                                <Button size="$3" circular icon={<Trash2 size={16} color={COLORS.textMid} />} unstyled onPress={() => vm.setSelectedCenter(null)} />
                            </XStack>

                            {vm.routeInfo ? (
                                <YStack gap="$3" mb="$4" bg={COLORS.warmWhite} p="$3" br={16}>
                                    <XStack jc="space-around">
                                        <XStack ai="center" gap="$1.5"><Navigation size={14} color={COLORS.textMid} /><SizableText size="$2" fow="700" color={COLORS.textDark}>{vm.routeInfo.distance}</SizableText></XStack>
                                        <XStack ai="center" gap="$1.5"><Clock size={14} color={COLORS.textMid} /><SizableText size="$2" fow="700" color={COLORS.textDark}>{vm.routeInfo.duration}</SizableText></XStack>
                                    </XStack>
                                    <XStack jc="center" gap="$2">
                                        {['driving', 'walking', 'bicycling'].map(m => (
                                            <Button
                                                key={m} size="$3" circular
                                                bg={vm.travelMode === m ? COLORS.royalBlue : "white"}
                                                theme={vm.travelMode === m ? "alt1" : "light"}
                                                bw={1} bc={vm.travelMode === m ? COLORS.royalBlue : COLORS.sandMid}
                                                icon={
                                                    m === 'driving' ? <Car size={18} color={vm.travelMode === m ? "white" : COLORS.textMid} /> :
                                                        m === 'walking' ? <Footprints size={18} color={vm.travelMode === m ? "white" : COLORS.textMid} /> :
                                                            <Bike size={18} color={vm.travelMode === m ? "white" : COLORS.textMid} />
                                                }
                                                onPress={() => { vm.setTravelMode(m as any); vm.getRouteInfo(vm.selectedCenter, m); }}
                                                pressStyle={{ scale: 0.9, opacity: 0.8 }}
                                                elevation={vm.travelMode === m ? 4 : 0}
                                            />
                                        ))}
                                    </XStack>
                                </YStack>
                            ) : <Spinner color={COLORS.royalBlue} py="$4" />}

                            <XStack gap="$3">
                                <Button f={1} bg={COLORS.royalBlue} br={14} icon={<Navigation size={18} color="white" />} onPress={() => vm.openDirections(vm.selectedCenter)}>
                                    <SizableText color="white" fow="800">Directions</SizableText>
                                </Button>
                                {vm.selectedCenter.phone && <Button circular bg={COLORS.teal} icon={<Phone size={18} color="white" />} onPress={() => Linking.openURL("tel:" + vm.selectedCenter.phone)} />}
                            </XStack>
                        </Card>
                    </YStack>
                )}
            </AnimatePresence>

            <YStack bg="white" borderTopLeftRadius={28} borderTopRightRadius={28} p="$4" pb={Platform.OS === 'android' ? 20 : 35} elevation={8} shadowColor={COLORS.deepNavy} shadowOpacity={0.08} bw={1} bc={COLORS.sandMid}>
                <XStack ai="center" jc="space-between" mb={vm.isListExpanded ? "$3" : "0"}>
                    <XStack ai="center" gap="$2" onPress={() => vm.setIsListExpanded(!vm.isListExpanded)}>
                        <MapPin size={18} color={COLORS.royalBlue} />
                        <SizableText size="$4" fow="800" color={COLORS.textDark}>Nearby Centers</SizableText>
                        <YStack bg={COLORS.royalBlue + "14"} px="$2.5" py={2} br={20} ml="$1"><SizableText size="$1" fow="800" color={COLORS.royalBlue}>{vm.centers.length}</SizableText></YStack>
                    </XStack>
                    <Button size="$2.5" circular bg="transparent" unstyled icon={<ChevronRight size={18} color={COLORS.textMid} style={{ transform: [{ rotate: vm.isListExpanded ? '90deg' : '-90deg' }] }} />} onPress={() => vm.setIsListExpanded(!vm.isListExpanded)} />
                </XStack>

                {vm.isListExpanded && (
                    <YStack>
                        {vm.centers.length > 0 ? (
                            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 20 }}>
                                {vm.centers.map((c: Center) => (
                                    <Card key={c.id} w={180} p="$3" br={20} bw={2} bc={vm.selectedCenter?.id === c.id ? COLORS.royalBlue : COLORS.sandMid} bg={vm.selectedCenter?.id === c.id ? COLORS.royalBlue + "05" : "white"} onPress={() => vm.handleCenterSelect(c)} pressStyle={{ scale: 0.95 }}>
                                        <XStack ai="center" gap="$2" mb="$2">
                                            <YStack w={28} h={28} br={8} bg={COLORS.royalBlue + "0A"} ai="center" jc="center">
                                                <FacilityIconComponent type={c.type} size={14} color={COLORS.royalBlue} />
                                            </YStack>
                                            <SizableText f={1} size="$2" fow="800" color={COLORS.textDark} numberOfLines={1}>{c.name}</SizableText>
                                        </XStack>
                                        <SizableText size="$1" color={COLORS.textMid} fow="600" mb="$1">{c.distance.toFixed(1)} km away</SizableText>
                                    </Card>
                                ))}
                            </ScrollView>
                        ) : <SizableText size="$2" color={COLORS.textMid} ta="center" py="$4">Searching...</SizableText>}
                        <XStack mt="$4" gap="$3">
                            <Button f={1} bg={COLORS.mediumBlue} br={16} icon={<Search size={16} color="white" />} onPress={vm.openGoogleMaps}>
                                <SizableText color="white" fow="800">Find More on Google</SizableText>
                            </Button>
                            <Button circular bg="white" bw={1} bc={COLORS.sandMid} icon={<RefreshCw size={18} color={COLORS.textMid} />} onPress={vm.getCurrentLocation} />
                        </XStack>
                    </YStack>
                )}
            </YStack>
        </YStack>
    );
};
