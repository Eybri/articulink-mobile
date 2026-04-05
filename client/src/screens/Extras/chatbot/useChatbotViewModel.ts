import { useState, useRef, useEffect, useContext } from "react";
import { Alert, useWindowDimensions, ScrollView } from "react-native";
import { AuthContext, AuthContextType } from "./../../../context/AuthContext";

export interface Message {
  id: string | number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  isExpanded: boolean;
}

/**
 * ViewModel for the Chatbot Screen.
 */
export const useChatbotViewModel = () => {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "initial-greeting",
            text: "Hello! I'm your Articulink AI assistant. I can help with speech exercises, answer questions, or just chat. How can I help you today?",
            sender: "bot",
            timestamp: new Date().toISOString(),
            isExpanded: true,
        },
    ]);
    const [inputText, setInputText] = useState("");
    const [loading, setLoading] = useState(false);
    const auth = useContext(AuthContext) as AuthContextType;
    const { sendChatMessage, clearChatHistory, fetchChatHistory, deleteMessage, user } = auth;
    const scrollViewRef = useRef<ScrollView>(null);
    const { width } = useWindowDimensions();

    useEffect(() => {
        loadConversationHistory();
    }, [user]);

    const loadConversationHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const history = await fetchChatHistory();
            if (history && Array.isArray(history) && history.length > 0) {
                const formattedMessages: Message[] = history.map((msg: any, index: number) => ({
                    id: msg._id || msg.id || `history-${index}-${Date.now()}`,
                    text: msg.content || msg.text || "",
                    sender: msg.role === 'assistant' ? 'bot' : 'user',
                    timestamp: msg.created_at || new Date().toISOString(),
                    isExpanded: true,
                }));

                setMessages((prev) => {
                    const greeting = prev[0];
                    const filteredHistory = formattedMessages.filter(m => m.text !== greeting.text);
                    return [greeting, ...filteredHistory];
                });
            }
        } catch (error) {
            // Silently handle
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (scrollViewRef.current) {
            setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
            }, 150);
        }
    }, [messages, loading]);

    const handleSendMessage = async () => {
        if (!inputText.trim() || loading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText.trim(),
            sender: "user",
            timestamp: new Date().toISOString(),
            isExpanded: true,
        };

        setMessages((prev) => [...prev, userMessage]);
        const currentInput = inputText.trim();
        setInputText("");
        setLoading(true);

        try {
            const result = await sendChatMessage(currentInput, messages);

            if (result.success) {
                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: result.response || "No response received.",
                    sender: "bot",
                    timestamp: new Date().toISOString(),
                    isExpanded: true,
                };
                setMessages((prev) => [...prev, botMessage]);
            } else {
                const errorMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    text: result.error || "Failed to get response. Please try again.",
                    sender: "bot",
                    timestamp: new Date().toISOString(),
                    isExpanded: true,
                };
                setMessages((prev) => [...prev, errorMessage]);
            }
        } catch (error) {
            console.error("Error in handleSendMessage:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleMessageExpansion = (messageId: string | number) => {
        setMessages(prev =>
            prev.map(msg =>
                msg.id === messageId ? { ...msg, isExpanded: !msg.isExpanded } : msg
            )
        );
    };

    const clearChat = () => {
        Alert.alert(
            "Clear Journey",
            "This will remove all your conversation history with the assistant. Continue?",
            [
                { text: "Keep it", style: "cancel" },
                {
                    text: "Clear all",
                    style: "destructive",
                    onPress: async () => {
                        setLoading(true);
                        try {
                            if (clearChatHistory) await clearChatHistory();
                            setMessages([messages[0]]);
                        } catch (error) {
                            Alert.alert("Error", "Failed to clear history");
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    const formatTime = (timestamp: string) => {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    };

    const handleDeleteMessage = (message: Message) => {
        Alert.alert(
            "Delete Message",
            "Remove this message from history?",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Delete",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            const result = await deleteMessage(message.timestamp);
                            if (result.success) {
                                setMessages(prev => prev.filter(m => m.timestamp !== message.timestamp));
                            }
                        } catch (error) {
                            Alert.alert("Error", "Could not delete message");
                        }
                    },
                },
            ]
        );
    };

    return {
        messages,
        inputText, setInputText,
        loading,
        width,
        scrollViewRef,
        handleSendMessage,
        toggleMessageExpansion,
        clearChat,
        formatTime,
        handleDeleteMessage
    };
};
