import React, { useState, useRef, useEffect, useContext } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  SizableText,
  Card,
  Image,
  ScrollView,
  Spinner,
  Input,
  Theme,
} from "tamagui";
import { Send, Trash2, Bot, MessageCircle } from "@tamagui/lucide-icons";
import { AuthContext, AuthContextType } from "../../context/AuthContext";

// ─── Brand Palette ───────────────────────────────────────────────
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
      <Animated.View style={{ transform: [{ translateY }] }}>
        <Circle size={7} bg={COLORS.teal} opacity={0.5} />
      </Animated.View>
    );
  };

  return (
    <XStack ai="center" px="$2" py="$1" gap="$1">
      {renderDot(dot1)}
      {renderDot(dot2)}
      {renderDot(dot3)}
    </XStack>
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

  const handleDeleteMessage = (message: Message) => {
    Alert.alert(
      "Delete Message",
      "Are you sure you want to delete this message?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const result = await (auth as any).deleteMessage(message.timestamp);
              if (result.success) {
                setMessages(prev => prev.filter(m => m.timestamp !== message.timestamp));
              } else {
                Alert.alert("Error", result.error || "Failed to delete message");
              }
            } catch (error) {
              Alert.alert("Error", "An unexpected error occurred");
            }
          },
        },
      ]
    );
  };

  const MessageBubble = ({ message }: { message: Message }) => {
    const isUser = message.sender === "user";
    const isLongMessage = message.text.length > 300;
    const shouldTruncate = !message.isExpanded && isLongMessage;
    const displayText = shouldTruncate
      ? message.text.substring(0, 300) + "..."
      : message.text;

    return (
      <XStack
        gap="$2"
        mb="$3"
        ai="flex-end"
        jc={isUser ? "flex-end" : "flex-start"}
      >
        {!isUser && (
          <Circle size={28} bg={`${COLORS.teal}0C`} bw={1} bc={`${COLORS.teal}18`} jc="center" ai="center" mb={2}>
            <Bot size={14} color={COLORS.teal} />
          </Circle>
        )}
        <Card
          bg={isUser ? COLORS.teal : COLORS.white}
          p="$3"
          px="$4"
          br={18}
          borderBottomRightRadius={isUser ? 6 : 18}
          borderBottomLeftRadius={isUser ? 18 : 6}
          maw={width * 0.78}
          bw={isUser ? 0 : 1}
          bc={COLORS.sandMid}
          elevation={isUser ? 2 : 1}
          onPress={() => isLongMessage && !isUser && toggleMessageExpansion(message.id)}
          onLongPress={() => handleDeleteMessage(message)}
        >
          <SizableText color={isUser ? "white" : COLORS.textDark} size="$3" lh={21} fow="500">
            {displayText}
          </SizableText>

          {isLongMessage && !isUser && (
            <Button
              unstyled
              mt="$2"
              onPress={(e) => {
                e.stopPropagation();
                toggleMessageExpansion(message.id);
              }}
            >
              <SizableText color={COLORS.teal} size="$2" fow="700">
                {message.isExpanded ? "Show less" : "Show more"}
              </SizableText>
            </Button>
          )}

          <SizableText
            size="$1"
            color={isUser ? "rgba(255, 255, 255, 0.6)" : `${COLORS.textMid}80`}
            fow="600"
            mt="$1"
            ta="right"
          >
            {formatTime(message.timestamp)}
          </SizableText>
        </Card>
      </XStack>
    );
  };

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* Top Bar */}
      <XStack jc="space-between" ai="center" px="$4" py="$2" pt={Platform.OS === 'android' ? 6 : 8}>
        <XStack ai="center" bg={`${COLORS.teal}0C`} px="$3" py="$2" br={12} gap="$2">
          <Circle size={7} bg={loading ? COLORS.teal : '#34C759'} />
          <SizableText size="$1" fow="700" color={COLORS.teal} ls={-0.1}>
            {loading ? "Typing..." : "Online"}
          </SizableText>
        </XStack>
        <Button
          size="$3"
          circular
          bg="rgba(220,38,38,0.06)"
          bw={1}
          bc="rgba(220,38,38,0.12)"
          icon={<Trash2 size={16} color="#DC2626" />}
          onPress={clearChat}
          pressStyle={{ scale: 0.9 }}
        />
      </XStack>

      {/* Chat Messages */}
      <ScrollView
        ref={scrollViewRef}
        f={1}
        px="$4"
        pt="$2"
        pb="$4"
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        {messages.length === 1 && messages[0].sender === "bot" && (
          <Card bg="white" br={20} p="$5" mb="$4" bw={1} bc={COLORS.sandMid} elevation={3} ai="center">
            <Circle size={48} bg={`${COLORS.teal}0C`} mb="$3" jc="center" ai="center">
              <MessageCircle size={22} color={COLORS.teal} />
            </Circle>
            <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.3} mb="$2">
              Articulink Assistant
            </SizableText>
            <SizableText size="$2" color={COLORS.textMid} fow="500" ta="center" lh={19}>
              Ask me about speech exercises, communication tips, or anything else!
            </SizableText>
          </Card>
        )}

        {messages.map((message) => (
          <MessageBubble key={message.id} message={message} />
        ))}
        {loading && (
          <XStack ai="flex-end" gap="$2" mb="$3">
            <Circle size={28} bg={`${COLORS.teal}0C`} bw={1} bc={`${COLORS.teal}18`} jc="center" ai="center" mb={2}>
              <Bot size={14} color={COLORS.teal} />
            </Circle>
            <Card bg="white" p="$2" px="$3" br={18} borderBottomLeftRadius={6} bw={1} bc={COLORS.sandMid} elevation={1}>
              <TypingDots />
            </Card>
          </XStack>
        )}
      </ScrollView>

      {/* Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
      >
        <Theme name="light">
          <XStack bg="white" borderTopWidth={1} bc={COLORS.sandMid} px="$3" py="$2" pb={Platform.OS === 'android' ? 10 : 28} gap="$2" ai="flex-end">
            <Input
              f={1}
              bg={COLORS.warmWhite}
              br={20}
              px="$4"
              py="$1.5"
              mah={120}
              size="$4"
              fow="500"
              color={COLORS.textDark}
              bw={1.5}
              bc={COLORS.sandMid}
              placeholder="Type a message..."
              placeholderTextColor={`${COLORS.textMid}60`}
              value={inputText}
              onChangeText={setInputText}
              multiline
              disabled={loading}
              returnKeyType="send"
              onSubmitEditing={handleSendMessage}
            />
            <Button
              size="$4"
              circular
              bg={!inputText.trim() || loading ? COLORS.sandMid : COLORS.teal}
              icon={loading ? <Spinner color="white" /> : <Send size={18} color="white" />}
              onPress={handleSendMessage}
              disabled={!inputText.trim() || loading}
              elevation={!inputText.trim() || loading ? 0 : 4}
              pressStyle={{ scale: 0.9 }}
            />
          </XStack>
        </Theme>
      </KeyboardAvoidingView>
    </YStack>
  );
};

export default ChatbotScreen;