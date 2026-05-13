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
import { SoftOrb, SectionHeader, FieldLabel, AvatarPickerSheet, EditProfileRow, EditProfileCard, GenderPickerSheet } from "./components/EditProfileComponents";
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
                {/* Sophisticated Header Backdrop (More integrated) */}
                <YStack h={160} bg={COLORS.royalBlue} pos="relative" bblr={32} bbrr={32} ov="hidden">
                    <YStack pos="absolute" t={0} l={0} r={0} b={0} bg="black" opacity={0.1} />
                    <ZStack pos="absolute" fullscreen pointerEvents="none">
                        <Circle size={200} bg="white" opacity={0.05} t={-100} l={-50} />
                        <Circle size={150} bg="white" opacity={0.03} b={-50} r={-20} />
                    </ZStack>
                </YStack>

                {/* Header Identity Card (Floating Premium) */}
                <YStack px="$5" mt={-60}>
                    <XStack
                        bg="white" br={24} p="$3.5" ai="center" gap="$4"
                        elevation={4} shadowColor="rgba(0,0,0,0.1)"
                        bw={1} bc={COLORS.sandMid}
                    >
                        <Pressable onPress={() => vm.setShowIconModal(true)}>
                            <YStack w={80} h={80} jc="center" ai="center">
                                <Circle size={80} bg={COLORS.warmWhite} bw={1.5} bc={COLORS.sandMid} ov="hidden">
                                    {vm.uploading ? (
                                        <Spinner color={COLORS.royalBlue} />
                                    ) : vm.profilePic ? (
                                        <RNImage source={getProfileSource(vm.profilePic)} style={{ width: 76, height: 76, borderRadius: 38 }} />
                                    ) : (
                                        <UserCircle size={44} color={COLORS.royalBlue} strokeWidth={1} opacity={0.3} />
                                    )}
                                </Circle>
                                <Circle 
                                    pos="absolute" b={-2} r={-2} size={28} bg={COLORS.teal} 
                                    jc="center" ai="center" bw={2} bc="white" elevation={4}
                                >
                                    <Camera size={11} color="white" />
                                </Circle>
                            </YStack>
                        </Pressable>
 
                        <YStack f={1} gap="$1">
                            <SizableText size="$2" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.6}>
                                Active Profile
                            </SizableText>
                            <SizableText size="$5" fow="900" color={COLORS.textDark} ls={-0.5} mt={-2}>
                                {vm.firstName && vm.lastName ? `${vm.firstName} ${vm.lastName}` : (vm.username || "User")}
                            </SizableText>
                            <SizableText size="$1" fow="600" color={COLORS.royalBlue} opacity={0.7} mt={-3}>
                                @{vm.username || "username"}
                            </SizableText>
                            
                            <XStack gap="$2" mt="$1">
                                <Button
                                    h={28} br={14} px="$3" bg={`${COLORS.royalBlue}10`}
                                    onPress={() => vm.setShowIconModal(true)}
                                    pressStyle={{ scale: 0.96, bg: `${COLORS.royalBlue}15` }}
                                    chromeless
                                >
                                    <SizableText color={COLORS.royalBlue} fow="800" size="$1" ls={0.3}>CHANGE ICON</SizableText>
                                </Button>
 
                                {vm.profilePic && !vm.availableIcons.includes(vm.profilePic) && (
                                    <Button
                                        h={28} br={14} px="$3" bg="white" bw={1} bc="#FEE2E2"
                                        onPress={vm.handleDeleteProfilePic}
                                        pressStyle={{ scale: 0.96, bg: "#FEF2F2" }}
                                        chromeless
                                    >
                                        <SizableText size="$1" fow="800" color="#DC2626" ls={0.3}>REMOVE</SizableText>
                                    </Button>
                                )}
                            </XStack>
                        </YStack>
                    </XStack>
                </YStack>
 
                {/* Identity Form */}
                <YStack px="$5" mt="$6" gap="$5">
                    <XStack ai="center" gap="$2" mb="$1" ml="$1">
                        <Fingerprint size={12} color={COLORS.royalBlue} opacity={0.6} />
                        <SizableText size="$1" fontWeight="800" color={COLORS.textMid} textTransform="uppercase" ls={1.2} opacity={0.5}>Identity Details</SizableText>
                    </XStack>
 
                    <EditProfileCard>
                        <EditProfileRow icon={<AtSign size={18} color={COLORS.royalBlue} />} title="Display Username">
                            <Input
                                f={1} bg="transparent" bw={0} size="$4"
                                fontWeight="600" color={COLORS.textDark}
                                value={vm.username} onChangeText={vm.setUsername}
                                placeholder="Username" autoCapitalize="none"
                                p={0} h={40} textAlign="left"
                                w="100%"
                                focusStyle={{ bw: 0 }}
                            />
                        </EditProfileRow>

                        <EditProfileRow icon={<User size={18} color={COLORS.royalBlue} />} title="First Name">
                            <Input
                                f={1} bg="transparent" bw={0} size="$4"
                                fontWeight="600" color={COLORS.textDark}
                                value={vm.firstName} onChangeText={vm.setFirstName}
                                placeholder="Avery" autoCapitalize="words"
                                p={0} h={40} textAlign="left"
                                w="100%"
                                focusStyle={{ bw: 0 }}
                            />
                        </EditProfileRow>

                        <EditProfileRow icon={<User size={18} color={COLORS.royalBlue} />} title="Last Name">
                            <Input
                                f={1} bg="transparent" bw={0} size="$4"
                                fontWeight="600" color={COLORS.textDark}
                                value={vm.lastName} onChangeText={vm.setLastName}
                                placeholder="MacasaS" autoCapitalize="words"
                                p={0} h={40} textAlign="left"
                                w="100%"
                                focusStyle={{ bw: 0 }}
                            />
                        </EditProfileRow>
 
                        <EditProfileRow 
                            icon={<User size={18} color={COLORS.royalBlue} />} 
                            title="Gender Preference"
                            onPress={() => vm.setShowGenderModal(true)}
                            description={vm.gender ? (genderOptions.find(o => o.value === vm.gender)?.label || vm.gender) : "Not Set"}
                        />
 
                        <EditProfileRow 
                            icon={<Calendar size={18} color={COLORS.royalBlue} />} 
                            title="Birth Date"
                            isLast
                            onPress={() => vm.setShowDatePicker(true)}
                            description={vm.birthdate ? vm.birthdate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (vm.birthdateText || "Not Set")}
                        />
                    </EditProfileCard>
 
                    {/* Action Buttons */}
                    <YStack gap="$3" mt="$4" pb="$4">
                        <Button
                            bg={COLORS.royalBlue} h={60} br={20}
                            elevation={4} shadowColor={COLORS.royalBlue}
                            onPress={vm.handleUpdateProfile} disabled={vm.loading}
                            iconAfter={vm.loading ? <Spinner color="white" /> : <Save size={18} color="white" />}
                            pressStyle={{ scale: 0.98, opacity: 0.9 }}
                        >
                            <SizableText color="white" fow="800" size="$4" ls={0.5}>SAVE CHANGES</SizableText>
                        </Button>
 
                        <Button
                            bg="transparent" h={54} br={20}
                            onPress={() => navigation.goBack()} disabled={vm.loading}
                            pressStyle={{ bg: `rgba(138, 150, 164, 0.05)`, scale: 0.98 }}
                            chromeless
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

            <GenderPickerSheet 
                visible={vm.showGenderModal}
                onClose={() => vm.setShowGenderModal(false)}
                onSelect={vm.setGender}
                selectedGender={vm.gender}
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
