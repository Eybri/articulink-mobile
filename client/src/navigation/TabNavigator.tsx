import React, { useRef, useEffect } from "react";
import { Platform, Animated, Image as RNImage } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator as createStackNavigator } from "@react-navigation/native-stack";
import { YStack, XStack, SizableText, Button, Circle } from "tamagui";
import HomeScreen from "../screens/tabs/home";
import HistoryScreen from "../screens/tabs/history";
import ProfileScreen from "../screens/tabs/profile";
import SettingsScreen from "../screens/tabs/settings";
import MapScreen from "../screens/tabs/map";
import EditProfileScreen from '../screens/Extras/edit-profile';
import ChatbotScreen from '../screens/Extras/chatbot';
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
  },
  headerShadowVisible: false, // native-stack equivalent of shadowOpacity: 0
  headerTitleStyle: {
    color: COLORS.textDark,
    fontSize: 20,
    fontWeight: "900" as const,
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
            style={{ 
              width: 50, 
              height: 50, 
              marginLeft: 16,
              marginTop: Platform.OS === "android" ? 12 : 0 
            }}
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
            mt={Platform.OS === "android" ? 12 : 0}
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
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
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

  useEffect(() => {
    Animated.spring(liftAnim, {
      toValue: isFocused ? 1 : 0,
      tension: 60,
      friction: 10,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const iconScale = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.1],
  });

  const highlightScale = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.6, 1],
  });

  const highlightOpacity = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  return (
    <YStack f={1} ai="center" jc="center" h={60} onPress={onPress}>
      {/* Background Highlight Pill */}
      <Animated.View style={{
        position: 'absolute',
        width: 50,
        height: 42,
        borderRadius: 21,
        backgroundColor: 'rgba(26, 68, 128, 0.08)', // Faded COLORS.royalBlue
        opacity: highlightOpacity,
        transform: [{ scale: highlightScale }],
      }} />

      <Animated.View style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: iconScale }],
      }}>
        {React.createElement(config.icon, {
          size: 24,
          color: isFocused ? COLORS.royalBlue : COLORS.textMid,
          strokeWidth: isFocused ? 2.5 : 1.8,
        })}
      </Animated.View>
    </YStack>
  );
};

// ─── Premium Custom Tab Bar ──────────────────────────────────────
const CustomTabBar = ({ state, navigation }: any) => {
  return (
    <YStack
      position="absolute"
      bottom={Platform.OS === 'ios' ? 32 : 24}
      left={20}
      right={20}
      bg="rgba(250, 248, 244, 0.92)" // rgba version of COLORS.cream
      borderRadius={100}
      borderWidth={1.5}
      borderColor="rgba(221, 214, 200, 0.6)" // faded COLORS.sandMid
      elevation={12}
      shadowColor={COLORS.deepNavy}
      shadowOffset={{ width: 0, height: 6 }}
      shadowOpacity={0.12}
      shadowRadius={12}
      px="$2"
      h={72}
      jc="center"
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
};

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
