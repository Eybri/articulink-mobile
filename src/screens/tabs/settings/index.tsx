import React from "react";
import { SettingsView } from "./SettingsView";
import { useSettingsViewModel } from "./useSettingsViewModel";

/**
 * Settings Screen Entry Point.
 */
const SettingsScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useSettingsViewModel(navigation);
    
    return <SettingsView vm={vm} navigation={navigation} />;
};

export default SettingsScreen;
