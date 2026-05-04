import React, { useRef, useEffect, memo } from "react";
import { Animated, TouchableOpacity, Image as RNImage } from "react-native";
import {
  XStack,
  Circle,
  SizableText,
  Card,
} from "tamagui";
import { COLORS } from "./../../../../constants/colors";
import { Message } from "../useChatbotViewModel";

// ─── Animated Typing Dots ─────────────────────────────────────────
export const TypingDots: React.FC = () => {
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

// ─── Message Bubble Component ─────────────────────────────────────
export const MessageBubble = memo(({
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
                            source={require("../../../../../assets/images/ariya.png")}
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
