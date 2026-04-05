import React from "react";
import { ResetPasswordView } from "./ResetPasswordView";
import { useResetPasswordViewModel } from "./useResetPasswordViewModel";

/**
 * Reset Password Screen Entry Point.
 */
const ResetPasswordScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { email } = route.params || {};
    const vm = useResetPasswordViewModel(navigation, email);
    
    return <ResetPasswordView vm={vm} navigation={navigation} />;
};

export default ResetPasswordScreen;
