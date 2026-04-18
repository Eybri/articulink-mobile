import React from 'react';
import { TouchableOpacity, Animated } from 'react-native';
import Slider from '@react-native-community/slider';
import {
  YStack,
  XStack,
  SizableText,
  Separator,
} from "tamagui";
import { COLORS } from "./../../../../constants/colors";

export const SettingRow = ({ icon, title, description, children, isLast = false, onPress }: { icon: any, title: string, description?: string, children: React.ReactNode, isLast?: boolean, onPress?: () => void }) => (
  <TouchableOpacity onPress={onPress} disabled={!onPress} activeOpacity={0.7}>
    <YStack>
      <XStack ai="center" jc="space-between" py="$4" gap="$3">
        <XStack ai="center" gap="$3" f={1}>
          <YStack w={42} h={42} br={14} bg={`${COLORS.royalBlue}0A`} jc="center" ai="center">
            {icon}
          </YStack>
          <YStack f={1}>
            <SizableText size="$4" fow="700" color={COLORS.textDark} ls={-0.4}>{title}</SizableText>
            {description && <SizableText size="$1" color={COLORS.textMid} fow="500" opacity={0.8}>{description}</SizableText>}
          </YStack>
        </XStack>
        {children}
      </XStack>
      {!isLast && <Separator bc="rgba(221, 214, 200, 0.4)" />}
    </YStack>
  </TouchableOpacity>
);

export const SliderSetting = ({ icon, title, value, onValueChange }: { icon: any, title: string, value: number, onValueChange: (v: number) => void }) => (
  <YStack py="$4" gap="$3">
    <XStack ai="center" jc="space-between">
      <XStack ai="center" gap="$3">
        <YStack w={42} h={42} br={14} bg={`${COLORS.royalBlue}0A`} jc="center" ai="center">
          {icon}
        </YStack>
        <SizableText size="$4" fow="700" color={COLORS.textDark} ls={-0.4}>{title}</SizableText>
      </XStack>
      <SizableText size="$2" fow="800" color={COLORS.royalBlue}>{Math.round(value * 100)}%</SizableText>
    </XStack>
    <YStack px="$1" mt="$1">
      <Slider
        style={{ width: '100%', height: 30 }}
        value={value}
        onValueChange={onValueChange}
        minimumValue={0}
        maximumValue={1}
        minimumTrackTintColor={COLORS.royalBlue}
        maximumTrackTintColor={COLORS.sandMid}
        thumbTintColor={COLORS.royalBlue}
      />
      <XStack jc="space-between" px="$1" mt="$1">
        <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.5}>Soft</SizableText>
        <SizableText size="$1" color={COLORS.textMid} fow="600" opacity={0.5}>Strong</SizableText>
      </XStack>
    </YStack>
  </YStack>
);
