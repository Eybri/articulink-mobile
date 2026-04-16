import React, { useRef, useEffect } from "react";
import { Animated } from "react-native";
import {
  YStack,
  XStack,
  Circle,
  SizableText,
  Button,
  ZStack,
  AnimatePresence,
  Portal,
} from "tamagui";
import { Camera, Check, X } from "@tamagui/lucide-icons";
import { Image as RNImage, Pressable } from "react-native";
import { getProfileSource } from "./../../../../utils/imageHelper";
import { COLORS } from "./../../../../constants/colors";
import { Separator, Card as TamaCard } from "tamagui";

// ─── Edit Profile Row ─────────────────────────────────────────────
export const EditProfileRow = React.memo(({ 
    icon, 
    title, 
    description, 
    children, 
    isLast = false, 
    onPress 
}: { 
    icon: any, 
    title: string, 
    description?: string, 
    children: React.ReactNode, 
    isLast?: boolean, 
    onPress?: () => void 
}) => (
    <Pressable onPress={onPress} disabled={!onPress}>
        <YStack>
            <XStack ai="center" jc="space-between" py="$4.5" gap="$3">
                <XStack ai="center" gap="$4" f={1}>
                    <YStack w={44} h={44} br={15} bg={`${COLORS.royalBlue}0A`} jc="center" ai="center">
                        {icon}
                    </YStack>
                    <YStack f={1} gap="$0.5">
                        <SizableText size="$1" fow="600" color={COLORS.textMid} opacity={0.4} ls={0.8} tt="uppercase">{title}</SizableText>
                        {description ? (
                            <SizableText size="$4" fow="500" color={COLORS.textDark} ls={-0.2}>{description}</SizableText>
                        ) : (
                            <YStack f={1} ai="flex-start" mt="$1">
                                {children}
                            </YStack>
                        )}
                    </YStack>
                </XStack>
                {description && children}
            </XStack>
            {!isLast && <Separator bc="rgba(221, 214, 200, 0.4)" opacity={0.5} />}
        </YStack>
    </Pressable>
));

// ─── Edit Profile Card ────────────────────────────────────────────
export const EditProfileCard = React.memo(({ children }: { children: React.ReactNode }) => (
    <TamaCard 
        bg="white" br={32} p="$2" px="$5.5" 
        elevation={8} shadowColor="#8A96A4" shadowOpacity={0.1} 
        bw={1} bc="rgba(221, 214, 200, 0.5)"
    >
        {children}
    </TamaCard>
));

// ─── Soft Orb ─────────────────────────────────────────────────────
export const SoftOrb: React.FC<{ color: string; size: number; x: number; y: number; duration: number; delay: number }> = ({ color, size, x, y, duration, delay }) => {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.timing(anim, { toValue: 1, duration, useNativeDriver: true }),
        Animated.timing(anim, { toValue: 0, duration, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.92, 1, 0.92] });

  return (
    <Animated.View style={{
      position: 'absolute',
      left: x - size / 2, top: y - size / 2,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: color,
      opacity: 0.5,
      transform: [{ translateY }, { scale }],
    }}>
      <Circle pos="absolute" t={size * 0.15} l={size * 0.15} size={size * 0.7} bg="white" opacity={0.35} />
    </Animated.View>
  );
};

export const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <XStack ai="center" mb="$1.5" gap="$2" px="$1">
    <YStack w={20} h={20} br={4} bg={`${COLORS.royalBlue}08`} jc="center" ai="center">
      {icon}
    </YStack>
    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.6}>{title}</SizableText>
    <YStack f={1} h={0.5} bg={COLORS.sandMid} opacity={0.12} ml="$2" />
  </XStack>
);

export const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
  <SizableText size="$1" fow="600" color={COLORS.textMid} mb="$0" ml="$0" ls={0.2} opacity={0.5} scale={0.85} transform={[{ translateX: -4 }]}>
    {text}
  </SizableText>
);

// ─── Character Icon ────────────────────────────────────────────────
export const CharacterIcon = React.memo(({ 
    icon, 
    isSelected, 
    onSelect 
}: { 
    icon: string; 
    isSelected: boolean; 
    onSelect: (icon: string) => void;
}) => {
    return (
        <Button
            chromeless p={0} w="28%" h="auto"
            onPress={() => onSelect(icon)}
            pressStyle={{ scale: 0.95 }}
        >
            <YStack ai="center" gap="$2.5">
                <Circle 
                    size={76} bg="white" bw={isSelected ? 2.5 : 1.5} 
                    bc={isSelected ? COLORS.royalBlue : COLORS.sandMid} 
                    jc="center" ai="center" ov="hidden"
                    elevation={isSelected ? 8 : 2}
                >
                    <RNImage 
                        source={getProfileSource(icon)} 
                        style={{ width: 68, height: 68, borderRadius: 34 }} 
                    />
                    {isSelected && (
                        <Circle 
                            size={22} bg={COLORS.royalBlue} pos="absolute" b={2} r={2} 
                            jc="center" ai="center" bw={2} bc="white" elevation={4}
                        >
                            <Check size={10} color="white" />
                        </Circle>
                    )}
                </Circle>
                <SizableText size="$1" fow="800" color={isSelected ? COLORS.royalBlue : COLORS.textMid} opacity={isSelected ? 1 : 0.7} tt="uppercase" ls={0.5}>
                    {icon.split('.')[0]}
                </SizableText>
            </YStack>
        </Button>
    );
});

// ─── Avatar Picker Sheet ───────────────────────────────────────────
export const AvatarPickerSheet = ({ 
    visible, 
    onClose, 
    onPickImage, 
    onSelectIcon, 
    selectedIcon, 
    availableIcons 
}: {
    visible: boolean;
    onClose: () => void;
    onPickImage: () => void;
    onSelectIcon: (icon: string) => void;
    selectedIcon: string | null;
    availableIcons: string[];
}) => {
    return (
        <Portal>
            <AnimatePresence>
                {visible && (
                    <ZStack fullscreen pos="absolute" t={0} l={0} r={0} b={0} zi={10000}>
                        {/* Backdrop with Fade - Uses Pressable for better touch isolation */}
                        <Pressable 
                            style={{ 
                                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, 
                                backgroundColor: 'rgba(0,0,0,0.4)' 
                            }}
                            onPress={onClose}
                        >
                            <YStack 
                                fullscreen
                                bg="transparent"
                            />
                        </Pressable>
                        
                        {/* Slide up content */}
                        <YStack 
                            pos="absolute" b={0} l={0} r={0}
                            bg="white"
                            borderTopLeftRadius={32}
                            borderTopRightRadius={32}
                            p="$6"
                            pb="$10"
                            gap="$5"
                            elevation={20}
                            {...({
                                enterStyle: { y: 500, opacity: 0 },
                                exitStyle: { y: 500, opacity: 0 },
                                animation: "quick"
                            } as any)}
                            onPress={(e) => e.stopPropagation()} // Prevent backdrop close when clicking sheet
                        >
                        {/* Modal Grab Bar */}
                        <YStack ai="center">
                            <YStack w={40} h={5} bg={COLORS.sandMid} br={2.5} opacity={0.4} />
                        </YStack>

                        <XStack jc="space-between" ai="center">
                            <YStack gap="$1">
                                <SizableText size="$5" fow="800" color={COLORS.textDark} ls={-0.4}>Update Avatar</SizableText>
                                <SizableText size="$1" fow="600" color={COLORS.textMid} opacity={0.6} ls={0.5} tt="uppercase">Choose your character</SizableText>
                            </YStack>
                            <Button chromeless circular p="$1" onPress={onClose} pressStyle={{ bg: "$gray3" }}>
                                <X size={20} color={COLORS.textMid} />
                            </Button>
                        </XStack>

                        <XStack fw="wrap" jc="space-between" gap="$4" px="$1">
                            {/* Upload Choice */}
                            <Button
                                chromeless p={0} w="28%" h="auto"
                                onPress={() => {
                                    onPickImage();
                                    onClose();
                                }}
                                pressStyle={{ scale: 0.95 }}
                            >
                                <YStack ai="center" gap="$2.5">
                                    <Circle 
                                        size={76} bg={COLORS.cream} bw={1.5} bc={COLORS.sandMid} 
                                        jc="center" ai="center" borderStyle="dashed"
                                    >
                                        <YStack ai="center" jc="center">
                                            <Camera size={24} color={COLORS.royalBlue} opacity={0.4} />
                                            <Circle 
                                                size={22} bg={COLORS.royalBlue} pos="absolute" b={-4} r={-4} 
                                                jc="center" ai="center" bw={2} bc="white"
                                            >
                                                <SizableText color="white" fow="900" size="$1">+</SizableText>
                                            </Circle>
                                        </YStack>
                                    </Circle>
                                    <SizableText size="$1" fow="800" color={COLORS.textMid} opacity={0.7} ls={0.5}>UPLOAD</SizableText>
                                </YStack>
                            </Button>

                            {/* Predefined Icons */}
                            {availableIcons.map((icon) => (
                                <CharacterIcon 
                                    key={icon} 
                                    icon={icon} 
                                    isSelected={selectedIcon === icon} 
                                    onSelect={onSelectIcon} 
                                />
                            ))}
                            
                            {/* Grid Fillers */}
                            <YStack w="28%" />
                            <YStack w="28%" />
                        </XStack>
                    </YStack>
                </ZStack>
            )}
        </AnimatePresence>
    </Portal>
    );
};
