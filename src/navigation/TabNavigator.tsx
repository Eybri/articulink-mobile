import React, { useRef, useEffect } from "react";
import { Platform, Animated, Image as RNImage, StyleSheet, View } from "react-native";
import Svg, { Path } from "react-native-svg";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator as createStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { YStack, XStack, SizableText, Button } from "tamagui";
import HomeScreen from "../screens/tabs/home";
import HistoryScreen from "../screens/tabs/history";
import ProfileScreen from "../screens/tabs/profile";
import MapScreen from "../screens/tabs/map";
import SettingsScreen from "../screens/tabs/settings";
import EditProfileScreen from '../screens/Extras/edit-profile';
import ChatbotScreen from '../screens/Extras/chatbot';
import ChangePasswordScreen from '../screens/Extras/change-password';
import SecurityPrivacyScreen from '../screens/Extras/security';
import TtsSettingsScreen from '../screens/Extras/tts-settings';
import {
  Home,
  History,
  MapPin,
  User,
  MessageCircle,
  Mic,
  Settings,
} from "@tamagui/lucide-icons";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ─── Brand Palette (Refined for iOS contrast) ─────────────────────
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
const getHeaderOptions = () => ({
  headerStyle: {
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : COLORS.cream,
  },
  headerTransparent: Platform.OS === 'ios',
  headerBlurEffect: Platform.OS === 'ios' ? 'systemChromeMaterialLight' as const : undefined,
  headerShadowVisible: true, 
  headerTitleStyle: {
    color: COLORS.textDark,
    fontSize: Platform.OS === 'ios' ? 17 : 20,
    fontWeight: "700" as const,
    letterSpacing: Platform.OS === 'ios' ? -0.4 : 0,
  },
  headerLargeTitle: Platform.OS === 'ios',
  headerLargeTitleStyle: {
    color: COLORS.textDark,
    fontWeight: "800" as const,
    fontSize: 34,
    letterSpacing: -1,
  },
  headerTintColor: COLORS.royalBlue,
  headerTitleAlign: Platform.OS === 'ios' ? "center" as const : "left" as const,
  headerBackTitleVisible: false,
});

// ─── Home Stack ──────────────────────────────────────────────────
const HomeStack = () => (
  <Stack.Navigator screenOptions={getHeaderOptions()}>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={({ navigation }) => ({
        headerLeft: () => (
          <RNImage
            source={require("../../assets/images/icon-blue.png")}
            style={{ 
              width: 32,
              height: 32, 
              marginLeft: Platform.OS === "ios" ? 16 : 8,
              marginTop: Platform.OS === "android" ? 2 : 0,
            }}
            resizeMode="contain"
          />
        ),
        headerTitle: "ArticuLink",
        headerTitleAlign: "center" as const,
        headerLargeTitle: false, // Centered titles look better without Large Title mode
        headerTitleStyle: {
          color: COLORS.textDark,
          fontSize: 18,
          fontWeight: "800" as const,
          letterSpacing: -0.5,
        },
        headerRight: () => (
          <Button
            chromeless
            icon={<MessageCircle size={22} color={COLORS.royalBlue} />}
            onPress={() => navigation.navigate("Chatbot")}
            mr="$2"
            mt={Platform.OS === "android" ? 2 : 0}
            pressStyle={{ scale: 0.9, opacity: 0.7 }}
          />
        ),
      })}
    />
    <Stack.Screen 
      name="Chatbot" 
      component={ChatbotScreen} 
      options={{ 
        headerTitle: () => (
          <XStack ai="center" gap="$2">
            <RNImage
              source={require("../../assets/images/ariya.png")}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
            <SizableText color={COLORS.textDark} fontSize={18} fontWeight="800" letterSpacing={-0.5}>
              Ariya
            </SizableText>
          </XStack>
        ),
        headerLargeTitle: false, // Cleaner for sub-screens
      }} 
    />
  </Stack.Navigator>
);

// ─── Settings Stack ───────────────────────────────────────────────
const SettingsStack = () => (
  <Stack.Navigator screenOptions={getHeaderOptions()}>
    <Stack.Screen name="SettingsMain" component={SettingsScreen} options={{ headerShown: true, title: "Settings" }} />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen} 
      options={{ 
        title: "Edit Profile",
        headerLargeTitle: false,
      }} 
    />
    <Stack.Screen 
      name="ChangePassword" 
      component={ChangePasswordScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="SecurityPrivacy" 
      component={SecurityPrivacyScreen} 
      options={{ headerShown: false }} 
    />
    <Stack.Screen 
      name="TtsSettings" 
      component={TtsSettingsScreen} 
      options={{ headerShown: false }} 
    />
  </Stack.Navigator>
);

// ─── Tab Config ──────────────────────────────────────────────────
const TAB_CONFIG: { name: string; label: string; icon: any }[] = [
  { name: "History", label: "History", icon: History },
  { name: "Map", label: "Map", icon: MapPin },
  { name: "Home", label: "Hub", icon: Mic },
  { name: "Profile", label: "Profile", icon: User },
  { name: "Settings", label: "Settings", icon: Settings },
];

const TabItem: React.FC<{
  isFocused: boolean;
  config: { name: string; label: string; icon: any };
  onPress: () => void;
}> = ({ isFocused, config, onPress }) => {
  const isHome = config.name === "Home";

  if (isHome) {
    return (
      <YStack 
        flex={1}
        pos="relative" 
        top={-18} 
        jc="center" 
        ai="center"
      >
        <Button
          w={56}
          h={56}
          br={28}
          bg={COLORS.white}
          onPress={onPress}
          elevation={10}
          shadowColor="#000"
          shadowOffset={{ width: 0, height: 6 }}
          shadowOpacity={0.25}
          shadowRadius={10}
          pressStyle={{ scale: 0.9, bg: COLORS.sandLight }}
          icon={React.createElement(config.icon, {
            size: 26,
            color: COLORS.royalBlue,
            strokeWidth: 2.5,
          })}
        />
      </YStack>
    );
  }

  return (
    <YStack 
      flex={1}
      onPress={onPress} 
      jc="center" 
      ai="center"
      py={6}
      br={12}
      bg="transparent"
      pressStyle={{ opacity: 0.7 }}
      gap={4}
    >
      {React.createElement(config.icon, {
        size: 18,
        color: isFocused ? COLORS.white : 'rgba(255, 255, 255, 0.45)',
        strokeWidth: isFocused ? 2.5 : 2,
      })}
      <SizableText
        fontSize={10}
        color={isFocused ? COLORS.white : 'rgba(255, 255, 255, 0.45)'}
        fontWeight={isFocused ? "600" : "500"}
      >
        {config.label}
      </SizableText>
    </YStack>
  );
};

// ─── Premium Custom Tab Bar (Reference inspired Pill Style) ───────
const CustomTabBar = ({ state, descriptors, navigation }: any) => {
  const focusedOptions = descriptors[state.routes[state.index].key].options;
  const currentRouteName = state.routes[state.index].name;
  const isMap = currentRouteName === "Map";

  const translateY = useRef(new Animated.Value(isMap ? 120 : 0)).current;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: isMap ? 120 : 0,
      useNativeDriver: true,
      tension: 30,
      friction: 10,
    }).start();
  }, [isMap]);

  if (focusedOptions.tabBarStyle?.display === 'none') {
    return null;
  }

  const isIOS = Platform.OS === 'ios';

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: isIOS ? 34 : 20,
        left: 20,
        right: 20,
        zIndex: 1000,
        transform: [{ translateY }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 15,
      }}
    >
      {/* Custom Curved Background */}
      <View style={{ position: 'absolute', top: -26, left: 0, right: 0, bottom: 0, flexDirection: 'row' }}>
         <View style={{ flex: 1, backgroundColor: COLORS.deepNavy, marginTop: 26, borderTopLeftRadius: 30, borderBottomLeftRadius: 30, marginRight: -1 }} />
         <Svg width="110" height="86" viewBox="0 0 110 86">
            <Path d="M 0 26 L 15.76 26 A 12 12 0 0 0 25.99 20.26 A 34 34 0 0 1 84.01 20.26 A 12 12 0 0 0 94.24 26 L 110 26 L 110 86 L 0 86 Z" fill={COLORS.deepNavy} />
         </Svg>
         <View style={{ flex: 1, backgroundColor: COLORS.deepNavy, marginTop: 26, borderTopRightRadius: 30, borderBottomRightRadius: 30, marginLeft: -1 }} />
      </View>

      <YStack>
        <XStack jc="space-between" ai="center" px="$4" h={60}>
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
    </Animated.View>
  );
};

const styles = StyleSheet.create({});


// ─── Tab Navigator ───────────────────────────────────────────────
const TabNavigator = () => (
  <Tab.Navigator
    initialRouteName="Home"
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ ...getHeaderOptions() } as any}
  >
    <Tab.Screen 
      name="History" 
      component={HistoryScreen} 
      options={{ 
        title: "History", // Shortened for Large Title
      }} 
    />
    <Tab.Screen 
      name="Map" 
      component={MapScreen} 
      options={{ 
        title: "Nearby", 
      }} 
    />
    <Tab.Screen 
      name="Home" 
      component={HomeStack} 
      options={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "Chatbot") {
          return { headerShown: false, tabBarStyle: { display: "none" } };
        }
        return { headerShown: false };
      }} 
    />
    <Tab.Screen 
      name="Profile" 
      component={ProfileScreen} 
      options={{ headerShown: false }} 
    />
    <Tab.Screen 
      name="Settings" 
      component={SettingsStack} 
      options={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "EditProfile" || routeName === "ChangePassword" || routeName === "SecurityPrivacy" || routeName === "TtsSettings") {
          return { headerShown: false, tabBarStyle: { display: "none" } };
        }
        return { headerShown: false };
      }} 
    />
  </Tab.Navigator>
);

export default TabNavigator;


