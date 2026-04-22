import React from "react";
import { ChatbotView } from "./ChatbotView";
import { useChatbotViewModel } from "./useChatbotViewModel";

/**
 * Chatbot Screen Entry Point.
 */
const ChatbotScreen: React.FC = () => {
    const vm = useChatbotViewModel();
    
    return <ChatbotView vm={vm} />;
};

export default ChatbotScreen;
