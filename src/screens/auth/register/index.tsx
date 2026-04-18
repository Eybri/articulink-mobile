import React from "react";
import { RegisterView } from "./RegisterView";
import { useRegisterViewModel } from "./useRegisterViewModel";

/**
 * Register Screen Entry Point.
 * This component acts as the 'Container' that connects the View and the ViewModel.
 */
const RegisterScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useRegisterViewModel(navigation);
    
    return <RegisterView vm={vm} navigation={navigation} />;
};

export default RegisterScreen;
