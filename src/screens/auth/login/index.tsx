import React from "react";
import { LoginView } from "./LoginView";
import { useLoginViewModel } from "./useLoginViewModel";

/**
 * Login Screen Entry Point.
 * Connects the UI (View) with the State/Logic (ViewModel).
 */
const LoginScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useLoginViewModel(navigation);
    
    return <LoginView vm={vm} navigation={navigation} />;
};

export default LoginScreen;
