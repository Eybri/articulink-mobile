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
                {/* Background Logo */}
                <YStack fullscreen o={0.05} jc="center" ai="center">
                    <RNImage
                        source={require("../../../../assets/images/logo2-nobg.png")}
                        style={{ width: vm.width * 0.7, height: vm.width * 0.7 }}
                        resizeMode="contain"
                    />
                </YStack>

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
                        <YStack ai="center" mt="$8" mb="$6" gap="$4">
                            <ZStack w={100} h={100} jc="center" ai="center">
                                <Circle size={100} bg={`${COLORS.teal}08`} />
                                <Circle size={80} bg={`${COLORS.teal}0F`} />
                                <RNImage
                                    source={require("../../../../assets/images/logo2-nobg.png")}
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
                            <Circle size={32} bg={COLORS.white} elevation={1} bc={COLORS.sandMid} bw={1} jc="center" ai="center" overflow="hidden">
                                <RNImage
                                    source={require("../../../../assets/images/logo2-nobg.png")}
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
                                    bg={!vm.inputText.trim() || vm.loading ? COLORS.sandMid : COLORS.teal}
                                    pressStyle={{ scale: 0.92, bg: COLORS.tealDark }}
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
