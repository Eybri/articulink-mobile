import React from "react";
import { ForgotPasswordView } from "./ForgotPasswordView";
import { useForgotPasswordViewModel } from "./useForgotPasswordViewModel";

/**
 * Forgot Password Screen Entry Point.
 */
const ForgotPasswordScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useForgotPasswordViewModel(navigation);
    
    return <ForgotPasswordView vm={vm} navigation={navigation} />;
};

export default ForgotPasswordScreen;
