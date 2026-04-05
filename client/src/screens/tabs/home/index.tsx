import React from "react";
import { useHomeViewModel } from "./useHomeViewModel";
import { HomeView } from "./HomeView";

/**
 * Home Screen Entry Point.
 * Integrates logic and UI.
 */
const HomeScreen: React.FC = () => {
    const vm = useHomeViewModel();
    
    return <HomeView vm={vm} />;
};

export default HomeScreen;
