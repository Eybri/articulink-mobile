import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Animated,
    StatusBar,
    Image as RNImage,
} from "react-native";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Circle,
    SizableText,
    Card,
    ScrollView,
    Spinner,
    Input,
    Theme,
} from "tamagui";
import { Send, Trash2 } from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { TypingDots, MessageBubble } from "./components/ChatbotComponents";

interface ChatbotViewProps {
    vm: any;
}

export const ChatbotView: React.FC<ChatbotViewProps> = ({ vm }) => {
    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" />



            {/* Header */}
            <XStack
                jc="space-between"
                ai="center"
                px="$4"
                py="$2"
                pt={Platform.OS === 'ios' ? 44 : 10}
                bg="transparent"
            >
                <XStack ai="center" bg={`${COLORS.teal}0C`} px="$3" py="$1.5" br={12} gap="$2">
                    <Circle size={8} bg={vm.loading ? COLORS.orbSand : "#34C759"} />
                    <SizableText size="$1" fow="700" color={COLORS.teal} ls={-0.1}>
                        {vm.loading ? "Thinking..." : "Online"}
                    </SizableText>
                </XStack>

                <Button
                    size="$3"
                    circular
                    bg="rgba(220,38,38,0.06)"
                    bw={1}
                    bc="rgba(220,38,38,0.12)"
                    icon={<Trash2 size={16} color={COLORS.error || "#DC2626"} />}
                    onPress={vm.clearChat}
                    pressStyle={{ scale: 0.9 }}
                />
            </XStack>

            {/* Main Chat Area */}
            <ZStack f={1}>
                {/* Background Logo - Only show when there's an actual conversation to avoid cluttering the intro */}
                {vm.messages.length > 1 && (
                    <YStack fullscreen o={0.03} jc="center" ai="center" pointerEvents="none">
                        <RNImage
                            source={require("../../../../assets/images/ariya.png")}
                            style={{ width: vm.width * 0.7, height: vm.width * 0.7 }}
                            resizeMode="contain"
                        />
                    </YStack>
                )}

                <ScrollView
                    ref={vm.scrollViewRef}
                    f={1}
                    px="$4"
                    pt="$1"
                    pb="$4"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 20 }}
                    onContentSizeChange={() => vm.scrollViewRef.current?.scrollToEnd({ animated: true })}
                >
                    {vm.messages.length === 1 && (
                        <YStack ai="center" mt="$10" mb="$8" gap="$5">
                            <ZStack w={140} h={140} jc="center" ai="center">
                                <Circle size={140} bg={`${COLORS.teal}10`} />
                                <Circle size={110} bg={`${COLORS.teal}20`} />
                                <Circle size={80} bg={COLORS.teal} opacity={0.1} />
                                <YStack fullscreen jc="center" ai="center">
                                    <RNImage
                                        source={require("../../../../assets/images/ariya.png")}
                                        style={{ width: 130, height: 130 }}
                                        resizeMode="contain"
                                    />
                                </YStack>
                            </ZStack>
                            <YStack ai="center" gap="$2">
                                <SizableText size="$8" fow="900" color={COLORS.textDark} ta="center" ls={-0.5}>
                                    Meet Ariya
                                </SizableText>
                                <SizableText size="$4" color={COLORS.textMid} ta="center" px="$6" o={0.8} fow="600" lh={24}>
                                    Your personal AI articulation assistant. I'm here to help you practice and improve your speech.
                                </SizableText>
                            </YStack>
                        </YStack>
                    )}

                    {vm.messages.map((message: any) => (
                        <MessageBubble
                            key={message.id}
                            message={message}
                            onToggleExpand={vm.toggleMessageExpansion}
                            onLongPress={vm.handleDeleteMessage}
                            formatTime={vm.formatTime}
                            width={vm.width}
                        />
                    ))}

                    {vm.loading && (
                        <XStack ai="flex-end" gap="$2.5" mb="$4">
                            <RNImage
                                source={require("../../../../assets/images/ariya.png")}
                                style={{ width: 44, height: 44 }}
                                resizeMode="contain"
                            />
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
                    <YStack 
                        bg="rgba(255,255,255,0.95)" 
                        px="$4" 
                        pt="$3" 
                        pb={Platform.OS === 'ios' ? 34 : 20} 
                        borderTopLeftRadius={30}
                        borderTopRightRadius={30}
                        elevation={20} 
                        shadowColor={COLORS.deepNavy}
                        shadowOpacity={0.06}
                        shadowRadius={15}
                        bc="rgba(221, 214, 200, 0.4)" 
                        btw={1.5}
                    >
                        <XStack gap="$3" ai="flex-end">
                            <YStack f={1} bg={COLORS.cream} br={24} px="$4" py="$1" bc={COLORS.sandMid} bw={1.5} focusStyle={{ bc: COLORS.royalBlue }}>
                                <Input
                                    f={1}
                                    py="$2"
                                    size="$4"
                                    color={COLORS.textDark as any}
                                    placeholder="Type your message..."
                                    placeholderTextColor={COLORS.textMid as any}
                                    value={vm.inputText}
                                    onChangeText={vm.setInputText}
                                    multiline
                                    disabled={vm.loading}
                                    backgroundColor="transparent"
                                    borderWidth={0}
                                />
                            </YStack>

                            <Animated.View style={{ transform: [{ scale: 1 }] }}>
                                <Button
                                    size="$5"
                                    w={52}
                                    h={52}
                                    circular
                                    bg={!vm.inputText.trim() || vm.loading ? COLORS.sandMid : COLORS.royalBlue}
                                    pressStyle={{ scale: 0.92, bg: COLORS.mediumBlue }}
                                    icon={vm.loading ? <Spinner color="white" /> : <Send size={20} color="white" />}
                                    onPress={vm.handleSendMessage}
                                    disabled={!vm.inputText.trim() || vm.loading}
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
