import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  Animated,
  useWindowDimensions,
  ActivityIndicator,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import {
  Mic,
  Square,
  Volume2,
  Trash2,
  ChevronRight,
  FileText,
} from "lucide-react-native";
import baseURL from "./../utils/baseurl";
import { getToken } from "./../utils/authToken";

// ─── Brand Palette (matches StartUpScreen / ProfileScreen) ────────
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

// ─── Soft Orb (animated background element) ───────────────────────
interface SoftOrbProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

const SoftOrb: React.FC<SoftOrbProps> = ({ color, size, x, y, duration, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1, 0.92] });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x - size / 2, top: y - size / 2,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: 0.5,
      transform: [{ translateY }, { scale }],
    }}>
      <View style={{
        position: 'absolute',
        top: size * 0.15, left: size * 0.15,
        width: size * 0.7, height: size * 0.7,
        borderRadius: size * 0.35,
        backgroundColor: COLORS.white,
        opacity: 0.35,
      }} />
    </Animated.View>
  );
};

// ─── Animated Waveform Bars ───────────────────────────────────────
const AnimatedWaveform: React.FC<{ color: string }> = ({ color }) => {
  const barHeights = [6, 14, 22, 16, 30, 20, 10, 26, 18, 12];
  const barAnims = useRef(barHeights.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    const animations = barAnims.map((anim, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 80),
          Animated.timing(anim, { toValue: 1, duration: 500 + (i % 4) * 120, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 500 + (i % 4) * 120, useNativeDriver: true }),
        ])
      )
    );
    animations.forEach(a => a.start());
    return () => animations.forEach(a => a.stop());
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      {barHeights.map((h, i) => {
        const scaleY = barAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.35, 1] });
        return (
          <Animated.View key={i} style={{
            width: 3.5, height: h,
            borderRadius: 1.75,
            backgroundColor: color,
            opacity: 0.18,
            marginHorizontal: 2.5,
            transform: [{ scaleY }],
          }} />
        );
      })}
    </View>
  );
};

// ─── Pulse Ring (recording animation) ─────────────────────────────
const PulseRing: React.FC<{ active: boolean }> = ({ active }) => {
  const pulse1 = useRef(new Animated.Value(0)).current;
  const pulse2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (active) {
      const createPulse = (anim: Animated.Value, delay: number) =>
        Animated.loop(
          Animated.sequence([
            Animated.delay(delay),
            Animated.timing(anim, { toValue: 1, duration: 1400, useNativeDriver: true }),
          ])
        );
      const a1 = createPulse(pulse1, 0);
      const a2 = createPulse(pulse2, 700);
      a1.start(); a2.start();
      return () => { a1.stop(); a2.stop(); pulse1.setValue(0); pulse2.setValue(0); };
    } else {
      pulse1.setValue(0);
      pulse2.setValue(0);
    }
  }, [active]);

  if (!active) return null;

  const renderRing = (anim: Animated.Value) => {
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1.8] });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0] });
    return (
      <Animated.View style={{
        position: 'absolute',
        width: 120, height: 120, borderRadius: 60,
        borderWidth: 2, borderColor: COLORS.teal,
        transform: [{ scale }],
        opacity,
      }} />
    );
  };

  return (
    <>
      {renderRing(pulse1)}
      {renderRing(pulse2)}
    </>
  );
};

// ─── Main Component ───────────────────────────────────────────────
const HomeScreen: React.FC = () => {
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcript, setTranscript] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const { width, height } = useWindowDimensions();

  // Background orbs
  const orbs = useMemo(() => ([
    { color: COLORS.orbSand, size: width * 0.7, x: width * 0.85, y: height * 0.08, duration: 6000, delay: 0 },
    { color: COLORS.orbBlue, size: width * 0.55, x: width * 0.1, y: height * 0.5, duration: 7200, delay: 900 },
    { color: COLORS.orbTeal, size: width * 0.4, x: width * 0.6, y: height * 0.85, duration: 5500, delay: 500 },
  ]), [width, height]);

  // Dot grid
  const dotGrid = useMemo(() => {
    const items: { left: number; top: number }[] = [];
    for (let row = 0; row < 9; row++)
      for (let col = 0; col < 6; col++)
        items.push({
          left: (width / 6) * col + (width / 12),
          top: (height / 9) * row + (height / 18),
        });
    return items;
  }, [width, height]);

  // 🎙 Start Recording
  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      Alert.alert("Error", "Could not start recording");
    }
  }

  // ⏹ Stop & Upload
  async function stopRecording() {
    if (!recording) return;

    setLoading(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    if (uri) {
      await uploadAudio(uri);
    }
    setLoading(false);
  }

  // 📤 Upload Audio to FastAPI
  async function uploadAudio(uri: string) {
    const formData = new FormData();

    // @ts-ignore - FormData expects string | Blob, but RN expects this object structure
    formData.append("file", {
      uri,
      name: "speech.wav",
      type: "audio/wav",
    } as any);

    try {
      const token = await getToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${baseURL}/transcribe`, {
        method: "POST",
        body: formData,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        console.error("Server Error:", data);
        Alert.alert("Transcription Error", data.detail || data.error || "Server failed to process audio");
        setTranscript("");
        return;
      }

      setTranscript(data.text || "");
    } catch (err: any) {
      console.error("Fetch Error:", err);
      Alert.alert("Network Error", "Could not connect to the transcription server. Please check your connection and IP address.");
    }
  }

  // 🔊 Speak Text
  function speakText() {
    if (!transcript.trim()) {
      Alert.alert("Nothing to speak");
      return;
    }

    Speech.stop();
    Speech.speak(transcript, {
      language: "fil-PH",
      rate: 0.9,
      pitch: 1.0,
    });
  }

  // 🗑 Clear Text
  function clearTranscript() {
    Speech.stop();
    setTranscript("");
  }

  const isRecording = !!recording;
  const statusText = loading ? "Processing your speech..." : isRecording ? "Listening..." : "Tap the mic to start";

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Layered Background ── */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.cream }]} />

        {/* Warm bloom — top right */}
        <View style={{
          position: 'absolute', top: -height * 0.08, right: -width * 0.15,
          width: width * 0.9, height: width * 0.9, borderRadius: width * 0.45,
          backgroundColor: COLORS.orbSand, opacity: 0.5,
        }} />

        {/* Cool bloom — bottom left */}
        <View style={{
          position: 'absolute', bottom: -height * 0.06, left: -width * 0.2,
          width: width * 0.8, height: width * 0.8, borderRadius: width * 0.4,
          backgroundColor: COLORS.orbBlue, opacity: 0.25,
        }} />

        {/* Animated soft orbs */}
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

        {/* Subtle dot grid */}
        {dotGrid.map((d, i) => (
          <View key={i} style={{
            position: 'absolute', width: 2, height: 2, borderRadius: 1,
            backgroundColor: COLORS.royalBlue, opacity: 0.04,
            left: d.left, top: d.top,
          }} />
        ))}

        {/* Corner brackets */}
        <View style={{
          position: 'absolute', top: 58, left: 22, width: 34, height: 34,
          borderTopWidth: 1.5, borderLeftWidth: 1.5,
          borderColor: `${COLORS.royalBlue}25`, borderTopLeftRadius: 6,
        }} />
        <View style={{
          position: 'absolute', bottom: 60, right: 22, width: 34, height: 34,
          borderBottomWidth: 1.5, borderRightWidth: 1.5,
          borderColor: `${COLORS.teal}25`, borderBottomRightRadius: 6,
        }} />
      </View>

      {/* ── Header ── */}
      <View style={styles.header}>
        <Text style={styles.tagline}>SPEECH CLARITY ENGINE</Text>
        <Text style={styles.title}>Articulink</Text>
        <Text style={styles.subtitle}>Tap, speak, and let AI understand you</Text>
      </View>

      {/* ── Recording Section ── */}
      <View style={styles.recordingSection}>
        {/* Mic Button */}
        <View style={styles.micArea}>
          <PulseRing active={isRecording} />

          {/* Halo glow when recording */}
          {isRecording && (
            <View style={styles.micHalo} />
          )}

          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={isRecording ? stopRecording : startRecording}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="large" color={COLORS.white} />
            ) : isRecording ? (
              <Square size={28} color={COLORS.white} fill={COLORS.white} />
            ) : (
              <Mic size={32} color={COLORS.white} strokeWidth={2} />
            )}
          </TouchableOpacity>
        </View>

        {/* Status Text */}
        <Text style={[styles.statusText, isRecording && styles.statusTextActive]}>
          {statusText}
        </Text>

        {/* Mini waveform when recording */}
        {isRecording && (
          <View style={styles.recordingWaveform}>
            <AnimatedWaveform color={COLORS.teal} />
          </View>
        )}
      </View>

      {/* ── Transcript Card ── */}
      <View style={styles.transcriptCard}>
        {/* Top accent bar */}
        <View style={styles.cardTopBar} />
        {/* Top glow */}
        <View style={styles.cardTopGlow} />

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconWrap}>
            <FileText size={14} color={COLORS.royalBlue} />
          </View>
          <Text style={styles.sectionTitle}>Transcript</Text>
          <View style={styles.sectionLine} />
          {transcript.length > 0 && (
            <View style={styles.charBadge}>
              <Text style={styles.charBadgeText}>{transcript.length}</Text>
            </View>
          )}
        </View>

        <TextInput
          style={styles.textbox}
          multiline
          value={transcript}
          onChangeText={setTranscript}
          placeholder="Your speech will appear here..."
          placeholderTextColor={`${COLORS.textMid}55`}
        />

        {/* Bottom waveform decoration */}
        <View style={styles.cardWaveform}>
          <AnimatedWaveform color={COLORS.royalBlue} />
        </View>
      </View>

      {/* ── Action Buttons ── */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, styles.speakButton, !transcript && styles.buttonDisabled]}
          onPress={speakText}
          disabled={!transcript}
          activeOpacity={0.88}
        >
          <View style={styles.btnShimmer} />
          <Volume2 size={18} color={COLORS.white} />
          <Text style={styles.speakButtonText}>Speak</Text>
          <View style={{ flex: 1 }} />
          <ChevronRight size={18} color="rgba(255,255,255,0.5)" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.clearButton, !transcript && styles.buttonDisabled]}
          onPress={clearTranscript}
          disabled={!transcript}
          activeOpacity={0.88}
        >
          <Trash2 size={16} color="#DC2626" />
          <Text style={styles.clearButtonText}>Clear</Text>
          <View style={{ flex: 1 }} />
          <ChevronRight size={18} color="rgba(220,38,38,0.35)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default HomeScreen;

// ─── Styles ───────────────────────────────────────────────────────
const CARD_SHADOW = Platform.select({
  ios: { shadowColor: '#8A96A4', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.12, shadowRadius: 22 },
  android: { elevation: 5 },
}) as any;

const BTN_SHADOW = Platform.select({
  ios: { shadowColor: '#2A8FA0', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.22, shadowRadius: 14 },
  android: { elevation: 6 },
}) as any;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
    paddingHorizontal: 22,
    paddingTop: Platform.OS === "android" ? 48 : 60,
    paddingBottom: Platform.OS === "android" ? 20 : 30,
  },

  /* Header */
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  tagline: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.teal,
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  title: {
    fontSize: 30,
    fontWeight: "900",
    color: COLORS.textDark,
    letterSpacing: -0.5,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 13,
    color: COLORS.textMid,
    fontWeight: '500',
    letterSpacing: -0.1,
  },

  /* Recording Section */
  recordingSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  micArea: {
    width: 120,
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  micHalo: {
    position: 'absolute',
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: COLORS.teal,
    opacity: 0.12,
  },
  micButton: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: COLORS.teal,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: { shadowColor: '#2A8FA0', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 18 },
      android: { elevation: 10 },
    }),
  },
  micButtonActive: {
    backgroundColor: '#DC2626',
    ...Platform.select({
      ios: { shadowColor: '#DC2626', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 18 },
      android: { elevation: 10 },
    }),
  },
  statusText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textMid,
    letterSpacing: -0.1,
  },
  statusTextActive: {
    color: '#DC2626',
    fontWeight: '700',
  },
  recordingWaveform: {
    marginTop: 10,
  },

  /* Transcript Card */
  transcriptCard: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderRadius: 22,
    marginBottom: 14,
    overflow: 'hidden',
    ...CARD_SHADOW,
    borderWidth: 1,
    borderColor: COLORS.sandMid,
    paddingHorizontal: 16,
    paddingBottom: 14,
  },
  cardTopBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    height: 3,
    backgroundColor: COLORS.royalBlue,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  cardTopGlow: {
    position: 'absolute', top: 0, left: 0, right: 0, height: 50,
    backgroundColor: `${COLORS.royalBlue}07`,
    borderTopLeftRadius: 22, borderTopRightRadius: 22,
  },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center',
    paddingTop: 14, paddingBottom: 10,
    gap: 8,
  },
  sectionIconWrap: {
    width: 30, height: 30, borderRadius: 9,
    backgroundColor: `${COLORS.royalBlue}0C`,
    justifyContent: 'center', alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13, fontWeight: '800',
    color: COLORS.textDark, letterSpacing: -0.2,
  },
  sectionLine: {
    flex: 1, height: 1,
    backgroundColor: COLORS.sandMid, opacity: 0.7,
  },
  charBadge: {
    backgroundColor: `${COLORS.teal}14`,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  charBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.teal,
  },
  textbox: {
    flex: 1,
    backgroundColor: `${COLORS.royalBlue}04`,
    borderWidth: 1.5,
    borderColor: COLORS.sandMid,
    borderRadius: 14,
    padding: 14,
    minHeight: 100,
    color: COLORS.textDark,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 23,
    textAlignVertical: "top",
  },
  cardWaveform: {
    position: 'absolute', bottom: 12, right: 14,
  },

  /* Action Buttons */
  actionRow: {
    gap: 10,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 18,
    overflow: 'hidden',
  },
  speakButton: {
    backgroundColor: COLORS.teal,
    ...BTN_SHADOW,
  },
  btnShimmer: {
    position: 'absolute', top: 0, left: 0, width: '45%', height: '100%',
    backgroundColor: 'rgba(255,255,255,0.1)', borderBottomRightRadius: 70,
  },
  speakButtonText: {
    color: COLORS.white,
    fontWeight: "800",
    marginLeft: 10,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  clearButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.18)',
    ...CARD_SHADOW,
  },
  clearButtonText: {
    color: "#DC2626",
    fontWeight: "800",
    marginLeft: 10,
    fontSize: 15,
    letterSpacing: -0.1,
  },
  buttonDisabled: {
    opacity: 0.45,
  },
});
