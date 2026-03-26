import React, { useRef, useEffect } from "react";
import { Platform, Animated, Image as RNImage } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { YStack, XStack, SizableText, Button, Circle } from "tamagui";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/tabs/HistoryScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import SettingsScreen from "../screens/tabs/SettingsScreen";
import MapScreen from "../screens/tabs/MapScreen";
import EditProfileScreen from '../screens/Extras/EditProfileScreen';
import ChatbotScreen from '../screens/Extras/ChatbotScreen';
import {
  Home,
  History,
  MapPin,
  User,
  Settings,
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
    borderBottomColor: 'rgba(221, 214, 200, 0.5)',
    borderBottomWidth: 1,
    elevation: 0,
    shadowOpacity: 0,
  },
  headerTitleStyle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: "900" as const,
    letterSpacing: -0.6,
  },
  headerTintColor: COLORS.royalBlue,
  headerTitleAlign: "center" as const,
  headerBackTitleVisible: false,
};

// ─── Home Stack ──────────────────────────────────────────────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={headerOptions}>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={({ navigation }) => ({
        headerLeft: () => (
          <RNImage
            source={require("../../assets/images/logo2-nobg.png")}
            style={{ width: 50, height: 50, marginLeft: 16 }}
            resizeMode="contain"
          />
        ),
        headerTitle: "",
        headerRight: () => (
          <Button
            chromeless
            icon={<MessageCircle size={23} color={COLORS.royalBlue} />}
            onPress={() => navigation.navigate("Chatbot")}
            mr="$2"
            pressStyle={{ scale: 0.95, opacity: 0.9 }}
          />
        ),
      })}
    />
    <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: "AI Assistant" }} />
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
];

// ─── Animated Tab Item ───────────────────────────────────────────
const TabItem: React.FC<{
  isFocused: boolean;
  config: { name: string; label: string; icon: any };
  onPress: () => void;
}> = ({ isFocused, config, onPress }) => {
  const liftAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;
  const glowAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: isFocused ? 1 : 0,
        tension: 50,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  const translateY = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -3],
  });
  const iconScale = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.12],
  });
  const pillOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });
  const labelOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 1],
  });

  return (
    <YStack f={1} ai="center" jc="center" py="$1" onPress={onPress}>
      {/* Icon with subtle pop */}
      <Animated.View style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ translateY }, { scale: iconScale }],
      }}>
        {React.createElement(config.icon, {
          size: isFocused ? 28 : 24,
          color: isFocused ? COLORS.royalBlue : COLORS.textMid,
          strokeWidth: isFocused ? 2.4 : 1.8,
        })}
      </Animated.View>

      {/* Label - tight to icon */}
      <Animated.View style={{ opacity: labelOpacity, marginTop: 3 }}>
        <SizableText
          size="$1"
          fow={isFocused ? "800" : "500"}
          ls={isFocused ? 0.3 : 0}
          color={isFocused ? COLORS.royalBlue : COLORS.textMid}
        >
          {config.label}
        </SizableText>
      </Animated.View>

      {/* Active indicator bar */}
      <Animated.View style={{
        width: 14,
        height: 2.5,
        borderRadius: 1.25,
        backgroundColor: COLORS.royalBlue,
        marginTop: 3,
        opacity: pillOpacity,
        transform: [{ scaleX: liftAnim }],
      }} />
    </YStack>
  );
};

// ─── Premium Custom Tab Bar ──────────────────────────────────────
const CustomTabBar = ({ state, navigation }: any) => (
  <YStack
    bg="rgba(255,255,255,0.96)"
    borderTopWidth={1}
    borderTopColor="rgba(221,214,200,0.45)"
    pb={Platform.OS === "ios" ? 24 : 8}
    pt={6}
    elevation={12}
    shadowColor={COLORS.deepNavy}
    shadowOffset={{ width: 0, height: -4 }}
    shadowOpacity={0.08}
    shadowRadius={16}
  >
    <XStack jc="space-around" ai="center">
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG.find(t => t.name === route.name)!;
        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TabItem
            key={route.key}
            isFocused={isFocused}
            config={config}
            onPress={onPress}
          />
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
  </Tab.Navigator>
);

export default TabNavigator;
