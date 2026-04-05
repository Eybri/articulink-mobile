import React, { useMemo } from "react";
import {
    Platform,
    StatusBar,
    Image as RNImage,
    Modal,
    Pressable,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import Svg, { Path } from "react-native-svg";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Circle,
    SizableText,
    Card,
    Spinner,
    Input,
    ScrollView,
} from "tamagui";
import {
    Camera,
    Trash2,
    Save,
    X,
    Calendar,
    ChevronRight,
    UserCircle,
    User,
    Shield,
    Fingerprint,
    AtSign,
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { SoftOrb, SectionHeader, FieldLabel, AvatarPickerSheet, EditProfileRow, EditProfileCard } from "./components/EditProfileComponents";
import { getProfileSource } from "./../../../utils/imageHelper";

interface EditProfileViewProps {
    vm: any;
    navigation: any;
}

const BackgroundDecor = React.memo(({ width, height }: { width: number; height: number }) => (
    <ZStack pos="absolute" fullscreen pointerEvents="none">
        <Circle pos="absolute" t={-height * 0.1} r={-width * 0.25} size={width * 0.9} bg={COLORS.sandLight} opacity={0.35} />
        <Circle pos="absolute" b={-height * 0.15} l={-width * 0.2} size={width * 0.8} bg={COLORS.orbTeal} opacity={0.15} />
        <Circle pos="absolute" t={height * 0.4} r={-width * 0.1} size={width * 0.2} bg={COLORS.orbSand} opacity={0.2} />
    </ZStack>
));

export const EditProfileView: React.FC<EditProfileViewProps> = ({ vm, navigation }) => {
    const genderOptions = useMemo(() => [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
        { label: "Prefer not to say", value: "prefer_not_to_say" },
    ], []);

    return (
        <YStack f={1} bg={COLORS.cream}>
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            <BackgroundDecor width={vm.width} height={vm.height} />

            <ScrollView f={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
                {/* Sophisticated Header Backdrop (Lowered & Ambient) */}
                <YStack h={180} bg={COLORS.royalBlue} pos="relative" bblr={42} bbrr={42} ov="hidden">
                    <YStack pos="absolute" t={0} l={0} r={0} b={0} bg="black" opacity={0.15} />

                    {/* Header Identity Card (Premium Finish) */}
                    <XStack
                        pos="absolute" b={28} l="$5" r="$5"
                        bg="white" br={26} p="$3.5" ai="center" gap="$4"
                        elevation={15} shadowColor="rgba(0,0,0,0.12)"
                        bw={1.5} bc="rgba(255,255,255,0.4)"
                    >
                        {/* Avatar on Left */}
                        <Pressable onPress={() => vm.setShowIconModal(true)}>
                            <YStack w={94} h={94} jc="center" ai="center">
                                <Circle size={94} bg={COLORS.warmWhite} bw={1.5} bc={COLORS.sandMid} ov="hidden">
                                    {vm.uploading ? (
                                        <Spinner color={COLORS.royalBlue} />
                                    ) : vm.profilePic ? (
                                        <RNImage source={getProfileSource(vm.profilePic)} style={{ width: 88, height: 88, borderRadius: 44 }} />
                                    ) : (
                                        <UserCircle size={52} color={COLORS.royalBlue} strokeWidth={1} opacity={0.3} />
                                    )}
                                </Circle>
                                <Circle 
                                    pos="absolute" b={0} r={0} size={28} bg={COLORS.teal} 
                                    jc="center" ai="center" bw={2} bc="white" elevation={4}
                                >
                                    <Camera size={11} color="white" />
                                </Circle>
                            </YStack>
                        </Pressable>

                        {/* Details on Right */}
                        <YStack f={1} gap="$1.5">
                            <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.4}>
                                @{vm.username || "username"}
                            </SizableText>
                            
                            <XStack gap="$2.5">
                                <Button
                                    h={30} br={15} px="$4" bg={COLORS.royalBlue}
                                    onPress={() => vm.setShowIconModal(true)}
                                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                >
                                    <SizableText color="white" fow="700" size="$1" ls={0.5} tt="uppercase">Modify</SizableText>
                                </Button>

                                {vm.profilePic && !vm.availableIcons.includes(vm.profilePic) && (
                                    <Button
                                        h={30} br={15} px="$4" bg="white" bw={1} bc={`${COLORS.error}40`}
                                        onPress={vm.handleDeleteProfilePic}
                                        pressStyle={{ scale: 0.98, bg: `${COLORS.error}08` }}
                                    >
                                        <SizableText size="$1" fow="700" color={COLORS.error} ls={0.5} tt="uppercase">Remove</SizableText>
                                    </Button>
                                )}
                            </XStack>
                        </YStack>
                    </XStack>
                </YStack>

                {/* Simplified Identity Form (Settings Style) */}
                <YStack px="$5" mt="$8" gap="$5">
                    <XStack ai="center" gap="$2" mb="$1" ml="$2">
                        <Fingerprint size={14} color={COLORS.royalBlue} />
                        <SizableText size="$2" fontWeight="800" color={COLORS.royalBlue} textTransform="uppercase" ls={1.5}>Identity & Profile</SizableText>
                    </XStack>

                    <EditProfileCard>
                        <EditProfileRow icon={<AtSign size={18} color={COLORS.royalBlue} />} title="Personal Username">
                            <Input
                                f={1} bg="transparent" bw={0} size="$4"
                                fontWeight="500" color={COLORS.textDark}
                                value={vm.username} onChangeText={vm.setUsername}
                                placeholder="Username" autoCapitalize="none"
                                p={0} h={36} textAlign="left"
                                w="100%"
                            />
                        </EditProfileRow>

                        <EditProfileRow icon={<User size={18} color={COLORS.royalBlue} />} title="Gender Identity">
                            <YStack f={1} h={52} jc="center">
                                <Picker
                                    selectedValue={vm.gender}
                                    onValueChange={(itemValue) => vm.setGender(itemValue)}
                                    style={{ height: 50, width: 220, color: COLORS.textDark, backgroundColor: 'transparent', marginLeft: -12 }}
                                    dropdownIconColor={COLORS.royalBlue}
                                    mode="dropdown"
                                >
                                    <Picker.Item label="Select Gender" value="" color={COLORS.textMid} />
                                    {genderOptions.map(opt => (
                                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} color={COLORS.textDark} />
                                    ))}
                                </Picker>
                            </YStack>
                        </EditProfileRow>

                        <EditProfileRow 
                            icon={<Calendar size={18} color={COLORS.royalBlue} />} 
                            title="Date of Birth"
                            isLast
                            onPress={() => vm.setShowDatePicker(true)}
                            description={vm.birthdate ? vm.birthdate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (vm.birthdateText || "Not Set")}
                        >
                            <ChevronRight size={18} color={COLORS.sandMid} />
                        </EditProfileRow>
                    </EditProfileCard>

                    {/* Action Buttons */}
                    <YStack gap="$3" mt="$6" pb="$2">
                        <Button
                            bg={COLORS.royalBlue} h={62} br={22}
                            elevation={8} shadowColor={COLORS.royalBlue}
                            onPress={vm.handleUpdateProfile} disabled={vm.loading}
                            iconAfter={vm.loading ? <Spinner color="white" /> : <Save size={20} color="white" />}
                            pressStyle={{ scale: 0.97, opacity: 0.95 }}
                        >
                            <SizableText color="white" fow="800" size="$4" ls={0.5}>SAVE CHANGES</SizableText>
                        </Button>

                        <Button
                            bg="rgba(138, 150, 164, 0.08)" h={54} br={20}
                            onPress={() => navigation.goBack()} disabled={vm.loading}
                            pressStyle={{ bg: `rgba(138, 150, 164, 0.15)`, scale: 0.98 }}
                        >
                            <SizableText color={COLORS.textMid} fow="700" size="$3" ls={0.2}>Cancel & Discard</SizableText>
                        </Button>
                    </YStack>
                </YStack>
            </ScrollView>

            <AvatarPickerSheet 
                visible={vm.showIconModal}
                onClose={() => vm.setShowIconModal(false)}
                onPickImage={vm.handlePickImage}
                onSelectIcon={vm.handleSelectIcon}
                selectedIcon={vm.profilePic}
                availableIcons={vm.availableIcons}
            />

            {vm.showDatePicker && (
                <DateTimePicker
                    value={vm.birthdate || new Date()}
                    mode="date"
                    display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                    onChange={(event: any, selectedDate?: Date) => {
                        vm.setShowDatePicker(Platform.OS === 'ios');
                        if (selectedDate) {
                            vm.setBirthdate(selectedDate);
                            vm.setBirthdateText("");
                        }
                    }}
                />
            )}
        </YStack>
    );
};
