import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  StyleSheet,
  Alert,
  StatusBar,
  Platform,
  Animated,
  useWindowDimensions,
} from "react-native";
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  H1,
  SizableText,
  TextArea,
  Card,
  Spinner,
  Theme,
  AnimatePresence,
} from "tamagui";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import {
  Mic,
  Square,
  Volume2,
  Trash2,
  ChevronRight,
  FileText,
} from "@tamagui/lucide-icons";
import baseURL from "./../utils/baseurl";
import { getToken } from "./../utils/authToken";

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',
  teal: '#1A4480',
  tealLight: '#3DAFC4',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

// ─── Soft Orb (adapted for Tamagui/Animated) ──────────────────────
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
      <Circle
        pos="absolute"
        t={size * 0.15}
        l={size * 0.15}
        size={size * 0.7}
        bg="white"
        opacity={0.35}
      />
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
    <XStack ai="flex-end">
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
    </XStack>
  );
};

// ─── Pulse Ring ──────────────────────────────────────────────────
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

  // 📤 Upload Audio
  async function uploadAudio(uri: string) {
    const formData = new FormData();
    const uriParts = uri.split(".");
    const uriExtension = uriParts[uriParts.length - 1].toLowerCase();
    const extension = ["wav", "m4a", "caf", "3gp", "mp4"].includes(uriExtension) ? uriExtension : "wav";
    const fileName = `speech.${extension}`;

    let type = "audio/wav";
    if (extension === "m4a") type = "audio/x-m4a";
    else if (extension === "3gp") type = "audio/3gpp";
    else if (extension === "caf") type = "audio/x-caf";
    else if (extension === "mp4") type = "audio/mp4";
    else if (extension === "webm") type = "audio/webm";
    else if (extension === "mp3") type = "audio/mpeg";

    formData.append("file", {
      uri,
      name: fileName,
      type: type,
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
        Alert.alert("Transcription Error", data.detail || data.error || "Server failed to process audio");
        setTranscript("");
        return;
      }

      setTranscript(data.transcript || data.text || "");
    } catch (err: any) {
      Alert.alert("Network Error", "Could not connect to the transcription server.");
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
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Layered Background ── */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <YStack fullscreen bg={COLORS.cream} />
        
        {/* Orbs */}
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

        {/* Subtle dot grid */}
        {dotGrid.map((d, i) => (
          <Circle
            key={i}
            pos="absolute"
            size={2}
            bg={COLORS.royalBlue}
            opacity={0.04}
            l={d.left}
            t={d.top}
          />
        ))}

        {/* Corner brackets */}
        <YStack
          pos="absolute" t={58} l={22} w={34} h={34}
          borderTopWidth={1.5} borderLeftWidth={1.5}
          borderColor={`${COLORS.royalBlue}25`}
          br={6}
          borderBottomWidth={0} borderRightWidth={0}
        />
        <YStack
          pos="absolute" b={60} r={22} w={34} h={34}
          borderBottomWidth={1.5} borderRightWidth={1.5}
          borderColor={`${COLORS.teal}25`}
          br={6}
          borderTopWidth={0} borderLeftWidth={0}
        />
      </ZStack>

      {/* ── Main Content ── */}
      <YStack f={1} px="$5" pt={Platform.OS === "android" ? 48 : 60} pb={Platform.OS === "android" ? 20 : 30} gap="$4">
        
        {/* Header */}
        <YStack ai="center" gap="$1">
          <SizableText size="$1" fontWeight="800" color={COLORS.teal} ls={2.5} tt="uppercase">
            SPEECH CLARITY ENGINE
          </SizableText>
          <H1 fow="900" size="$10" color={COLORS.textDark} ls={-0.5}>
            Articulink
          </H1>
          <SizableText size="$3" color={COLORS.textMid} fow="500">
            Tap, speak, and let AI understand you
          </SizableText>
        </YStack>

        {/* Recording Section */}
        <YStack ai="center" gap="$2">
          <YStack w={120} h={120} jc="center" ai="center">
            <PulseRing active={isRecording} />
            {isRecording && (
              <Circle pos="absolute" size={120} bg={COLORS.teal} opacity={0.12} />
            )}
            
            <Button
              size={88}
              br={44}
              bg={isRecording ? '#DC2626' : COLORS.teal}
              onPress={isRecording ? stopRecording : startRecording}
              disabled={loading}
              pressStyle={{ scale: 0.92 }}
              elevation={10}
              shadowColor={isRecording ? '#DC2626' : '#2A8FA0'}
              icon={loading ? <Spinner size="large" color="white" /> : (isRecording ? <Square size={28} color="white" fill="white" /> : <Mic size={32} color="white" />)}
            />
          </YStack>

          <SizableText size="$3" fow="600" color={isRecording ? '#DC2626' : COLORS.textMid}>
            {statusText}
          </SizableText>

          {isRecording && (
            <YStack mt="$2">
              <AnimatedWaveform color={COLORS.teal} />
            </YStack>
          )}
        </YStack>

        {/* Transcript Card */}
        <Card f={1} bg="white" br={22} elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid} ov="hidden">
           {/* Top accent */}
          <YStack pos="absolute" t={0} l={0} r={0} h={3} bg={COLORS.royalBlue} />
          <YStack pos="absolute" t={0} l={0} r={0} h={50} bg={`${COLORS.royalBlue}07`} />

          <YStack f={1} p="$4">
            <XStack ai="center" gap="$2" mb="$2">
              <YStack w={30} h={30} br={9} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
                <FileText size={14} color={COLORS.royalBlue} />
              </YStack>
              <SizableText fow="800" size="$3" color={COLORS.textDark} ls={-0.2}>
                Transcript
              </SizableText>
              <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.7} />
              {transcript.length > 0 && (
                <YStack bg={`${COLORS.teal}14`} px="$2" py="$1" br={8}>
                  <SizableText fow="700" size="$1" color={COLORS.teal}>
                    {transcript.length}
                  </SizableText>
                </YStack>
              )}
            </XStack>

            <TextArea
              flex={1}
              bg={`${COLORS.royalBlue}04`}
              borderColor={COLORS.sandMid}
              br={14}
              p="$3"
              size="$4"
              fontWeight="500"
              color={COLORS.textDark}
              value={transcript}
              onChangeText={setTranscript}
              placeholder="Your speech will appear here..."
              placeholderTextColor={COLORS.textMid as any}
              borderWidth={1.5}
            />

            <YStack pos="absolute" b={12} r={14}>
              <AnimatedWaveform color={COLORS.royalBlue} />
            </YStack>
          </YStack>
        </Card>

        {/* Action Buttons */}
        <YStack gap="$2">
          <Button
            size="$5"
            bg={COLORS.teal}
            br={18}
            onPress={speakText}
            disabled={!transcript}
            opacity={!transcript ? 0.45 : 1}
            pressStyle={{ scale: 0.98 }}
            icon={<Volume2 size={18} color="white" />}
            iconAfter={<ChevronRight size={18} color="rgba(255,255,255,0.5)" />}
            elevation={6}
            shadowColor="#2A8FA0"
          >
            <SizableText fow="800" size="$4" color="white" ml="$2">
              Speak
            </SizableText>
          </Button>

          <Button
            size="$5"
            bg="white"
            br={18}
            onPress={clearTranscript}
            disabled={!transcript}
            opacity={!transcript ? 0.45 : 1}
            pressStyle={{ scale: 0.98 }}
            borderWidth={1}
            borderColor="rgba(220,38,38,0.18)"
            icon={<Trash2 size={16} color="#DC2626" />}
            iconAfter={<ChevronRight size={18} color="rgba(220,38,38,0.35)" />}
            elevation={5}
            shadowColor="#8A96A4"
          >
            <SizableText fow="800" size="$4" color="#DC2626" ml="$2">
              Clear
            </SizableText>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
};

export default HomeScreen;
