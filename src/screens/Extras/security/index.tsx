import React from "react";
import { SecurityView } from "./SecurityView";
import { useSecurityViewModel } from "./useSecurityViewModel";

/**
 * Security & Privacy Screen Entry Point.
 */
const SecurityPrivacyScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useSecurityViewModel(navigation);
    
    return <SecurityView vm={vm} />;
};

export default SecurityPrivacyScreen;
