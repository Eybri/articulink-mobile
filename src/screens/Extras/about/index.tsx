import React from "react";
import { AboutView } from "./AboutView";
import { useAboutViewModel } from "./useAboutViewModel";

/**
 * About Screen Entry Point.
 */
const AboutScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
    const vm = useAboutViewModel(navigation);
    
    return <AboutView vm={vm} />;
};

export default AboutScreen;
