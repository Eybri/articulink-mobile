import React from "react";
import {
    Platform,
    KeyboardAvoidingView,
    Modal,
    Pressable,
    Image as RNImage,
    Animated,
    Dimensions,
} from "react-native";
import {
    YStack,
    XStack,
    ZStack,
    Button,
    Input,
    SizableText,
    Circle,
    ScrollView,
    Spinner,
} from "tamagui";
import {
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    Check,
    Calendar,
    ChevronDown,
    ArrowRight,
} from "@tamagui/lucide-icons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { COLORS } from "./../../../constants/colors";
import { getProfileSource } from "./../../../utils/imageHelper";

const { height } = Dimensions.get('window');

interface PasswordCheckProps {
    met: boolean;
    text: string;
}

const PasswordCheck: React.FC<PasswordCheckProps> = ({ met, text }) => (
    <XStack ai="center" gap="$1.5">
        <YStack w={14} h={14} br={7} bg={met ? COLORS.success : COLORS.sandMid} jc="center" ai="center">
            {met && <Check size={8} color="white" />}
        </YStack>
        <SizableText size="$1" color={met ? COLORS.success : COLORS.textMid}>{text}</SizableText>
    </XStack>
);

interface RegisterViewProps {
    vm: any; // Using vm for ViewModel for brevity, could use a proper interface.
    navigation: any;
}

export const RegisterView: React.FC<RegisterViewProps> = ({ vm, navigation }) => {
    return (
        <YStack f={1} bg={COLORS.royalBlue}>
            {/* Background Layer */}
            <ZStack pos="absolute" fullscreen pointerEvents="none">
                <RNImage
                    source={require('../../../../assets/images/bg.jpg')}
                    style={{ width: '100%', height: '100%', position: 'absolute' }}
                    resizeMode="cover"
                />
                <YStack fullscreen bg="black" opacity={0.25} />

                {/* Bottom text + logo */}
                <YStack pos="absolute" b={0} l={0} r={0} h={height * 0.22} jc="center" ai="center" gap="$1">
                    <Animated.View style={{ opacity: vm.animations.logoFade, transform: [{ scale: vm.animations.logoScale }] }}>
                        <RNImage
                            source={require('../../../../assets/images/icon-white.png')}
                            style={{ width: 65, height: 65 }}
                            resizeMode="contain"
                        />
                    </Animated.View>
                    <Animated.View style={{ opacity: vm.animations.textFade }}>
                        <YStack ai="center" gap="$1">
                            <SizableText size="$3" fow="700" color="white" ls={0.3}>Join Articulink</SizableText>
                            <SizableText size="$1" color="rgba(255,255,255,0.7)" fow="500">Communication starts here</SizableText>
                        </YStack>
                    </Animated.View>
                </YStack>
            </ZStack>

            {/* Scrollable Form */}
            <ScrollView
                f={1}
                contentContainerStyle={{ flexGrow: 1 }}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
                    <Animated.View style={{ transform: [{ translateY: vm.animations.slideHeight }] }}>
                        <YStack
                            bg={COLORS.white}
                            borderBottomLeftRadius={40}
                            borderBottomRightRadius={40}
                            px="$5"
                            pt="$6"
                            pb="$6"
                            shadowColor="rgba(0,0,0,0.15)"
                            shadowRadius={15}
                            shadowOffset={{ width: 0, height: 8 }}
                            shadowOpacity={0.08}
                        >
                            {/* Title */}
                            <YStack gap="$1" mb="$4">
                                <SizableText size="$7" fow="800" color={COLORS.royalBlue}>Create Account</SizableText>
                                <YStack w={30} h={3} bg={COLORS.teal} br={1.5} />
                            </YStack>

                            <YStack gap="$3">
                                {/* Top Profile Section (Icon + Names) */}
                                <XStack gap="$4" ai="center" mb="$1">
                                    {/* Left: Avatar Trigger */}
                                    <YStack ai="center" gap="$1.5">
                                        <Pressable onPress={() => vm.setShowIconModal(true)} disabled={vm.isLoading}>
                                            <YStack
                                                w={100}
                                                h={100}
                                                br={50}
                                                bg={COLORS.cream}
                                                bw={1}
                                                bc={vm.selectedIcon ? COLORS.teal : COLORS.sandMid}
                                                jc="center"
                                                ai="center"
                                                shadowColor={vm.selectedIcon ? "rgba(42, 143, 160, 0.2)" : "transparent"}
                                                shadowRadius={10}
                                                elevation={vm.selectedIcon ? 4 : 0}
                                            >
                                                {vm.selectedIcon ? (
                                                    <RNImage
                                                        source={getProfileSource(vm.selectedIcon)}
                                                        style={{ width: 84, height: 84, borderRadius: 42 }}
                                                        resizeMode="cover"
                                                    />
                                                ) : (
                                                    <YStack ai="center" gap="$1">
                                                        <User size={32} color={COLORS.royalBlue} opacity={0.3} />
                                                        <SizableText size="$1" fow="700" color={COLORS.royalBlue} opacity={0.5}>ADD ICON</SizableText>
                                                    </YStack>
                                                )}

                                                {/* Edit Badge */}
                                                <Circle
                                                    size={24}
                                                    bg={COLORS.royalBlue}
                                                    pos="absolute"
                                                    b={0}
                                                    r={0}
                                                    bw={2}
                                                    bc="white"
                                                    jc="center"
                                                    ai="center"
                                                >
                                                    <ChevronDown size={14} color="white" />
                                                </Circle>
                                            </YStack>
                                        </Pressable>
                                    </YStack>

                                    {/* Right: Username Field */}
                                    <YStack f={1} jc="center" gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Username</SizableText>
                                        <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={52} px="$3" gap="$2.5">
                                            <Input
                                                f={1} placeholder="Pick a username" value={vm.username}
                                                onChangeText={vm.setUsername} autoCapitalize="none"
                                                bg="transparent" bw={0} size="$3" disabled={vm.isLoading}
                                            />
                                        </XStack>
                                    </YStack>
                                </XStack>

                                {/* Gender & Birthdate Row */}
                                <XStack gap="$2">
                                    <YStack f={1} gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Gender</SizableText>
                                        <Pressable onPress={() => vm.setShowGenderSheet(true)} disabled={vm.isLoading}>
                                            <XStack ai="center" jc="space-between" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3">
                                                <SizableText size="$3" color={vm.gender ? COLORS.textDark : COLORS.sandMid} fow={vm.gender ? "500" : "400"}>
                                                    {vm.gender || "Select"}
                                                </SizableText>
                                                <ChevronDown size={16} color={COLORS.textMid} />
                                            </XStack>
                                        </Pressable>
                                    </YStack>
                                    <YStack f={1} gap="$1.5">
                                        <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Birthdate</SizableText>
                                        <Pressable onPress={() => vm.setShowDatePicker(true)} disabled={vm.isLoading}>
                                            <XStack ai="center" jc="space-between" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3">
                                                <SizableText size="$3" color={vm.birthdate ? COLORS.textDark : COLORS.sandMid} fow={vm.birthdate ? "500" : "400"}>
                                                    {vm.birthdate
                                                        ? vm.birthdate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                                        : "Select"}
                                                </SizableText>
                                                <Calendar size={16} color={COLORS.textMid} />
                                            </XStack>
                                        </Pressable>
                                    </YStack>
                                </XStack>

                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Email address *</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Mail size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Enter your email" value={vm.email}
                                            onChangeText={vm.setEmail} autoCapitalize="none"
                                            keyboardType="email-address" bg="transparent" bw={0} size="$3"
                                            disabled={vm.isLoading}
                                        />
                                    </XStack>
                                </YStack>

                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Password *</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Min 6 characters" value={vm.password}
                                            onChangeText={vm.setPassword} secureTextEntry={!vm.showPassword}
                                            autoCapitalize="none" bg="transparent" bw={0} size="$3"
                                            disabled={vm.isLoading}
                                        />
                                        <Button
                                            bg="transparent" p={0}
                                            onPress={() => vm.setShowPassword(!vm.showPassword)}
                                            icon={vm.showPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                        />
                                    </XStack>
                                    {vm.password.length > 0 && (
                                        <XStack gap="$3" mt="$1" flexWrap="wrap">
                                            <PasswordCheck met={vm.passwordRequirements.minLength} text="6+ chars" />
                                            <PasswordCheck met={vm.passwordRequirements.hasNumber} text="Number" />
                                            <PasswordCheck met={vm.passwordRequirements.hasUpperCase} text="Uppercase" />
                                        </XStack>
                                    )}
                                </YStack>

                                <YStack gap="$1.5">
                                    <SizableText size="$1" fow="700" color={COLORS.textMid} ls={0.5} tt="uppercase" opacity={0.8}>Confirm Password *</SizableText>
                                    <XStack ai="center" bg={COLORS.cream} br={12} bw={1} bc={COLORS.sandMid} h={48} px="$3" gap="$2.5">
                                        <Lock size={16} color={COLORS.royalBlue} opacity={0.5} />
                                        <Input
                                            f={1} placeholder="Re-enter password" value={vm.confirmPassword}
                                            onChangeText={vm.setConfirmPassword} secureTextEntry={!vm.showConfirmPassword}
                                            autoCapitalize="none" bg="transparent" bw={0} size="$3"
                                            disabled={vm.isLoading}
                                        />
                                        <Button
                                            bg="transparent" p={0}
                                            onPress={() => vm.setShowConfirmPassword(!vm.showConfirmPassword)}
                                            icon={vm.showConfirmPassword ? <EyeOff size={16} color={COLORS.textMid} /> : <Eye size={16} color={COLORS.textMid} />}
                                        />
                                    </XStack>
                                    {vm.confirmPassword.length > 0 && (
                                        <XStack ai="center" gap="$1.5" mt="$1">
                                            <Circle size={6} bg={vm.password === vm.confirmPassword ? COLORS.success : COLORS.error} />
                                            <SizableText size="$1" fow="500" color={vm.password === vm.confirmPassword ? COLORS.success : COLORS.error}>
                                                {vm.password === vm.confirmPassword ? "Passwords match" : "Passwords don't match"}
                                            </SizableText>
                                        </XStack>
                                    )}
                                </YStack>

                                <Button
                                    bg={COLORS.royalBlue} h={52} br={16} mt="$2"
                                    onPress={vm.handleRegister}
                                    disabled={!vm.email || !vm.password || !vm.confirmPassword || vm.password !== vm.confirmPassword || vm.isLoading}
                                    opacity={(!vm.email || !vm.password || !vm.confirmPassword || vm.password !== vm.confirmPassword) ? 0.5 : 1}
                                    pressStyle={{ scale: 0.98, opacity: 0.9 }}
                                    elevation={4} shadowColor={COLORS.royalBlue}
                                    iconAfter={vm.isLoading ? <Spinner color="white" /> : <ArrowRight size={18} color="white" />}
                                >
                                    <SizableText color="white" fow="700" size="$3" ls={0.5}>
                                        {vm.isLoading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT"}
                                    </SizableText>
                                </Button>

                                <XStack jc="center" ai="center" gap="$2" mt="$1">
                                    <SizableText color={COLORS.textMid} size="$2">Already have an account?</SizableText>
                                    <Button chromeless p={0} h="auto" onPress={() => navigation.navigate("Login")}>
                                        <SizableText color={COLORS.royalBlue} fow="700" size="$2" textDecorationLine="underline">Sign in</SizableText>
                                    </Button>
                                </XStack>
                            </YStack>
                        </YStack>
                    </Animated.View>
                </KeyboardAvoidingView>
            </ScrollView>

            {/* Modals & Picker */}
            <Modal
                visible={vm.showGenderSheet}
                transparent
                animationType="fade"
                onRequestClose={() => vm.setShowGenderSheet(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: COLORS.modalOverlay, justifyContent: 'flex-end' }}
                    onPress={() => vm.setShowGenderSheet(false)}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <YStack bg={COLORS.white} borderTopLeftRadius={28} borderTopRightRadius={28} p="$5" pb="$8" gap="$2">
                            <YStack ai="center" mb="$2">
                                <YStack w={36} h={4} bg={COLORS.sandMid} br={2} />
                            </YStack>
                            <SizableText size="$4" fow="700" color={COLORS.textDark} mb="$2">Select Gender</SizableText>
                            {["Male", "Female", "Other", "Prefer not to say"].map((option) => (
                                <Pressable key={option} onPress={() => { vm.setGender(option); vm.setShowGenderSheet(false); }}>
                                    <XStack
                                        ai="center" gap="$3" px="$4" py="$3" br={14}
                                        bg={vm.gender === option ? COLORS.warmWhite : "transparent"}
                                        bw={1} bc={vm.gender === option ? COLORS.teal : COLORS.sandMid}
                                    >
                                        <YStack w={18} h={18} br={9} bw={2} bc={vm.gender === option ? COLORS.teal : COLORS.sandMid} jc="center" ai="center">
                                            {vm.gender === option && <Circle size={8} bg={COLORS.teal} />}
                                        </YStack>
                                        <SizableText size="$3" fow={vm.gender === option ? "600" : "400"} color={vm.gender === option ? COLORS.teal : COLORS.textMid}>
                                            {option}
                                        </SizableText>
                                    </XStack>
                                </Pressable>
                            ))}
                        </YStack>
                    </Pressable>
                </Pressable>
            </Modal>

            {vm.showDatePicker && (
                Platform.OS === 'ios' ? (
                    <Modal
                        visible={vm.showDatePicker}
                        transparent
                        animationType="fade"
                        onRequestClose={() => vm.setShowDatePicker(false)}
                    >
                        <Pressable
                            style={{ flex: 1, backgroundColor: COLORS.modalOverlay, justifyContent: 'flex-end' }}
                            onPress={() => vm.setShowDatePicker(false)}
                        >
                            <Pressable onPress={(e) => e.stopPropagation()}>
                                <YStack bg={COLORS.white} borderTopLeftRadius={28} borderTopRightRadius={28} p="$5" pb="$8">
                                    <XStack jc="space-between" ai="center" mb="$3">
                                        <SizableText size="$4" fow="700" color={COLORS.textDark}>Select Birthdate</SizableText>
                                        <Button size="$3" br={10} bg={COLORS.royalBlue} onPress={() => vm.setShowDatePicker(false)}>
                                            <SizableText color="white" fow="600" size="$2">Done</SizableText>
                                        </Button>
                                    </XStack>
                                    <DateTimePicker
                                        value={vm.birthdate || new Date(2000, 0, 1)}
                                        mode="date"
                                        display="spinner"
                                        maximumDate={new Date()}
                                        minimumDate={new Date(1920, 0, 1)}
                                        onChange={(_event: any, selectedDate?: Date) => {
                                            if (selectedDate) vm.setBirthdate(selectedDate);
                                        }}
                                    />
                                </YStack>
                            </Pressable>
                        </Pressable>
                    </Modal>
                ) : (
                    <DateTimePicker
                        value={vm.birthdate || new Date(2000, 0, 1)}
                        mode="date"
                        display="default"
                        maximumDate={new Date()}
                        minimumDate={new Date(1920, 0, 1)}
                        onChange={(_event: any, selectedDate?: Date) => {
                            vm.setShowDatePicker(false);
                            if (selectedDate) vm.setBirthdate(selectedDate);
                        }}
                    />
                )
            )}

            {/* Profile Icon Picker Modal */}
            <Modal
                visible={vm.showIconModal}
                transparent
                animationType="fade"
                onRequestClose={() => vm.setShowIconModal(false)}
            >
                <Pressable
                    style={{ flex: 1, backgroundColor: COLORS.modalOverlay, justifyContent: 'flex-end' }}
                    onPress={() => vm.setShowIconModal(false)}
                >
                    <Pressable onPress={(e) => e.stopPropagation()}>
                        <YStack
                            bg={COLORS.white}
                            borderTopLeftRadius={28}
                            borderTopRightRadius={28}
                            p="$5"
                            pb="$8"
                            maxHeight={height * 0.7}
                        >
                            <YStack ai="center" mb="$2">
                                <YStack w={36} h={4} bg={COLORS.sandMid} br={2} />
                            </YStack>

                            <XStack jc="space-between" ai="center" mb="$4">
                                <SizableText size="$5" fow="800" color={COLORS.royalBlue}>Choose Character</SizableText>
                                {vm.selectedIcon && (
                                    <Button size="$2" chromeless onPress={() => { vm.setSelectedIcon(null); vm.setShowIconModal(false); }}>
                                        <SizableText color={COLORS.error} size="$2" fow="600">Remove</SizableText>
                                    </Button>
                                )}
                            </XStack>

                            <ScrollView showsVerticalScrollIndicator={false}>
                                <XStack fw="wrap" jc="flex-start" gap="$4">
                                    {["ampalaya.jpg", "banana.jpg", "pineapple.jpg", "strawberry.jpg"].map((icon) => {
                                        const isSelected = vm.selectedIcon === icon;
                                        return (
                                            <Pressable
                                                key={icon}
                                                onPress={() => { vm.setSelectedIcon(icon); vm.setShowIconModal(false); }}
                                                style={{ width: '28%' }}
                                            >
                                                <YStack ai="center" gap="$2">
                                                    <YStack
                                                        w={74}
                                                        h={74}
                                                        br={37}
                                                        bw={isSelected ? 3 : 1}
                                                        bc={isSelected ? COLORS.teal : COLORS.sandMid}
                                                        jc="center"
                                                        ai="center"
                                                        bg={isSelected ? COLORS.warmWhite : COLORS.cream}
                                                        shadowColor={isSelected ? "rgba(42, 143, 160, 0.4)" : "transparent"}
                                                        shadowRadius={8}
                                                        elevation={isSelected ? 4 : 1}
                                                    >
                                                        <YStack w={60} h={60} br={30} bg={COLORS.cream} bw={isSelected ? 2 : 1} bc={isSelected ? COLORS.teal : COLORS.sandMid} jc="center" ai="center" ov="hidden">
                                                            <RNImage
                                                                source={getProfileSource(icon)}
                                                                style={{ width: 50, height: 50, borderRadius: 25 }}
                                                                resizeMode="cover"
                                                            />
                                                        </YStack>
                                                    </YStack>
                                                    <SizableText
                                                        size="$1"
                                                        fow={isSelected ? "700" : "500"}
                                                        color={isSelected ? COLORS.teal : COLORS.textMid}
                                                        tt="capitalize"
                                                    >
                                                        {icon.replace(".jpg", "")}
                                                    </SizableText>
                                                </YStack>
                                            </Pressable>
                                        );
                                    })}
                                </XStack>
                            </ScrollView>

                            <Button
                                bg={COLORS.royalBlue}
                                br={16}
                                h={52}
                                mt="$5"
                                onPress={() => vm.setShowIconModal(false)}
                            >
                                <SizableText color="white" fow="700">Done</SizableText>
                            </Button>
                        </YStack>
                    </Pressable>
                </Pressable>
            </Modal>
        </YStack>
    );
};
