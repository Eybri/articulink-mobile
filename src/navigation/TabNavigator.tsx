import React, { useRef, useEffect } from "react";
import { Platform, Animated, Image as RNImage, StyleSheet } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { getFocusedRouteNameFromRoute } from "@react-navigation/native";
import { createNativeStackNavigator as createStackNavigator } from "@react-navigation/native-stack";
import { BlurView } from "expo-blur";
import { YStack, XStack, SizableText, Button } from "tamagui";
import HomeScreen from "../screens/tabs/home";
import HistoryScreen from "../screens/tabs/history";
import ProfileScreen from "../screens/tabs/profile";
import MapScreen from "../screens/tabs/map";
import EditProfileScreen from '../screens/Extras/edit-profile';
import ChatbotScreen from '../screens/Extras/chatbot';
import {
  Home,
  History,
  MapPin,
  User,
  MessageCircle,
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
            source={require("../../assets/images/logo2-nobg.png")}
            style={{ 
              width: 38, // Slightly smaller/cleaner
              height: 38, 
              marginLeft: 8,
              marginTop: Platform.OS === "android" ? 12 : 0 
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
            mt={Platform.OS === "android" ? 12 : 0}
            pressStyle={{ scale: 0.9, opacity: 0.7 }}
          />
        ),
      })}
    />
    <Stack.Screen 
      name="Chatbot" 
      component={ChatbotScreen} 
      options={{ 
        title: "AI Assistant",
        headerLargeTitle: false, // Cleaner for sub-screens
      }} 
    />
  </Stack.Navigator>
);

// ─── Profile Stack ───────────────────────────────────────────────
const ProfileStack = () => (
  <Stack.Navigator screenOptions={getHeaderOptions()}>
    <Stack.Screen name="ProfileMain" component={ProfileScreen} options={{ headerShown: false }} />
    <Stack.Screen 
      name="EditProfile" 
      component={EditProfileScreen} 
      options={{ 
        title: "Edit Profile",
        headerLargeTitle: false,
      }} 
    />
  </Stack.Navigator>
);

// ─── Tab Config ──────────────────────────────────────────────────
const TAB_CONFIG: { name: string; label: string; icon: any }[] = [
  { name: "Home", label: "Home", icon: Home },
  { name: "History", label: "History", icon: History },
  { name: "Map", label: "Map", icon: MapPin },
  { name: "Profile", label: "Profile", icon: User },
];

// ─── Animated Tab Item (Pill Style) ─────────────────────────────
const TabItem: React.FC<{
  isFocused: boolean;
  config: { name: string; label: string; icon: any };
  onPress: () => void;
}> = ({ isFocused, config, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(isFocused ? 1 : 0.9)).current;
  const opacityAnim = useRef(new Animated.Value(isFocused ? 1 : 0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: isFocused ? 1 : 0.9,
        useNativeDriver: true,
        tension: 150,
        friction: 15,
      }),
      Animated.timing(opacityAnim, {
        toValue: isFocused ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isFocused]);

  return (
    <YStack 
      onPress={onPress} 
      ai="center" 
      jc="center" 
      px={isFocused ? "$4" : "$3"} 
      py="$2.5"
      br={100}
      bg={isFocused ? COLORS.white : 'transparent'}
      pressStyle={{ opacity: 0.8, scale: 0.98 }}
    >
      <XStack ai="center" gap="$2.5">
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {React.createElement(config.icon, {
            size: 20,
            color: isFocused ? COLORS.deepNavy : 'rgba(255, 255, 255, 0.5)',
            strokeWidth: isFocused ? 2.5 : 2,
          })}
        </Animated.View>
        
        {isFocused && (
          <Animated.View style={{ opacity: opacityAnim }}>
            <SizableText 
              color={COLORS.deepNavy} 
              fow="900" 
              size="$2" 
              ls={-0.2}
            >
              {config.label}
            </SizableText>
          </Animated.View>
        )}
      </XStack>
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
      }}
    >
      <YStack
        style={styles.tabBarContainer}
        bg={COLORS.deepNavy}
        elevation={15}
        shadowColor="#000"
        shadowOffset={{ width: 0, height: 10 }}
        shadowOpacity={0.2}
        shadowRadius={20}
      >
        <XStack jc="space-between" ai="center" px="$3.5" h={68}>
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

const styles = StyleSheet.create({
  tabBarContainer: {
    borderRadius: 100, // Fully rounded capsule
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
});


// ─── Tab Navigator ───────────────────────────────────────────────
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ ...getHeaderOptions() } as any}
  >
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
      name="Profile" 
      component={ProfileStack} 
      options={({ route }) => {
        const routeName = getFocusedRouteNameFromRoute(route);
        if (routeName === "EditProfile") {
          return { headerShown: false, tabBarStyle: { display: "none" } };
        }
        return { headerShown: false };
      }} 
    />
  </Tab.Navigator>
);

export default TabNavigator;


