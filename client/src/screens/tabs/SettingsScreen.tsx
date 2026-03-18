import React, { useState } from 'react';
import {
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
  StatusBar,
  useWindowDimensions,
} from 'react-native';
import Slider from '@react-native-community/slider';
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
  Switch,
  Separator,
  Theme,
} from "tamagui";
import {
  Settings,
  Bell,
  History,
  Volume2,
  Mic,
  ShieldCheck,
  Smartphone,
  ChevronRight,
  Trash2,
  Info,
  LogOut,
  AppWindow,
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

const SettingsScreen: React.FC = () => {
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [vibrationFeedback, setVibrationFeedback] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.7);
  const [micSensitivity, setMicSensitivity] = useState(0.8);
  const [notifications, setNotifications] = useState(true);
  const { width, height } = useWindowDimensions();

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

  const SettingRow = ({ icon, title, description, children }: { icon: any, title: string, description?: string, children: React.ReactNode }) => (
    <XStack ai="center" jc="space-between" py="$4" gap="$3">
      <XStack ai="center" gap="$3" f={1}>
        <YStack w={40} h={40} br={12} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
          {icon}
        </YStack>
        <YStack f={1}>
          <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.3}>{title}</SizableText>
          {description && <SizableText size="$1" color={COLORS.textMid} fow="600">{description}</SizableText>}
        </YStack>
      </XStack>
      {children}
    </XStack>
  );

  const SliderSetting = ({ icon, title, value, onValueChange }: { icon: any, title: string, value: number, onValueChange: (v: number) => void }) => (
    <YStack py="$4" gap="$3">
      <XStack ai="center" jc="space-between">
        <XStack ai="center" gap="$3">
          <YStack w={40} h={40} br={12} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
            {icon}
          </YStack>
          <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.3}>{title}</SizableText>
        </XStack>
        <SizableText size="$2" fow="800" color={COLORS.royalBlue}>{Math.round(value * 100)}%</SizableText>
      </XStack>
      <YStack px="$1">
        <Slider
          style={{ width: '100%', height: 40 }}
          value={value}
          onValueChange={onValueChange}
          minimumValue={0}
          maximumValue={1}
          minimumTrackTintColor={COLORS.royalBlue}
          maximumTrackTintColor={COLORS.sandMid}
          thumbTintColor={COLORS.royalBlue}
        />
        <XStack jc="space-between" px="$1">
          <SizableText size="$1" color={COLORS.textMid} fow="600">Low</SizableText>
          <SizableText size="$1" color={COLORS.textMid} fow="600">High</SizableText>
        </XStack>
      </YStack>
    </YStack>
  );

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Background blobs */}
      <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.15} l={-width * 0.2} size={width * 0.8} bg={COLORS.orbBlue} opacity={0.3} />
        <Circle pos="absolute" b={-height * 0.1} r={-width * 0.2} size={width * 0.7} bg={COLORS.orbTeal} opacity={0.2} />
      </ZStack>

      {/* Header Area */}
      <YStack pt={Platform.OS === 'android' ? 60 : 70} px="$4" pb="$4">
        <XStack ai="center" jc="space-between">
          <YStack>
            <H1 size="$9" fow="900" color={COLORS.textDark} ls={-1}>Settings</H1>
            <SizableText size="$2" color={COLORS.textMid} fow="600">Manage your app experience</SizableText>
          </YStack>
          <Circle size={48} bg="white" bw={1} bc={COLORS.sandMid} elevation={3}>
            <Settings size={22} color={COLORS.royalBlue} />
          </Circle>
        </XStack>
      </YStack>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 120 }}>
        {/* App Preferences */}
        <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.2} mb="$3" ml="$1">App Preferences</SizableText>
        <Card bg="white" br={24} p="$2" px="$5" mb="$6" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid}>
          <SettingRow icon={<Bell size={18} color={COLORS.royalBlue} />} title="Notifications" description="Daily reminders for exercises">
            <Switch size="$3" bg={notifications ? COLORS.royalBlue : COLORS.sandMid} checked={notifications} onCheckedChange={setNotifications}>
              <Switch.Thumb bg="white" />
            </Switch>
          </SettingRow>
          <Separator bc={COLORS.sandLight} />
          <SettingRow icon={<History size={18} color={COLORS.royalBlue} />} title="Save History" description="Store recordings on this device">
            <Switch size="$3" bg={saveHistory ? COLORS.royalBlue : COLORS.sandMid} checked={saveHistory} onCheckedChange={setSaveHistory}>
              <Switch.Thumb bg="white" />
            </Switch>
          </SettingRow>
          <Separator bc={COLORS.sandLight} />
          <SettingRow icon={<Smartphone size={18} color={COLORS.royalBlue} />} title="Vibration Feedback" description="Tactile response on click">
            <Switch size="$3" bg={vibrationFeedback ? COLORS.royalBlue : COLORS.sandMid} checked={vibrationFeedback} onCheckedChange={setVibrationFeedback}>
              <Switch.Thumb bg="white" />
            </Switch>
          </SettingRow>
        </Card>

        {/* Audio Engine */}
        <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.2} mb="$3" ml="$1">Audio Engine</SizableText>
        <Card bg="white" br={24} p="$2" px="$5" mb="$6" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid}>
          <SliderSetting icon={<Volume2 size={18} color={COLORS.royalBlue} />} title="Voice Volume" value={voiceVolume} onValueChange={setVoiceVolume} />
          <Separator bc={COLORS.sandLight} />
          <SliderSetting icon={<Mic size={18} color={COLORS.royalBlue} />} title="Mic Sensitivity" value={micSensitivity} onValueChange={setMicSensitivity} />
        </Card>

        {/* Data & Security */}
        <SizableText size="$2" fow="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.2} mb="$3" ml="$1">Data & Security</SizableText>
        <Card bg="white" br={24} p="$2" px="$5" mb="$6" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.sandMid}>
          <Button
            unstyled
            onPress={handleClearHistory}
          >
            <SettingRow icon={<Trash2 size={18} color="#DC2626" />} title="Clear Local Data" description="Permanently delete all storage">
              <ChevronRight size={18} color={COLORS.sandMid} />
            </SettingRow>
          </Button>
          <Separator bc={COLORS.sandLight} />
          <Button
            unstyled
            onPress={() => Alert.alert("Privacy Policy", "Articulink follows strict data privacy laws...")}
          >
            <SettingRow icon={<ShieldCheck size={18} color={COLORS.royalBlue} />} title="Privacy Policy" description="How we handle your data">
              <ChevronRight size={18} color={COLORS.sandMid} />
            </SettingRow>
          </Button>
        </Card>

        {/* About */}
        <YStack ai="center" mt="$2" gap="$2">
          <SizableText size="$2" color={COLORS.textMid} fow="600">Articulink v1.0.4 PRO</SizableText>
          <Paragraph size="$1" color={COLORS.textMid} opacity={0.5}>Created with ❤️ for Articulation Support</Paragraph>
        </YStack>

        <Button
          mt="$8"
          bg="rgba(220,38,38,0.08)"
          h={56}
          br={16}
          bw={1}
          bc="rgba(220,38,38,0.2)"
          onPress={() => Alert.alert("Logout", "Are you sure?", [{ text: "Cancel" }, { text: "Logout", style: "destructive" }])}
          icon={<LogOut size={18} color="#DC2626" />}
          pressStyle={{ scale: 0.98, bg: "rgba(220,38,38,0.15)" }}
        >
          <SizableText color="#DC2626" fow="800" size="$4">Logout from Account</SizableText>
        </Button>
      </ScrollView>
    </YStack>
  );
};

export default SettingsScreen;