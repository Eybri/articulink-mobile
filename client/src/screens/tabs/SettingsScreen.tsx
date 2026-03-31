import React, { useState, useRef, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  useWindowDimensions,
  Animated,
  TouchableOpacity,
} from 'react-native';
import Slider from '@react-native-community/slider';
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  SizableText,
  Card,
  Switch,
  Separator,
  Theme,
} from "tamagui";
import {
  Bell,
  History,
  Volume2,
  Mic,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Trash2,
  LogOut,
  AppWindow,
  Lock,
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

// ─── Sub Components ───────────────────────────────────────────────

const SettingRow = ({ icon, title, description, children, isLast = false, onPress }: { icon: any, title: string, description?: string, children: React.ReactNode, isLast?: boolean, onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
    <YStack>
      <XStack ai="center" jc="space-between" py="$4" gap="$3">
        <XStack ai="center" gap="$3" f={1}>
          <YStack w={42} h={42} br={14} bg={`${COLORS.royalBlue}0A`} jc="center" ai="center">
            {icon}
          </YStack>
          <YStack f={1}>
            <SizableText size="$4" fow="700" color={COLORS.textDark} ls={-0.4}>{title}</SizableText>
            {description && <SizableText size="$1" color={COLORS.textMid} fow="500" opacity={0.8}>{description}</SizableText>}
          </YStack>
        </XStack>
        {children}
      </XStack>
      {!isLast && <Separator bc="rgba(221, 214, 200, 0.4)" />}
    </YStack>
  </TouchableOpacity>
);

const SliderSetting = ({ icon, title, value, onValueChange }: { icon: any, title: string, value: number, onValueChange: (v: number) => void }) => (
  <YStack py="$4" gap="$3">
    <XStack ai="center" jc="space-between">
      <XStack ai="center" gap="$3">
        <YStack w={42} h={42} br={14} bg={`${COLORS.royalBlue}0A`} jc="center" ai="center">
          {icon}
        </YStack>
        <SizableText size="$4" fow="700" color={COLORS.textDark} ls={-0.4}>{title}</SizableText>
      </XStack>
      <SizableText size="$2" fow="800" color={COLORS.royalBlue}>{Math.round(value * 100)}%</SizableText>
    </XStack>
    <YStack px="$1" mt="$1">
      <Slider
        style={{ width: '100%', height: 30 }}
        value={value}
        onValueChange={onValueChange}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor={COLORS.royalBlue}
        maximumTrackTintColor={COLORS.sandMid}
        thumbTintColor={COLORS.royalBlue}
      />
      <XStack jc="space-between" px="$1" mt="$1">
        <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.5}>Soft</SizableText>
        <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.5}>Strong</SizableText>
      </XStack>
    </YStack>
  </YStack>
);

// ─── Main Screen ──────────────────────────────────────────────────

const SettingsScreen: React.FC = () => {
  const [saveHistory, setSaveHistory] = useState(true);
  const [vibrationFeedback, setVibrationFeedback] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.7);
  const [micSensitivity, setMicSensitivity] = useState(0.8);
  const [notifications, setNotifications] = useState(true);
  const { width, height } = useWindowDimensions();

  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.spring(slideAnim, { toValue: 0, tension: 30, friction: 8, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all translation history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear", style: "destructive", onPress: () => {
            Alert.alert("Success", "Translation history cleared successfully!");
          }
        }
      ]
    );
  };

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background blobs for depth */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.1} r={-width * 0.25} size={width * 0.9} bg={COLORS.sandLight} opacity={0.35} />
        <Circle pos="absolute" b={-height * 0.15} l={-width * 0.2} size={width * 0.8} bg={COLORS.orbTeal} opacity={0.15} />
        <Circle pos="absolute" t={height * 0.4} r={-width * 0.1} size={width * 0.2} bg={COLORS.orbSand} opacity={0.2} />
      </ZStack>

      <Animated.View style={{ 
        flex: 1, 
        opacity: fadeAnim, 
        transform: [{ translateY: slideAnim }] 
      }}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140, paddingTop: 10 }}
        >
          {/* Section: Configuration */}
          <YStack mb="$7">
            <XStack ai="center" gap="$2" mb="$3" ml="$2">
              <AppWindow size={14} color={COLORS.royalBlue} />
              <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.5}>Preferences</SizableText>
            </XStack>
            
            <Card bg="white" br={28} p="$1" px="$5" elevation={6} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
              <SettingRow icon={<Bell size={18} color={COLORS.royalBlue} />} title="Push Notifications" description="Daily exercise reminders">
                <Switch size="$3" bg={notifications ? COLORS.royalBlue : COLORS.sandMid} checked={notifications} onCheckedChange={setNotifications}>
                  <Switch.Thumb bg="white" />
                </Switch>
              </SettingRow>
              
              <SettingRow icon={<History size={18} color={COLORS.royalBlue} />} title="Store History" description="Keep logs on this device">
                <Switch size="$3" bg={saveHistory ? COLORS.royalBlue : COLORS.sandMid} checked={saveHistory} onCheckedChange={setSaveHistory}>
                  <Switch.Thumb bg="white" />
                </Switch>
              </SettingRow>
              
              <SettingRow icon={<Smartphone size={18} color={COLORS.royalBlue} />} title="Haptic Feedback" description="Vibrate on interaction" isLast>
                <Switch size="$3" bg={vibrationFeedback ? COLORS.royalBlue : COLORS.sandMid} checked={vibrationFeedback} onCheckedChange={setVibrationFeedback}>
                  <Switch.Thumb bg="white" />
                </Switch>
              </SettingRow>
            </Card>
          </YStack>

          {/* Section: Audio Controls */}
          <YStack mb="$7">
            <XStack ai="center" gap="$2" mb="$3" ml="$2">
              <Volume2 size={14} color={COLORS.teal} />
              <SizableText size="$2" fontWeight="800" color={COLORS.teal} textTransform="uppercase" ls={1.5}>Audio Engine</SizableText>
            </XStack>
            
            <Card bg="white" br={28} p="$1" px="$5" elevation={6} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
              <SliderSetting icon={<Volume2 size={18} color={COLORS.teal} />} title="Output Volume" value={voiceVolume} onValueChange={setVoiceVolume} />
              <Separator bc="rgba(221, 214, 200, 0.4)" />
              <SliderSetting icon={<Mic size={18} color={COLORS.teal} />} title="Mic Recording" value={micSensitivity} onValueChange={setMicSensitivity} />
            </Card>
          </YStack>

          {/* Section: Privacy & Storage */}
          <YStack mb="$8">
            <XStack ai="center" gap="$2" mb="$3" ml="$2">
              <Lock size={14} color={COLORS.textMid} />
              <SizableText size="$2" fow="800" color={COLORS.textMid} textTransform="uppercase" ls={1.5}>Privacy & Security</SizableText>
            </XStack>
            
            <Card bg="white" br={28} p="$1" px="$5" elevation={6} shadowColor="#8A96A4" shadowOpacity={0.08} bw={1} bc="rgba(221, 214, 200, 0.4)">
              <SettingRow 
                icon={<Trash2 size={18} color="#DC2626" />} 
                title="Clear Local Cache" 
                description="Remove all local message data"
                onPress={handleClearHistory}
              >
                <ChevronRight size={18} color={COLORS.sandMid} />
              </SettingRow>
              
              <SettingRow 
                icon={<ShieldCheck size={18} color={COLORS.royalBlue} />} 
                title="Privacy Policy" 
                description="Review data handling" 
                isLast
                onPress={() => Alert.alert("Privacy Policy", "Your data is encrypted.")}
              >
                <ChevronRight size={18} color={COLORS.sandMid} />
              </SettingRow>
            </Card>
          </YStack>

          {/* Footer Info */}
          <YStack ai="center" gap="$2" mt="$4" opacity={0.6}>
            <SizableText size="$1" color={COLORS.textMid} fow="800" ls={1}>ARTICULINK v1.0.4 PRO</SizableText>
            <XStack ai="center" gap="$1.5">
              <Circle size={4} bg={COLORS.teal} />
              <Paragraph size="$1" color={COLORS.textMid} fow="600">Built for Articulation Support</Paragraph>
              <Circle size={4} bg={COLORS.teal} />
            </XStack>
          </YStack>

          {/* Logout Button */}
          <Button
            mt="$10"
            bg="rgba(220,38,38,0.06)"
            h={62}
            br={20}
            bw={1.5}
            bc="rgba(220,38,38,0.12)"
            onPress={() => Alert.alert("Logout", "Sign out of your account?", [{ text: "Cancel", style: 'cancel' }, { text: "Logout", style: "destructive" }])}
            icon={<LogOut size={20} color="#DC2626" />}
            pressStyle={{ scale: 0.97, bg: "rgba(220,38,38,0.1)" }}
            animation="bouncy"
          >
            <SizableText color="#DC2626" fow="800" size="$4" ls={-0.2}>Logout Session</SizableText>
          </Button>
        </ScrollView>
      </Animated.View>
    </YStack>
  );
};

export default SettingsScreen;