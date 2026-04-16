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
const headerOptions = {
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
              width: 38, // Slightly smaller/cleaner
              height: 38, 
              marginLeft: 8,
              marginTop: Platform.OS === "android" ? 12 : 0 
            }}
            resizeMode="contain"
          />
        ),
        headerTitle: "ArticuLink", // Explicit title for Large Title effect
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
  <Stack.Navigator screenOptions={headerOptions}>
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
      tension: 100, // Faster/snappier
      friction: 12,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const iconScale = liftAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.15],
  });

  return (
    <YStack f={1} ai="center" jc="center" h={64} onPress={onPress}>
      <Animated.View style={{
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ scale: iconScale }],
      }}>
        {React.createElement(config.icon, {
          size: 22,
          color: isFocused ? COLORS.royalBlue : COLORS.textMid,
          strokeWidth: isFocused ? 2.5 : 2,
        })}
      </Animated.View>

      <SizableText
        mt="$1"
        size="$1"
        style={{ fontSize: 11, fontWeight: isFocused ? "700" : "500" }}
        color={isFocused ? COLORS.royalBlue : COLORS.textMid}
        opacity={isFocused ? 1 : 0.7}
      >
        {config.label}
      </SizableText>
    </YStack>
  );
};

// ─── Premium Custom Tab Bar (Glassmorphic) ───────────────────────
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
        bottom: isIOS ? 34 : 16,
        left: 20,
        right: 20,
        zIndex: 1000,
        transform: [{ translateY }],
      }}
    >
      {isIOS ? (
        <BlurView
          intensity={85}
          tint="extraLight"
          style={styles.tabBarContainer}
        >
          <XStack jc="space-around" ai="center" px="$2" h={74}>
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
        </BlurView>
      ) : (
        <YStack
          style={[styles.tabBarContainer, { backgroundColor: 'rgba(250, 248, 244, 0.98)' }]}
        >
          <XStack jc="space-around" ai="center" px="$2" h={74}>
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
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    borderRadius: 30,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(221, 214, 200, 0.5)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: {
        elevation: 8,
      },
    }),
  },
});


// ─── Tab Navigator ───────────────────────────────────────────────
const TabNavigator = () => (
  <Tab.Navigator
    tabBar={(props) => <CustomTabBar {...props} />}
    screenOptions={{ ...headerOptions } as any}
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


