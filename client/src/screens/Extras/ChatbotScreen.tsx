import React, { useState, useRef, useEffect, useContext } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  Alert,
  Dimensions,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { AuthContext, AuthContextType } from "../../context/AuthContext";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  isExpanded: boolean;
}

const ChatbotScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your AI assistant. How can I help you today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      isExpanded: true,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext) as AuthContextType;
  const { sendChatMessage, clearChatHistory, user } = auth;
  const scrollViewRef = useRef<ScrollView>(null);

  // Load conversation history on component mount
  useEffect(() => {
    loadConversationHistory();
  }, [user]);

  const loadConversationHistory = async () => {
    // If you want to load previous conversations, you can add that logic here
  };

  useEffect(() => {
    // Scroll to bottom when new message is added
    if (scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim() || loading) return;

    const userMessage: Message = {
      id: Date.now(),
      text: inputText.trim(),
      sender: "user",
      timestamp: new Date().toISOString(),
      isExpanded: true,
    };

    // Add user message immediately for better UX
    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setLoading(true);

    try {
      const result = await sendChatMessage(inputText.trim());

      if (result.success) {
        const botMessage: Message = {
          id: Date.now() + 1,
          text: result.response,
          sender: "bot",
          timestamp: new Date().toISOString(),
          isExpanded: true, // Expanded by default
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Handle error from backend
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: result.error,
          sender: "bot",
          timestamp: new Date().toISOString(),
          isExpanded: true,
        };
        setMessages((prev) => [...prev, errorMessage]);

        // If session expired, show alert
        if (result.statusCode === 401) {
          Alert.alert("Session Expired", "Please log in again");
        }
      }
    } catch (error) {
      console.error("Error in handleSendMessage:", error);

      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "An unexpected error occurred. Please try again.",
        sender: "bot",
        timestamp: new Date().toISOString(),
        isExpanded: true,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const toggleMessageExpansion = (messageId: number) => {
    setMessages(prevMessages =>
      prevMessages.map(msg =>
        msg.id === messageId ? { ...msg, isExpanded: !msg.isExpanded } : msg
      )
    );
  };

  const clearChat = async () => {
    Alert.alert(
      "Clear Chat",
      "Are you sure you want to clear all messages?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            // Clear local state
            setMessages([
              {
                id: 1,
                text: "Hello! I'm your AI assistant. How can I help you today?",
                sender: "bot",
                timestamp: new Date().toISOString(),
                isExpanded: true,
              },
            ]);

            // Clear stored conversation
            if (clearChatHistory) {
              await clearChatHistory();
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

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender === "user";
    const isLongMessage = message.text.length > 300; // Show expand if > 300 chars
    const shouldTruncate = !message.isExpanded && isLongMessage;
    const displayText = shouldTruncate
      ? message.text.substring(0, 300) + "..."
      : message.text;

    return (
      <View
        style={[
          styles.messageContainer,
          isUser ? styles.userMessageContainer : styles.botMessageContainer,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
          ]}
        >
          <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
            {displayText}
          </Text>

          {isLongMessage && !isUser && (
            <TouchableOpacity
              onPress={() => toggleMessageExpansion(message.id)}
              style={styles.expandButton}
            >
              <Text style={styles.expandButtonText}>
                {message.isExpanded ? "Show less" : "Show more"}
              </Text>
            </TouchableOpacity>
          )}

          <Text style={[styles.timestamp, isUser && styles.userTimestamp]}>
            {formatTime(message.timestamp)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialIcons name="arrow-back" size={24} color="#007AFF" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <View style={styles.avatar}>
            <MaterialIcons name="smart-toy" size={20} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>
              {loading ? "Typing..." : "Online"}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearButton}>
          <MaterialIcons name="delete-outline" size={24} color="#FF3B30" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <View style={styles.botMessageContainer}>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <View style={styles.typingIndicator}>
                <View style={styles.typingDot} />
                <View style={[styles.typingDot, styles.typingDotMiddle]} />
                <View style={styles.typingDot} />
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.textInput}
          placeholder="Type your message here..."
          value={inputText}
          onChangeText={setInputText}
          multiline
          maxLength={1000} // Increased max length
          editable={!loading}
          onSubmitEditing={handleSendMessage}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!inputText.trim() || loading) && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!inputText.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <MaterialIcons name="send" size={20} color="#fff" />
          )}
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#e9ecef",
  },
  backButton: {
    padding: 8,
  },
  clearButton: {
    padding: 8,
  },
  headerTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1c1c1e",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "#6c757d",
  },
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 12,
  },
  userMessageContainer: {
    alignItems: "flex-end",
  },
  botMessageContainer: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: SCREEN_WIDTH * 0.85, // Better width calculation
    padding: 12,
    borderRadius: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  userBubble: {
    backgroundColor: "#007AFF",
    borderBottomRightRadius: 4,
  },
  botBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
  },
  userMessageText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 20,
  },
  botMessageText: {
    color: "#1c1c1e",
    fontSize: 14,
    lineHeight: 20,
  },
  timestamp: {
    fontSize: 10,
    color: "rgba(0, 0, 0, 0.5)",
    marginTop: 4,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  expandButton: {
    marginTop: 8,
    paddingVertical: 4,
  },
  expandButtonText: {
    color: "#007AFF",
    fontSize: 12,
    fontWeight: "600",
  },
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#ccc",
    marginHorizontal: 2,
  },
  typingDotMiddle: {
    opacity: 0.5,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e9ecef",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    maxHeight: 120, // Increased max height
    fontSize: 14,
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
});

export default ChatbotScreen;