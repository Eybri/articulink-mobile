import React from 'react';
import { Modal, StyleSheet } from 'react-native';
import { YStack, XStack, SizableText, Button, Card, ScrollView, Circle } from 'tamagui';
import { ShieldCheck, Info, Trash2, Database, Mic2, AlertCircle } from '@tamagui/lucide-icons';
import { COLORS } from '../constants/colors';

interface PrivacyConsentModalProps {
    visible: boolean;
    onAccept: () => void;
}

export const PrivacyConsentModal: React.FC<PrivacyConsentModalProps> = ({ visible, onAccept }) => {
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            statusBarTranslucent
        >
            <YStack f={1} bc="rgba(0,0,0,0.8)" jc="center" ai="center">
                <YStack
                    bg="white"
                    w="90%"
                    maxH="70%"
                    br={24}
                    elevation={20}
                    ov="hidden"
                >
                    {/* Header */}
                    <YStack p="$4" bg={`${COLORS.teal}05`} ai="center" bbw={0.5} bbc={COLORS.sandMid}>
                        <ShieldCheck size={28} color={COLORS.teal} />
                        <SizableText size="$5" fow="900" mt="$2" color={COLORS.textDark}>Privacy Consent</SizableText>
                        <SizableText size="$1" fow="700" color={COLORS.teal} ls={0.5}>RA 10173 COMPLIANCE</SizableText>
                    </YStack>

                    {/* Scrollable Content Area */}
                    <ScrollView showsVerticalScrollIndicator={true}>
                        <YStack p="$4" gap="$4">
                            <SizableText size="$2" color={COLORS.textMid} fow="500" lh={18}>
                                We protect your <SizableText fow="700" color={COLORS.textDark}>biometric voice data</SizableText> in accordance with the Data Privacy Act.
                            </SizableText>

                            <YStack gap="$3">
                                <InfoItem 
                                    icon={<Mic2 size={18} color={COLORS.royalBlue} />}
                                    title="Voice Recording"
                                    description="Used for speech analysis and clarity correction."
                                    bgColor={`${COLORS.royalBlue}08`}
                                />
                                <InfoItem 
                                    icon={<Database size={18} color={COLORS.teal} />}
                                    title="Usage & Storage"
                                    description="Securely stored in Supabase Cloud servers."
                                    bgColor={`${COLORS.teal}08`}
                                />
                                <InfoItem 
                                    icon={<Trash2 size={18} color="#EF4444" />}
                                    title="Your Rights"
                                    description="Access or delete your recordings and account any time."
                                    bgColor="#EF444410"
                                />
                            </YStack>

                            <YStack bg={`${COLORS.orbSand}40`} p="$3" br={12} gap="$1">
                                <SizableText size="$1" fow="800" color={COLORS.textDark}>Compliance Note</SizableText>
                                <SizableText size="$1" color={COLORS.textMid} fow="500" lh={14}>
                                    By continuing, you agree to our data processing and confirm you have speaker consent for all recordings.
                                </SizableText>
                            </YStack>
                        </YStack>
                    </ScrollView>

                    {/* Footer */}
                    <YStack p="$4" btw={0.5} btc={COLORS.sandMid} bg="white">
                        <Button 
                            bg={COLORS.royalBlue} 
                            h={50} 
                            br={12} 
                            onPress={onAccept}
                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                        >
                            <SizableText color="white" fow="800" size="$3">Accept & Continue</SizableText>
                        </Button>
                    </YStack>
                </YStack>
            </YStack>
        </Modal>
    );
};

const InfoItem = ({ icon, title, description, bgColor }: { icon: any, title: string, description: string, bgColor: string }) => (
    <XStack gap="$3" ai="center">
        <Circle size={36} bg={bgColor} ai="center" jc="center">
            {icon}
        </Circle>
        <YStack f={1}>
            <SizableText size="$2" fow="800" color={COLORS.textDark}>
                {title}
            </SizableText>
            <SizableText size="$1" fow="500" color={COLORS.textMid} lh={14}>
                {description}
            </SizableText>
        </YStack>
    </XStack>
);
