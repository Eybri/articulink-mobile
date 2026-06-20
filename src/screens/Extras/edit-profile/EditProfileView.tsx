import React, { useMemo } from "react";
import { Platform, StatusBar, Image as RNImage, Pressable } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { YStack, XStack, Button, Circle, SizableText, Spinner, Input, ScrollView } from "tamagui";
import { Camera, Save, X, Calendar, UserCircle, User, Fingerprint, AtSign } from "@tamagui/lucide-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from "./../../../constants/colors";
import { EditProfileRow, EditProfileCard, AvatarPickerSheet, GenderPickerSheet } from "./components/EditProfileComponents";
import { getProfileSource } from "./../../../utils/imageHelper";

interface EditProfileViewProps {
    vm: any;
    navigation: any;
}

export const EditProfileView: React.FC<EditProfileViewProps> = ({ vm, navigation }) => {
    const genderOptions = useMemo(() => [
        { label: "Male", value: "male" },
        { label: "Female", value: "female" },
        { label: "Other", value: "other" },
    ], []);

    return (
        <YStack f={1} bg="#FFFFFF">
            <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

            {/* Top Background Gradient */}
            <LinearGradient
                colors={['rgba(42, 95, 168, 0.8)', 'rgba(42, 95, 168, 0.1)']}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '40%' }}
            />

            {/* Custom Header */}
            <XStack ai="center" jc="space-between" pt={Platform.OS === 'ios' ? 55 : 45} pb={10} px={20} zIndex={10}>
                <Button
                    size="$3"
                    circular
                    icon={<X size={20} color={COLORS.textDark} />}
                    bg={COLORS.white}
                    elevation={2}
                    shadowColor="#000"
                    shadowOpacity={0.1}
                    shadowRadius={5}
                    shadowOffset={{ width: 0, height: 2 }}
                    onPress={() => navigation.goBack()}
                />
                <SizableText fow="700" size="$5" color="white" textShadowColor="rgba(0,0,0,0.1)" textShadowRadius={4} textShadowOffset={{ width: 0, height: 1 }}>
                    Edit Profile
                </SizableText>
                <YStack w={40} />
            </XStack>

            <ScrollView f={1} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>
                {/* Spacer to push content down into the gradient */}
                <YStack h={120} />

                {/* Main White Sheet Overlapping the Gradient */}
                <YStack bg="white" borderTopLeftRadius={32} borderTopRightRadius={32} px={24} pb={40} f={1} elevation={10} shadowColor="#000" shadowOpacity={0.05} shadowRadius={20} shadowOffset={{ width: 0, height: -5 }} position="relative">

                    {/* Floating Avatar Header */}
                    <YStack ai="center" mt={-50} mb={30}>
                        <Pressable onPress={() => vm.setShowIconModal(true)}>
                            <YStack w={110} h={110} jc="center" ai="center">
                                <Circle size={110} bg="white" bw={4} bc="white" elevation={8} shadowColor="#000" shadowOpacity={0.15} shadowRadius={15} ov="hidden">
                                    {vm.uploading ? (
                                        <Spinner color={COLORS.royalBlue} size="large" />
                                    ) : vm.profilePic ? (
                                        <RNImage source={getProfileSource(vm.profilePic)} style={{ width: 102, height: 102, borderRadius: 51 }} />
                                    ) : (
                                        <UserCircle size={56} color={COLORS.royalBlue} strokeWidth={1} opacity={0.3} />
                                    )}
                                </Circle>
                                <Circle
                                    pos="absolute" b={2} r={2} size={32} bg={COLORS.royalBlue}
                                    jc="center" ai="center" bw={2} bc="white" elevation={4}
                                >
                                    <Camera size={14} color="white" />
                                </Circle>
                            </YStack>
                        </Pressable>

                        <YStack ai="center" mt={16} gap="$1">
                            <SizableText size="$5" fow="800" color={COLORS.textDark} ls={-0.5}>
                                {vm.firstName && vm.lastName ? `${vm.firstName} ${vm.lastName}` : (vm.username || "User")}
                            </SizableText>
                            <SizableText size="$3" fow="600" color={COLORS.textMid}>
                                @{vm.username || "username"}
                            </SizableText>
                        </YStack>
                    </YStack>

                    {/* Identity Form */}
                    <YStack gap="$5" mt="$2">
                        {/* Display Username */}
                        <YStack gap="$2">
                            <SizableText size="$2" color="#64748B" fow="600" ml="$1">Display Username</SizableText>
                            <YStack bg="#F8FAFC" br={12} bw={1} bc="#E2E8F0" px={16} py={Platform.OS === 'ios' ? 14 : 4}>
                                <Input
                                    bg="transparent" bw={0} size="$4"
                                    fontWeight="600" color="#1E293B"
                                    value={vm.username} onChangeText={vm.setUsername}
                                    placeholder="Enter username" autoCapitalize="none"
                                    p={0} h={Platform.OS === 'ios' ? 'auto' : 40}
                                    focusStyle={{ bw: 0 }}
                                />
                            </YStack>
                        </YStack>

                        {/* First Name */}
                        <YStack gap="$2">
                            <SizableText size="$2" color="#64748B" fow="600" ml="$1">First Name</SizableText>
                            <YStack bg="#F8FAFC" br={12} bw={1} bc="#E2E8F0" px={16} py={Platform.OS === 'ios' ? 14 : 4}>
                                <Input
                                    bg="transparent" bw={0} size="$4"
                                    fontWeight="600" color="#1E293B"
                                    value={vm.firstName} onChangeText={vm.setFirstName}
                                    placeholder="First Name" autoCapitalize="words"
                                    p={0} h={Platform.OS === 'ios' ? 'auto' : 40}
                                    focusStyle={{ bw: 0 }}
                                />
                            </YStack>
                        </YStack>

                        {/* Last Name */}
                        <YStack gap="$2">
                            <SizableText size="$2" color="#64748B" fow="600" ml="$1">Last Name</SizableText>
                            <YStack bg="#F8FAFC" br={12} bw={1} bc="#E2E8F0" px={16} py={Platform.OS === 'ios' ? 14 : 4}>
                                <Input
                                    bg="transparent" bw={0} size="$4"
                                    fontWeight="600" color="#1E293B"
                                    value={vm.lastName} onChangeText={vm.setLastName}
                                    placeholder="Last Name" autoCapitalize="words"
                                    p={0} h={Platform.OS === 'ios' ? 'auto' : 40}
                                    focusStyle={{ bw: 0 }}
                                />
                            </YStack>
                        </YStack>

                        {/* Birth Date */}
                        <YStack gap="$2">
                            <SizableText size="$2" color="#64748B" fow="600" ml="$1">Date of Birth</SizableText>
                            <Pressable onPress={() => vm.setShowDatePicker(true)}>
                                <XStack bg="#F8FAFC" br={12} bw={1} bc="#E2E8F0" px={16} py={16} ai="center" jc="space-between">
                                    <SizableText size="$4" color={vm.birthdate ? "#1E293B" : "#94A3B8"} fow="600">
                                        {vm.birthdate ? vm.birthdate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : (vm.birthdateText || "Select Date")}
                                    </SizableText>
                                    <Calendar size={18} color="#94A3B8" />
                                </XStack>
                            </Pressable>
                        </YStack>

                        {/* Gender (Inline Buttons) */}
                        <YStack gap="$2">
                            <SizableText size="$2" color="#64748B" fow="600" ml="$1">Gender</SizableText>
                            <XStack gap="$3">
                                {genderOptions.map((option) => {
                                    const isSelected = vm.gender === option.value;
                                    return (
                                        <Pressable key={option.value} onPress={() => vm.setGender(option.value)} style={{ flex: 1 }}>
                                            <XStack 
                                                f={1} bg={isSelected ? "#EEF2FF" : "#F8FAFC"} 
                                                br={12} bw={1} bc={isSelected ? COLORS.royalBlue : "#E2E8F0"} 
                                                py={14} ai="center" jc="center" gap="$2"
                                            >
                                                <Circle size={16} bw={1.5} bc={isSelected ? COLORS.royalBlue : "#94A3B8"} ai="center" jc="center">
                                                    {isSelected && <Circle size={8} bg={COLORS.royalBlue} />}
                                                </Circle>
                                                <SizableText size="$3" color={isSelected ? COLORS.royalBlue : "#64748B"} fow={isSelected ? "700" : "600"}>
                                                    {option.label}
                                                </SizableText>
                                            </XStack>
                                        </Pressable>
                                    );
                                })}
                            </XStack>
                        </YStack>

                        {/* Action Buttons */}
                        <YStack gap="$3" mt="$4">
                            <Button
                                bg={COLORS.royalBlue} h={56} br={16}
                                elevation={4} shadowColor={COLORS.royalBlue} shadowOpacity={0.3} shadowRadius={8} shadowOffset={{ width: 0, height: 4 }}
                                onPress={vm.handleUpdateProfile} disabled={vm.loading}
                                iconAfter={vm.loading ? <Spinner color="white" /> : <Save size={18} color="white" />}
                                pressStyle={{ scale: 0.98, opacity: 0.9 }}
                            >
                                <SizableText color="white" fow="700" size="$4">Save Changes</SizableText>
                            </Button>

                            <Button
                                bg="transparent" h={50} br={16}
                                onPress={() => navigation.goBack()} disabled={vm.loading}
                                pressStyle={{ bg: `rgba(138, 150, 164, 0.05)`, scale: 0.98 }}
                                chromeless
                            >
                                <SizableText color={COLORS.textMid} fow="600" size="$3">Cancel</SizableText>
                            </Button>
                        </YStack>
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
