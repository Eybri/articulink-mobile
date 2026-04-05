import React, { useMemo } from "react";
import {
  Platform,
  StatusBar,
  Image as RNImage,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
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
} from "@tamagui/lucide-icons";
import { COLORS } from "./../../../constants/colors";
import { SoftOrb, SectionHeader, FieldLabel } from "./components/EditProfileComponents";

interface EditProfileViewProps {
    vm: any;
    navigation: any;
}

export const EditProfileView: React.FC<EditProfileViewProps> = ({ vm, navigation }) => {
    const orbs = useMemo(() => ([
        { color: COLORS.orbBlue, size: vm.width * 0.65, x: vm.width * 0.88, y: vm.height * 0.07, duration: 6000, delay: 0 },
        { color: COLORS.orbTeal, size: vm.width * 0.5, x: vm.width * 0.08, y: vm.height * 0.46, duration: 7200, delay: 900 },
        { color: COLORS.orbSand, size: vm.width * 0.38, x: vm.width * 0.65, y: vm.height * 0.82, duration: 5500, delay: 500 },
    ]), [vm.width, vm.height]);

    const genderOptions = [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
        { label: "Prefer not to say", value: "prefer_not_to_say" },
    ];

    return (
        <YStack f={1} bg="#F0F5FB">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Background Orbs */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <Circle pos="absolute" t={-vm.height * 0.1} r={-vm.width * 0.15} size={vm.width * 0.95} bg={COLORS.orbBlue} opacity={0.5} />
                <Circle pos="absolute" b={-vm.height * 0.06} l={-vm.width * 0.2} size={vm.width * 0.8} bg={COLORS.orbTeal} opacity={0.2} />
                {orbs.map((orb: any, i: number) => <SoftOrb key={i} {...orb} />)}
            </ZStack>

            <ScrollView f={1} contentContainerStyle={{ padding: 20, paddingTop: Platform.OS === "android" ? 44 : 56, paddingBottom: 60 }} showsVerticalScrollIndicator={false}>
                {/* Banner */}
                <Card bg="white" br={24} mb="$4" ov="hidden" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.orbBlue} flexDirection="row">
                    <YStack w={4} bg={COLORS.mediumBlue} br={24} />
                    <YStack pos="absolute" t={0} l={0} r={0} h={65} bg={`${COLORS.mediumBlue}07`} br={24} />
                    
                    <XStack f={1} p="$4" py="$5" ai="center" gap="$4">
                        <YStack pos="relative" w={80} h={80} jc="center" ai="center">
                            <Circle pos="absolute" size={80} bg={COLORS.orbBlue} opacity={0.5} />
                            <YStack w={68} h={68} br={20} bg={`${COLORS.mediumBlue}0D`} bw={1.5} bc={`${COLORS.mediumBlue}22`} jc="center" ai="center" ov="hidden">
                                {vm.uploading ? (
                                    <Spinner size="small" color={COLORS.mediumBlue} />
                                ) : vm.profilePic ? (
                                    <RNImage source={{ uri: vm.profilePic }} style={{ width: 68, height: 68, borderRadius: 20 }} />
                                ) : (
                                    <UserCircle size={38} color={COLORS.mediumBlue} strokeWidth={1.5} />
                                )}
                            </YStack>
                            <Button
                                pos="absolute"
                                b={2}
                                r={2}
                                w={26}
                                h={26}
                                br={9}
                                bg={COLORS.mediumBlue}
                                p={0}
                                onPress={vm.handlePickImage}
                                disabled={vm.uploading}
                                icon={<Camera size={12} color="white" />}
                            />
                        </YStack>

                        <YStack f={1}>
                            <SizableText size="$5" fow="800" color={COLORS.textDark} ls={-0.4}>
                                {vm.firstName || vm.lastName ? `${vm.firstName} ${vm.lastName}`.trim() : "Your Name"}
                            </SizableText>
                            <SizableText size="$2" color={COLORS.textMid} fow="500">Tap camera to update photo</SizableText>
                            {vm.profilePic && (
                                <XStack ai="center" mt="$2" gap="$1" onPress={vm.handleDeleteProfilePic}>
                                    <Trash2 size={11} color={COLORS.error} />
                                    <SizableText size="$1" fow="700" color={COLORS.error} textTransform="uppercase">Remove photo</SizableText>
                                </XStack>
                            )}
                        </YStack>
                    </XStack>
                </Card>

                {/* Personal Info */}
                <Card bg="white" br={24} p="$5" mb="$4" elevation={5} shadowColor="#8A96A4" bw={1} bc={COLORS.orbBlue} ov="hidden">
                    <YStack pos="absolute" t={0} l={0} r={0} h={4} bg={COLORS.royalBlue} />
                    <YStack pos="absolute" t={0} l={0} r={0} h={40} bg={`${COLORS.royalBlue}05`} />
                    
                    <SectionHeader icon={<User size={15} color={COLORS.royalBlue} />} title="Personal Information" />

                    <YStack gap="$4">
                        <YStack>
                            <FieldLabel text="First Name" />
                            <Input
                                bg={COLORS.warmWhite}
                                br={14}
                                h={50}
                                px="$4"
                                size="$4"
                                bw={1.5}
                                bc={COLORS.sandMid}
                                focusStyle={{ bc: COLORS.mediumBlue }}
                                value={vm.firstName}
                                onChangeText={vm.setFirstName}
                                placeholder="Enter first name"
                            />
                        </YStack>

                        <YStack>
                            <FieldLabel text="Last Name" />
                            <Input
                                bg={COLORS.warmWhite}
                                br={14}
                                h={50}
                                px="$4"
                                size="$4"
                                bw={1.5}
                                bc={COLORS.sandMid}
                                focusStyle={{ bc: COLORS.mediumBlue }}
                                value={vm.lastName}
                                onChangeText={vm.setLastName}
                                placeholder="Enter last name"
                            />
                        </YStack>

                        <YStack>
                            <FieldLabel text="Gender" />
                            <YStack bg={COLORS.warmWhite} br={14} bw={1.5} bc={COLORS.sandMid} ov="hidden">
                                <Picker
                                    selectedValue={vm.gender}
                                    onValueChange={(itemValue) => vm.setGender(itemValue)}
                                    style={{ height: 50, color: COLORS.textDark }}
                                >
                                    <Picker.Item label="Select gender" value="" color={COLORS.textMid} />
                                    {genderOptions.map(opt => (
                                        <Picker.Item key={opt.value} label={opt.label} value={opt.value} />
                                    ))}
                                </Picker>
                            </YStack>
                        </YStack>

                        <YStack>
                            <FieldLabel text="Birthdate" />
                            <Button
                                bg={COLORS.warmWhite}
                                br={14}
                                h={50}
                                px="$4"
                                jc="space-between"
                                bw={1.5}
                                bc={COLORS.sandMid}
                                onPress={() => vm.setShowDatePicker(true)}
                            >
                                <SizableText color={vm.birthdate ? COLORS.textDark : `${COLORS.textMid}60`} fow="500">
                                    {vm.birthdate ? vm.birthdate.toDateString() : "Select birthdate"}
                                </SizableText>
                                <Calendar size={18} color={COLORS.mediumBlue} />
                            </Button>
                        </YStack>
                    </YStack>
                </Card>

                {vm.showDatePicker && (
                    <DateTimePicker
                        value={vm.birthdate || new Date()}
                        mode="date"
                        display="default"
                        onChange={(e, d) => {
                            vm.setShowDatePicker(false);
                            if (d) vm.setBirthdate(d);
                        }}
                    />
                )}

                {/* Action Buttons */}
                <YStack gap="$3" mt="$4">
                    <Button
                        bg={COLORS.mediumBlue}
                        h={56}
                        br={16}
                        elevation={4}
                        onPress={vm.handleUpdateProfile}
                        disabled={vm.loading}
                        iconAfter={vm.loading ? <Spinner color="white" /> : <Save size={16} color="white" />}
                        pressStyle={{ scale: 0.98, opacity: 0.9 }}
                    >
                        <SizableText color="white" fow="800" size="$4">Save Changes</SizableText>
                        <YStack f={1} />
                        <ChevronRight size={18} color="rgba(255,255,255,0.6)" />
                    </Button>

                    <Button
                        bg="white"
                        h={56}
                        br={16}
                        bw={1}
                        bc={COLORS.sandMid}
                        onPress={() => navigation.goBack()}
                        disabled={vm.loading}
                        iconAfter={<X size={16} color={COLORS.textMid} />}
                        pressStyle={{ scale: 0.98, bg: COLORS.warmWhite }}
                    >
                        <SizableText color={COLORS.textMid} fow="800" size="$4">Cancel</SizableText>
                        <YStack f={1} />
                        <ChevronRight size={18} color={`${COLORS.textMid}50`} />
                    </Button>
                </YStack>
            </ScrollView>
        </YStack>
    );
};
