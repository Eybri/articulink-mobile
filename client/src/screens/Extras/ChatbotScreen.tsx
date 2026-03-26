import React, { useState, useRef, useEffect, useContext, memo } from "react";
import {
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Animated,
  useWindowDimensions,
  StatusBar,
  TouchableOpacity,
  Image as RNImage,
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
import { Send, Trash2, Bot, MessageCircle, ChevronLeft, MoreVertical } from "@tamagui/lucide-icons";
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
  tealDark: '#1E6B78',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
  error: '#DC2626',
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
        <Circle size={6} bg={COLORS.teal} opacity={0.6} />
      </Animated.View>
    );
  };

  return (
    <XStack ai="center" px="$2" py="$1" gap="$1.5">
      {renderDot(dot1)}
      {renderDot(dot2)}
      {renderDot(dot3)}
    </XStack>
  );
};

// ─── Interfaces ───────────────────────────────────────────────────
interface Message {
  id: string | number;
  text: string;
  sender: 'bot' | 'user';
  timestamp: string;
  isExpanded: boolean;
}

// ─── Message Bubble Component ─────────────────────────────────────
const MessageBubble = memo(({
  message,
  onToggleExpand,
  onLongPress,
  formatTime,
  width
}: {
  message: Message;
  onToggleExpand: (id: string | number) => void;
  onLongPress: (msg: Message) => void;
  formatTime: (ts: string) => string;
  width: number;
}) => {
  const isUser = message.sender === "user";
  const isLongMessage = (message.text || "").length > 300;
  const shouldTruncate = !message.isExpanded && isLongMessage;
  const displayText = shouldTruncate
    ? message.text.substring(0, 300) + "..."
    : message.text;

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <Animated.View style={{
      opacity: fadeAnim,
      transform: [{ translateY: slideAnim }],
      alignSelf: isUser ? "flex-end" : "flex-start",
      width: '100%'
    }}>
      <XStack
        gap="$2.5"
        mb="$4"
        ai="flex-end"
        jc={isUser ? "flex-end" : "flex-start"}
      >
        {!isUser && (
          <Circle
            size={32}
            bg={COLORS.white}
            elevation={2}
            jc="center"
            ai="center"
            mb={2}
            bc={COLORS.sandMid}
            bw={1}
            overflow="hidden"
          >
            <RNImage
              source={require("../../../assets/images/logo2-nobg.png")}
              style={{ width: 26, height: 26 }}
              resizeMode="contain"
            />
          </Circle>
        )}
        <Card
          p="$3.5"
          px="$4"
          br={20}
          borderBottomRightRadius={isUser ? 4 : 20}
          borderBottomLeftRadius={isUser ? 20 : 4}
          maw={width * 0.78}
          elevation={isUser ? 4 : 2}
          bg={isUser ? COLORS.teal : COLORS.white}
          onPress={() => isLongMessage && !isUser && onToggleExpand(message.id)}
          onLongPress={() => onLongPress(message)}
          pressStyle={{ scale: 0.98 }}
          overflow="hidden"
        >
          <SizableText
            color={isUser ? "white" : COLORS.textDark}
            size="$3"
            lh={22}
            fow="500"
            ls={-0.2}
          >
            {displayText}
          </SizableText>

          {isLongMessage && !isUser && (
            <TouchableOpacity
              onPress={() => onToggleExpand(message.id)}
              style={{ marginTop: 8 }}
            >
              <SizableText color={COLORS.teal} size="$2" fow="700">
                {message.isExpanded ? "Show less" : "Read more"}
              </SizableText>
            </TouchableOpacity>
          )}

          <XStack jc="flex-end" ai="center" mt="$1.5" gap="$1.5">
            <SizableText
              size="$1"
              color={isUser ? "rgba(255, 255, 255, 0.7)" : `${COLORS.textMid}70`}
              fow="600"
              ls={0.5}
            >
              {formatTime(message.timestamp)}
            </SizableText>
          </XStack>
        </Card>
      </XStack>
    </Animated.View>
  );
});

// ─── Main Component ───────────────────────────────────────────────
const ChatbotScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial- greeting",
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
          // Simple deduplication check
          const filteredHistory = formattedMessages.filter(m => m.text !== greeting.text);
          return [greeting, ...filteredHistory];
        });
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
              const result = await auth.deleteMessage(message.timestamp);
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

  return (
    <YStack f={1} bg={COLORS.cream}>
      <StatusBar barStyle="dark-content" />

      {/* Simplified Header */}
      <XStack
        jc="space-between"
        ai="center"
        px="$4"
        py="$2"
        pt={Platform.OS === 'ios' ? 44 : 10}
        bg="transparent"
      >
        <XStack ai="center" bg={`${COLORS.teal}0C`} px="$3" py="$1.5" br={12} gap="$2">
          <Circle size={8} bg={loading ? COLORS.orbSand : "#34C759"} />
          <SizableText size="$1" fow="700" color={COLORS.teal} ls={-0.1}>
            {loading ? "Thinking..." : "Online"}
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

      {/* Main Chat Area */}
      <ZStack f={1}>
        {/* Subtle Background Logo */}
        <YStack fullscreen o={0.05} jc="center" ai="center">
          <RNImage
            source={require("../../../assets/images/logo2-nobg.png")}
            style={{ width: width * 0.7, height: width * 0.7 }}
            resizeMode="contain"
          />
        </YStack>

        <ScrollView
          ref={scrollViewRef}
          f={1}
          px="$4"
          pt="$1"
          pb="$4"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.length === 1 && (
            <YStack ai="center" mt="$8" mb="$6" gap="$4">
              <ZStack w={100} h={100} jc="center" ai="center">
                <Circle size={100} bg={`${COLORS.teal}08`} />
                <Circle size={80} bg={`${COLORS.teal}0F`} />
                <RNImage
                  source={require("../../../assets/images/logo2-nobg.png")}
                  style={{ width: 60, height: 60 }}
                  resizeMode="contain"
                />
              </ZStack>
              <YStack ai="center" gap="$1">
                <SizableText size="$6" fow="800" color={COLORS.textDark} ta="center">
                  Start a Conversation
                </SizableText>
                <SizableText size="$3" color={COLORS.textMid} ta="center" px="$6" o={0.8}>
                  I'm here to support your speech journey and answer any questions.
                </SizableText>
              </YStack>
            </YStack>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onToggleExpand={toggleMessageExpansion}
              onLongPress={handleDeleteMessage}
              formatTime={formatTime}
              width={width}
            />
          ))}

          {loading && (
            <XStack ai="flex-end" gap="$2.5" mb="$4">
              <Circle size={32} bg={COLORS.white} elevation={1} bc={COLORS.sandMid} bw={1} jc="center" ai="center" overflow="hidden">
                 <RNImage
                  source={require("../../../assets/images/logo2-nobg.png")}
                  style={{ width: 26, height: 26 }}
                  resizeMode="contain"
                />
              </Circle>
              <Card bg={COLORS.white} p="$2.5" px="$3.5" br={20} borderBottomLeftRadius={4} elevation={2}>
                <TypingDots />
              </Card>
            </XStack>
          )}
        </ScrollView>
      </ZStack>

      {/* Floating Input Area */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <Theme name="light">
          <YStack bg={COLORS.white} px="$4" pt="$3" pb={Platform.OS === 'ios' ? 34 : 20} elevation={10} bc={COLORS.sandMid} btw={1}>
            <XStack gap="$3" ai="flex-end">
              <YStack f={1} bg={COLORS.warmWhite} br={24} px="$4" py="$1" bc={COLORS.sandMid} bw={1.5} focusStyle={{ bc: COLORS.teal }}>
                <Input
                  unstyled
                  f={1}
                  py="$2"
                  size="$4"
                  fow="500"
                  color={COLORS.textDark}
                  placeholder="Type your message..."
                  placeholderTextColor={`${COLORS.textMid}60`}
                  value={inputText}
                  onChangeText={setInputText}
                  multiline
                  disabled={loading}
                />
              </YStack>

              <Animated.View style={{ transform: [{ scale: 1 }] }}>
                <Button
                  size="$5"
                  w={52}
                  h={52}
                  circular
                  bg={!inputText.trim() || loading ? COLORS.sandMid : COLORS.teal}
                  pressStyle={{ scale: 0.92, bg: COLORS.tealDark }}
                  icon={loading ? <Spinner color="white" /> : <Send size={20} color="white" />}
                  onPress={handleSendMessage}
                  disabled={!inputText.trim() || loading}
                  elevation={4}
                />
              </Animated.View>
            </XStack>
          </YStack>
        </Theme>
      </KeyboardAvoidingView>
    </YStack>
  );
};

export default ChatbotScreen;