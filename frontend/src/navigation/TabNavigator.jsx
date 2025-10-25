import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/tabs/HistoryScreen";
import ProfileScreen from "../screens/tabs/ProfileScreen";
import SettingsScreen from "../screens/tabs/SettingsScreen";
import MapScreen from "../screens/tabs/MapScreen";
import EditProfileScreen from '../screens/Extras/EditProfileScreen';
import Ionicons from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const RegisterStack = createStackNavigator();

const RegisterStackNavigator = () => {
    return (
        <RegisterStack.Navigator
            screenOptions={{
                headerStyle: {
                    backgroundColor: "#1F2937",
                    borderBottomColor: "#10B98150",
                    borderBottomWidth: 1,
                    elevation: 8,
                    shadowColor: "#10B981",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                headerTitleStyle: {
                    color: "#10B981",
                    fontSize: 18,
                    fontWeight: "bold",
                },
                headerTintColor: "#10B981",
            }}
        >
            <RegisterStack.Screen 
                name="ProfileMain" 
                component={ProfileScreen}
                options={{ title: "Your Profile" }}
            />
            <RegisterStack.Screen 
                name="EditProfile" 
                component={EditProfileScreen}
                options={{ title: "Edit Profile" }}
            />
        </RegisterStack.Navigator>
    );
};

const TabNavigator = () => {
    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused, color, size }) => {
                    let iconName;
                    
                    if (route.name === "Home") {
                        iconName = focused ? "home" : "home-outline";
                    } else if (route.name === "History") {
                        iconName = focused ? "time" : "time-outline";
                    } else if (route.name === "Map") {
                        iconName = focused ? "map" : "map-outline";
                    } else if (route.name === "Profile") {
                        iconName = focused ? "person" : "person-outline";
                    } else if (route.name === "Settings") {
                        iconName = focused ? "settings" : "settings-outline";
                    }
                    
                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                // Enhanced styling with emerald-teal theme
                tabBarActiveTintColor: "#10B981", // Emerald-500
                tabBarInactiveTintColor: "#9CA3AF", // Gray-400
                tabBarStyle: {
                    backgroundColor: "#1F2937", // Gray-800
                    borderTopColor: "#10B98150", // Emerald-500 with opacity
                    borderTopWidth: 1,
                    paddingVertical: 8,
                    height: 70,
                    shadowColor: "#10B981",
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                    elevation: 10,
                },
                tabBarLabelStyle: {
                    fontSize: 12,
                    fontWeight: "600",
                    marginBottom: 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
                headerStyle: {
                    backgroundColor: "#1F2937", // Gray-800
                    borderBottomColor: "#10B98150", // Emerald-500 with opacity
                    borderBottomWidth: 1,
                    elevation: 8,
                    shadowColor: "#10B981",
                    shadowOffset: {
                        width: 0,
                        height: 2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 8,
                },
                headerTitleStyle: {
                    color: "#10B981", // Emerald-500
                    fontSize: 18,
                    fontWeight: "bold",
                },
                headerTintColor: "#10B981", // Emerald-500
            })}
        >
            <Tab.Screen 
                name="Home" 
                component={HomeScreen}
                options={{
                    title: "Articulink",
                    tabBarLabel: "Home",
                }}
            />
            <Tab.Screen 
                name="History" 
                component={HistoryScreen}
                options={{
                    title: "Translation History",
                    tabBarLabel: "History",
                }}
            />
            <Tab.Screen 
                name="Map" 
                component={MapScreen}
                options={{
                    title: "Nearby Centers",
                    tabBarLabel: "Map",
                }}
            />
            <Tab.Screen 
                name="Profile" 
                component={RegisterStackNavigator}
                options={{
                    headerShown: false, // Hide header since RegisterStack handles it
                    tabBarLabel: "Profile",
                }}
            />
            <Tab.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{
                    title: "Settings",
                    tabBarLabel: "Settings",
                }}
            />
        </Tab.Navigator>
    );
};

export default TabNavigator;