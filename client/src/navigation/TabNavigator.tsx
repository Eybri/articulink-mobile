import React from "react";
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
import { TextStyle } from "react-native";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Shared screen options
const screenOptions = {
  headerStyle: {
    backgroundColor: "#1F2937",
    borderBottomColor: "#10B98150",
    borderBottomWidth: 1,
    elevation: 8,
    shadowColor: "#10B981",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerTitleStyle: {
    color: "#10B981",
    fontSize: 18,
    fontWeight: "bold" as const,
  },
  headerTintColor: "#10B981",
};

// Home Stack (Home + Chatbot)
const HomeStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="HomeMain"
      component={HomeScreen}
      options={({ navigation }) => ({
        title: "Articulink",
        headerRight: () => (
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={24}
            color="#10B981"
            style={{ marginRight: 16 }}
            onPress={() => navigation.navigate("Chatbot")}
          />
        ),
      })}
    />
    <Stack.Screen
      name="Chatbot"
      component={ChatbotScreen}
      options={{ title: "Articulink ChatBot" }}
    />
  </Stack.Navigator>
);

// Profile Stack (Profile + EditProfile)
const ProfileStack = () => (
  <Stack.Navigator screenOptions={screenOptions}>
    <Stack.Screen
      name="ProfileMain"
      component={ProfileScreen}
      options={{ title: "Your Profile" }}
    />
    <Stack.Screen
      name="EditProfile"
      component={EditProfileScreen}
      options={{ title: "Edit Profile" }}
    />
  </Stack.Navigator>
);

// Tab icons mapping
const tabIcons: Record<string, { focused: keyof typeof Ionicons.glyphMap; outline: keyof typeof Ionicons.glyphMap }> = {
  Home: { focused: "home", outline: "home-outline" },
  History: { focused: "time", outline: "time-outline" },
  Map: { focused: "map", outline: "map-outline" },
  Profile: { focused: "person", outline: "person-outline" },
  Settings: { focused: "settings", outline: "settings-outline" },
};

// Tab Navigator
const TabNavigator = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ focused, color, size }: { focused: boolean; color: string; size: number }) => {
        const icons = tabIcons[route.name];
        const iconName = focused ? icons.focused : icons.outline;
        return <Ionicons name={iconName as any} size={size} color={color} />;
      },
      tabBarActiveTintColor: "#10B981",
      tabBarInactiveTintColor: "#9CA3AF",
      tabBarStyle: {
        backgroundColor: "#1F2937",
        borderTopColor: "#10B98150",
        borderTopWidth: 1,
        paddingVertical: 8,
        height: 70,
        shadowColor: "#10B981",
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 10,
      },
      tabBarLabelStyle: {
        fontSize: 12,
        fontWeight: "600" as const,
        marginBottom: 4,
      },
      tabBarItemStyle: {
        paddingVertical: 4,
      },
      ...screenOptions,
    } as any)}
  >
    <Tab.Screen
      name="Home"
      component={HomeStack}
      options={{ headerShown: false, tabBarLabel: "Home" }}
    />
    <Tab.Screen
      name="History"
      component={HistoryScreen}
      options={{ title: "Translation History", tabBarLabel: "History" }}
    />
    <Tab.Screen
      name="Map"
      component={MapScreen}
      options={{ title: "Nearby Centers", tabBarLabel: "Map" }}
    />
    <Tab.Screen
      name="Profile"
      component={ProfileStack}
      options={{ headerShown: false, tabBarLabel: "Profile" }}
    />
    <Tab.Screen
      name="Settings"
      component={SettingsScreen}
      options={{ title: "Settings", tabBarLabel: "Settings" }}
    />
  </Tab.Navigator>
);

export default TabNavigator;