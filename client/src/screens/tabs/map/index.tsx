import React from "react";
import { MapView } from "./MapView";
import { useMapViewModel } from "./useMapViewModel";

/**
 * Speech Therapy Maps Screen Entry Point.
 */
const MapScreen: React.FC = () => {
    const vm = useMapViewModel();
    
    return <MapView vm={vm} />;
};

export default MapScreen;
