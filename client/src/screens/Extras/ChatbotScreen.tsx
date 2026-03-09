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
  Alert,
  Animated,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { Send, Trash2, Bot, MessageCircle } from "lucide-react-native";
import { AuthContext, AuthContextType } from "../../context/AuthContext";

// ─── Brand Palette (matches StartUpScreen / ProfileScreen) ────────
const COLORS = {
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',
  teal: '#2A8FA0',
  tealLight: '#3DAFC4',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

// ─── Animated Typing Dots ─────────────────────────────────────────
const TypingDots: React.FC = () => {
  const dot1 = useRef(new Animated.Value(0)).current;
  const dot2 = useRef(new Animated.Value(0)).current;
  const dot3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const createBounce = (anim: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(anim, { toValue: 1, duration: 300, useNativeDriver: true }),
          Animated.timing(anim, { toValue: 0, duration: 300, useNativeDriver: true }),
          Animated.delay(600 - delay),
        ])
      );
    const a1 = createBounce(dot1, 0);
    const a2 = createBounce(dot2, 200);
    const a3 = createBounce(dot3, 400);
    a1.start(); a2.start(); a3.start();
    return () => { a1.stop(); a2.stop(); a3.stop(); };
  }, []);

  const renderDot = (anim: Animated.Value) => {
    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
    return (
      <Animated.View style={[styles.typingDot, { transform: [{ translateY }] }]} />
    );
  };

  return (
    <View style={styles.typingIndicator}>
      {renderDot(dot1)}
      {renderDot(dot2)}
      {renderDot(dot3)}
    </View>
  );
};

// ─── Interfaces ───────────────────────────────────────────────────
interface Message {
  id: number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  isExpanded: boolean;
}

// ─── Main Component ───────────────────────────────────────────────
const ChatbotScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hello! I'm your Articulink AI assistant. I can help with speech exercises, answer questions, or just chat. How can I help you today?",
      sender: "bot",
      timestamp: new Date().toISOString(),
      isExpanded: true,
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [loading, setLoading] = useState(false);
  const auth = useContext(AuthContext) as AuthContextType;
  const { sendChatMessage, clearChatHistory, fetchChatHistory, user } = auth;
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
      if (history && history.length > 0) {
        const formattedMessages: Message[] = history.map((msg: any, index: number) => ({
          id: msg.id || index,
          text: msg.content,
          sender: msg.role === 'assistant' ? 'bot' : 'user',
          timestamp: msg.created_at || new Date().toISOString(),
          isExpanded: true,
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      console.error("Error loading chat history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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

    setMessages((prev) => [...prev, userMessage]);
    const currentInput = inputText.trim();
    setInputText("");
    setLoading(true);

    try {
      // Pass the current messages to serve as context for the backend
      const result = await sendChatMessage(currentInput, messages);

      if (result.success) {
        const botMessage: Message = {
          id: Date.now() + 1,
          text: result.response,
          sender: "bot",
          timestamp: new Date().toISOString(),
          isExpanded: true,
        };
        setMessages((prev) => [...prev, botMessage]);
      } else {
        const errorMessage: Message = {
          id: Date.now() + 1,
          text: result.error || "Failed to get response",
          sender: "bot",
          timestamp: new Date().toISOString(),
          isExpanded: true,
        };
        setMessages((prev) => [...prev, errorMessage]);

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
            setLoading(true);
            try {
              if (clearChatHistory) {
                await clearChatHistory();
              }
              setMessages([
                {
                  id: 1,
                  text: "Hello! I'm your Articulink AI assistant. I can help with speech exercises, answer questions, or just chat. How can I help you today?",
                  sender: "bot",
                  timestamp: new Date().toISOString(),
                  isExpanded: true,
                },
              ]);
            } catch (error) {
              Alert.alert("Error", "Failed to clear chat history");
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

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender === "user";
    const isLongMessage = message.text.length > 300;
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
        {/* Bot avatar */}
        {!isUser && (
          <View style={styles.botAvatar}>
            <Bot size={14} color={COLORS.teal} />
          </View>
        )}
        <View
          style={[
            styles.messageBubble,
            isUser ? styles.userBubble : styles.botBubble,
            { maxWidth: width * 0.78 },
          ]}
        >
          <Text style={isUser ? styles.userMessageText : styles.botMessageText}>
            {displayText}
          </Text>

          {isLongMessage && !isUser && (
            <TouchableOpacity
              onPress={() => toggleMessageExpansion(message.id)}
              style={styles.expandButton}
              activeOpacity={0.7}
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
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Top Bar (clear button only, no header) ── */}
      <View style={styles.topBar}>
        <View style={styles.statusPill}>
          <View style={[styles.statusDot, loading && styles.statusDotActive]} />
          <Text style={styles.statusText}>{loading ? "Typing..." : "Online"}</Text>
        </View>
        <TouchableOpacity onPress={clearChat} style={styles.clearBtn} activeOpacity={0.7}>
          <Trash2 size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>

      {/* ── Chat Messages ── */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {/* Welcome card for first message */}
        {messages.length === 1 && messages[0].sender === "bot" && (
          <View style={styles.welcomeCard}>
            <View style={styles.welcomeIconWrap}>
              <MessageCircle size={22} color={COLORS.teal} />
            </View>
            <Text style={styles.welcomeTitle}>Articulink Assistant</Text>
            <Text style={styles.welcomeDesc}>
              Ask me about speech exercises, communication tips, or anything else!
            </Text>
          </View>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <View style={[styles.messageContainer, styles.botMessageContainer]}>
            <View style={styles.botAvatar}>
              <Bot size={14} color={COLORS.teal} />
            </View>
            <View style={[styles.messageBubble, styles.botBubble]}>
              <TypingDots />
            </View>
          </View>
        )}
      </ScrollView>

      {/* ── Input Area ── */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        style={styles.inputContainer}
      >
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Type a message..."
            placeholderTextColor={`${COLORS.textMid}60`}
            value={inputText}
            onChangeText={setInputText}
            multiline
            maxLength={1000}
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
            activeOpacity={0.85}
          >
            {loading ? (
              <ActivityIndicator size="small" color={COLORS.white} />
            ) : (
              <Send size={18} color={COLORS.white} />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

// ─── Styles ───────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.cream,
  },

  /* Top bar (minimal — no header) */
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingTop: Platform.OS === 'android' ? 6 : 8,
    paddingBottom: 8,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.teal}0C`,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34C759',
  },
  statusDotActive: {
    backgroundColor: COLORS.teal,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.teal,
    letterSpacing: -0.1,
  },
  clearBtn: {
    width: 34,
    height: 34,
    borderRadius: 12,
    backgroundColor: 'rgba(220,38,38,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(220,38,38,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Welcome Card */
  welcomeCard: {
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 24,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: COLORS.sandMid,
    ...Platform.select({
      ios: { shadowColor: '#8A96A4', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.08, shadowRadius: 16 },
      android: { elevation: 3 },
    }),
  },
  welcomeIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: `${COLORS.teal}0C`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  welcomeTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  welcomeDesc: {
    fontSize: 13,
    color: COLORS.textMid,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 19,
  },

  /* Chat */
  chatContainer: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 16,
  },
  messageContainer: {
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  userMessageContainer: {
    justifyContent: "flex-end",
  },
  botMessageContainer: {
    justifyContent: "flex-start",
  },
  botAvatar: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: `${COLORS.teal}0C`,
    borderWidth: 1,
    borderColor: `${COLORS.teal}18`,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
  },
  messageBubble: {
    padding: 12,
    paddingHorizontal: 14,
    borderRadius: 18,
  },
  userBubble: {
    backgroundColor: COLORS.teal,
    borderBottomRightRadius: 6,
    ...Platform.select({
      ios: { shadowColor: '#2A8FA0', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.15, shadowRadius: 8 },
      android: { elevation: 2 },
    }),
  },
  botBubble: {
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.sandMid,
    ...Platform.select({
      ios: { shadowColor: '#8A96A4', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6 },
      android: { elevation: 1 },
    }),
  },
  userMessageText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  botMessageText: {
    color: COLORS.textDark,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 21,
  },
  timestamp: {
    fontSize: 10,
    color: `${COLORS.textMid}80`,
    fontWeight: '600',
    marginTop: 5,
    alignSelf: "flex-end",
  },
  userTimestamp: {
    color: "rgba(255, 255, 255, 0.6)",
  },
  expandButton: {
    marginTop: 8,
    paddingVertical: 3,
  },
  expandButtonText: {
    color: COLORS.teal,
    fontSize: 12,
    fontWeight: "700",
  },

  /* Typing */
  typingIndicator: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
    paddingVertical: 4,
    gap: 5,
  },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.teal,
    opacity: 0.5,
  },

  /* Input */
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.sandMid,
    backgroundColor: COLORS.white,
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 14,
    paddingVertical: 10,
    paddingBottom: Platform.OS === 'android' ? 10 : 28,
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: COLORS.warmWhite,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    paddingTop: 10,
    maxHeight: 120,
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.textDark,
    borderWidth: 1.5,
    borderColor: COLORS.sandMid,
  },
  sendButton: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: COLORS.teal,
    justifyContent: "center",
    alignItems: "center",
    ...Platform.select({
      ios: { shadowColor: '#2A8FA0', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.25, shadowRadius: 8 },
      android: { elevation: 4 },
    }),
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.sandMid,
    ...Platform.select({
      ios: { shadowOpacity: 0 },
      android: { elevation: 0 },
    }),
  },
});

export default ChatbotScreen;