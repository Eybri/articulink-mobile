import React from "react";
import { TamaguiProvider } from "tamagui";
import { useFonts } from "expo-font";
import { tamaguiConfig } from "./tamagui.config";
import AuthProvider from "./src/context/AuthContext";
import AppNavigator from "./src/navigation/AppNavigator";

export default function App() {
  const [loaded] = useFonts({
    Inter: require("@tamagui/font-inter/otf/Inter-Medium.otf"),
    InterBold: require("@tamagui/font-inter/otf/Inter-Bold.otf"),
  });

  if (!loaded) {
    return null;
  }

  return (
    <TamaguiProvider config={tamaguiConfig} defaultTheme="light">
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </TamaguiProvider>
  );
}
