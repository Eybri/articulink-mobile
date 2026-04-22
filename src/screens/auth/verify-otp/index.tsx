import React from "react";
import { VerifyOTPView } from "./VerifyOTPView";
import { useVerifyOTPViewModel } from "./useVerifyOTPViewModel";

/**
 * Verify OTP Screen Entry Point.
 */
const VerifyOTPScreen: React.FC<{ navigation: any, route: any }> = ({ navigation, route }) => {
    const { email } = route.params || {};
    const vm = useVerifyOTPViewModel(navigation, email);
    
    return <VerifyOTPView vm={vm} email={email} />;
};

export default VerifyOTPScreen;
