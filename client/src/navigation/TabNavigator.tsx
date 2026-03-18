import React from "react";
import { Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { YStack, XStack, SizableText, Button, Circle, Theme } from "tamagui";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/tabs/HistoryScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import SettingsScreen from "../screens/tabs/SettingsScreen";
import MapScreen from "../screens/tabs/MapScreen";
import EditProfileScreen from '../screens/Extras/EditProfileScreen';
import ChatbotScreen from '../screens/Extras/ChatbotScreen';
import TamaguiDemoScreen from "../screens/TamaguiDemoScreen";
import {
  Home,
  History,
  MapPin,
  User,
  Settings,
  Layers,
  MessageCircle,
} from "@tamagui/lucide-icons";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

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
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

// ─── Header Options ──────────────────────────────────────────────
const headerOptions = {
  headerStyle: {
    backgroundColor: COLORS.cream,
    borderBottomColor: COLORS.sandMid,
    borderBottomWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleStyle: {
    color: COLORS.textDark,
    fontSize: 18,
    fontWeight: "800" as const,
    letterSpacing: -0.3,
  },
  headerTintColor: COLORS.deepNavy,
};

// ─── Home Stack ──────────────────────────────────────────────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={({ navigation }) => ({
        title: "Articulink",
        headerRight: () => (
          <Button
            chromeless
            icon={<MessageCircle size={22} color={COLORS.royalBlue} />}
            onPress={() => navigation.navigate("Chatbot")}
            mr="$3"
            pressStyle={{ scale: 0.95 }}
          />
        ),
      })}
    />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: "Articulink ChatBot" }} />
  </Stack.Navigator>
);

// ─── Profile Stack ───────────────────────────────────────────────
const ProfileStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ title: "Your Profile" }} />
    <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: "Edit Profile" }} />
  </Stack.Navigator>
);

// ─── Tab Config ──────────────────────────────────────────────────
const TAB_CONFIG: { name: string; label: string; icon: any }[] = [
  { name: "Home", label: "Home", icon: Home },
  { name: "History", label: "History", icon: History },
  { name: "Map", label: "Map", icon: MapPin },
  { name: "Profile", label: "Profile", icon: User },
  { name: "Settings", label: "Settings", icon: Settings },
  { name: "Demo", label: "Tamagui", icon: Layers },
];

// ─── Custom Tab Bar ──────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }: any) => (
  <YStack
    bg="white"
    bt={1}
    btc={COLORS.sandMid}
    pb={Platform.OS === "ios" ? 24 : 8}
    pt={6}
    elevation={8}
    shadowColor={COLORS.deepNavy}
    shadowOffset={{ width: 0, height: -4 }}
    shadowOpacity={0.06}
    shadowRadius={12}
  >
    <XStack jc="space-around" ai="center">
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG.find(t => t.name === route.name)!;
        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <YStack
            key={route.key}
            f={1}
            ai="center"
            jc="center"
            py="$1"
            pos="relative"
            onPress={onPress}
          >
            {/* Active pill indicator */}
            {isFocused && (
                <YStack
                    pos="absolute"
                    t={0}
                    w={48}
                    h={48}
                    br={14}
                    bg={`${COLORS.royalBlue}0A`}
                    bw={1}
                    bc={`${COLORS.royalBlue}12`}
                />
            )}

            <YStack
                w={32}
                h={28}
                jc="center"
                ai="center"
                {...(isFocused && { y: -1 })}
            >
              {React.createElement(config.icon, {
                size: isFocused ? 22 : 20,
                color: isFocused ? COLORS.royalBlue : COLORS.textMid,
              })}
            </YStack>

            <SizableText
                size="$1"
                fow={isFocused ? "800" : "600"}
                mt={2}
                ls={0.2}
                color={isFocused ? COLORS.royalBlue : COLORS.textMid}
            >
              {config.label}
            </SizableText>

            {/* Active dot indicator */}
            {isFocused && <Circle size={4} bg={COLORS.royalBlue} mt={3} />}
          </YStack>
        );
      })}
    </XStack>
  </YStack>
);

// ─── Tab Navigator ───────────────────────────────────────────────
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ ...headerOptions } as any}
  >
    <Tab.Screen name="Home" component={HomeStack} options={{ headerShown: false }} />
    <Tab.Screen name="History" component={HistoryScreen} options={{ title: "Translation History" }} />
    <Tab.Screen name="Map" component={MapScreen} options={{ title: "Nearby Centers" }} />
    <Tab.Screen name="Profile" component={ProfileStack} options={{ headerShown: false }} />
    <Tab.Screen name="Settings" component={SettingsScreen} options={{ title: "Settings" }} />
    <Tab.Screen name="Demo" component={TamaguiDemoScreen} options={{ title: "Tamagui Demo" }} />
  </Tab.Navigator>
);

export default TabNavigator;