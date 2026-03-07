import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/tabs/HistoryScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import SettingsScreen from "../screens/tabs/SettingsScreen";
import MapScreen from "../screens/tabs/MapScreen";
import EditProfileScreen from '../screens/Extras/EditProfileScreen';
import ChatbotScreen from '../screens/Extras/ChatbotScreen';
import { Ionicons } from "@expo/vector-icons";

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
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={22}
            color={COLORS.royalBlue}
            style={{ marginRight: 16 }}
            onPress={() => navigation.navigate("Chatbot")}
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
const TAB_CONFIG: { name: string; label: string; iconFocused: string; iconOutline: string }[] = [
  { name: "Home", label: "Home", iconFocused: "home", iconOutline: "home-outline" },
  { name: "History", label: "History", iconFocused: "time", iconOutline: "time-outline" },
  { name: "Map", label: "Map", iconFocused: "map", iconOutline: "map-outline" },
  { name: "Profile", label: "Profile", iconFocused: "person", iconOutline: "person-outline" },
  { name: "Settings", label: "Settings", iconFocused: "settings", iconOutline: "settings-outline" },
];

// ─── Custom Tab Bar ──────────────────────────────────────────────
const CustomTabBar = ({ state, descriptors, navigation }: any) => (
  <View style={tabBarStyles.container}>
    <View style={tabBarStyles.inner}>
      {state.routes.map((route: any, index: number) => {
        const isFocused = state.index === index;
        const config = TAB_CONFIG.find(t => t.name === route.name)!;
        const iconName = isFocused ? config.iconFocused : config.iconOutline;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            activeOpacity={0.7}
            style={tabBarStyles.tab}
          >
            {/* Active pill */}
            {isFocused && <View style={tabBarStyles.activePill} />}

            <View style={[tabBarStyles.iconWrap, isFocused && tabBarStyles.iconWrapActive]}>
              <Ionicons
                name={iconName as any}
                size={isFocused ? 22 : 20}
                color={isFocused ? COLORS.royalBlue : COLORS.textMid}
              />
            </View>

            <Text style={[
              tabBarStyles.label,
              { color: isFocused ? COLORS.royalBlue : COLORS.textMid },
              isFocused && tabBarStyles.labelActive,
            ]}>
              {config.label}
            </Text>

            {/* Active dot indicator */}
            {isFocused && <View style={tabBarStyles.activeDot} />}
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

// ─── Tab Bar Styles ──────────────────────────────────────────────
const tabBarStyles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.sandMid,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    paddingTop: 6,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.deepNavy,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  inner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 4,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: 0,
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: `${COLORS.royalBlue}0A`,
    borderWidth: 1,
    borderColor: `${COLORS.royalBlue}12`,
  },
  iconWrap: {
    width: 32,
    height: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  iconWrapActive: {
    transform: [{ translateY: -1 }],
  },
  label: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 2,
    letterSpacing: 0.2,
  },
  labelActive: {
    fontWeight: "800",
    fontSize: 10.5,
  },
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: COLORS.royalBlue,
    marginTop: 3,
  },
});

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