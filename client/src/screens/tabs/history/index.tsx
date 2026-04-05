import React from "react";
import { HistoryView } from "./HistoryView";
import { useHistoryViewModel } from "./useHistoryViewModel";

/**
 * Speech History Screen Entry Point.
 */
const HistoryScreen: React.FC = () => {
    const vm = useHistoryViewModel();
    
    return <HistoryView vm={vm} />;
};

export default HistoryScreen;
