import React, { useState, useEffect, useContext, useRef, useMemo } from "react";
import {
  StyleSheet,
  Alert,
  Platform,
  StatusBar,
  Animated,
  useWindowDimensions,
  UIManager,
  LayoutAnimation,
  Image as RNImage,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Picker } from "@react-native-picker/picker";
import {
  YStack,
  XStack,
  ZStack,
  Button,
  Circle,
  Paragraph,
  SizableText,
  Card,
  ScrollView,
  Spinner,
  Input,
  Theme,
} from "tamagui";
import {
  Camera,
  Trash2,
  Save,
  X,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  UserCircle,
  User,
} from "@tamagui/lucide-icons";
import axios from "axios";
import baseURL from "../../utils/baseurl";
import { getToken, storeUser } from "../../utils/authToken";
import { AuthContext, AuthContextType, User as UserType } from "../../context/AuthContext";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ─── Brand Palette ───────────────────────────────────────────────
const COLORS = {
  cream: '#FAF8F4',
  warmWhite: '#F5F1EA',
  sandLight: '#EDE8DF',
  sandMid: '#DDD6C8',
  deepNavy: '#0F2847',
  royalBlue: '#1A4480',
  mediumBlue: '#2A5FA8',
  teal: '#2A8FA0',
  tealLight: '#3DAFC4',
  orbBlue: '#C8D8EE',
  orbTeal: '#BEE4EC',
  orbSand: '#E8E0D0',
  ambientBlue: '#D4E5F7',
  ambientMid: '#B8D0EC',
  ambientDeep: '#9BBDE0',
  textDark: '#1C2B3A',
  textMid: '#4A5A6A',
  white: '#FFFFFF',
};

// ─── Soft Orb ─────────────────────────────────────────────────────
interface SoftOrbProps { color: string; size: number; x: number; y: number; duration: number; delay: number; }

const SoftOrb: React.FC<SoftOrbProps> = ({ color, size, x, y, duration, delay }) => {
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

const SectionHeader: React.FC<{ icon: React.ReactNode; title: string }> = ({ icon, title }) => (
  <XStack ai="center" mb="$4" gap="$3">
    <YStack w={32} h={32} br={8} bg={`${COLORS.royalBlue}0C`} jc="center" ai="center">
      {icon}
    </YStack>
    <SizableText size="$4" fow="800" color={COLORS.textDark} ls={-0.3}>{title}</SizableText>
    <YStack f={1} h={1} bg={COLORS.sandMid} opacity={0.5} ml="$2" />
  </XStack>
);

const FieldLabel: React.FC<{ text: string }> = ({ text }) => (
  <SizableText size="$2" fow="700" color={COLORS.textMid} mb="$1.5" ml="$1" ls={0.2} textTransform="uppercase">
    {text}
  </SizableText>
);

// ─── Main Component ───────────────────────────────────────────────
const EditProfileScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const { user, setUser } = useContext(AuthContext) as AuthContextType;
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthdate, setBirthdate] = useState<Date | null>(null);
  const [gender, setGender] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [genderOpen, setGenderOpen] = useState(false);

  const { width, height } = useWindowDimensions();

  const orbs = useMemo(() => ([
    { color: COLORS.ambientBlue, size: width * 0.65, x: width * 0.88, y: height * 0.07, duration: 6000, delay: 0 },
    { color: COLORS.ambientMid, size: width * 0.5, x: width * 0.08, y: height * 0.46, duration: 7200, delay: 900 },
    { color: COLORS.ambientDeep, size: width * 0.38, x: width * 0.65, y: height * 0.82, duration: 5500, delay: 500 },
  ]), [width, height]);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setGender(user.gender || "");
      setProfilePic(user.profile_pic || null);
      if (user.birthdate) setBirthdate(new Date(user.birthdate));
    }
  }, [user]);

  const handleUpdateProfile = async () => {
    try {
      setLoading(true);
      const updateData: any = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        gender,
        birthdate: birthdate ? birthdate.toISOString().split("T")[0] : null,
      };
      Object.keys(updateData).forEach((k) => { if (!updateData[k]) delete updateData[k]; });
      if (Object.keys(updateData).length === 0) {
        Alert.alert("No Changes", "Please make at least one change.");
        setLoading(false);
        return;
      }
      const token = await getToken();
      const response = await axios.put(`${baseURL}/auth/profile`, updateData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      });
      const updatedUser: UserType = {
        ...user,
        first_name: response.data.first_name,
        last_name: response.data.last_name,
        gender: response.data.gender,
        birthdate: response.data.birthdate,
        profile_pic: response.data.profile_pic,
      } as UserType;
      await storeUser(updatedUser);
      if (setUser) setUser(updatedUser);
      Alert.alert("Success", response.data.message || "Profile updated successfully!");
      navigation.goBack();
    } catch (error: any) {
      Alert.alert("Error", error.response?.data?.detail || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Camera roll permissions required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) await handleUploadImage(result.assets[0].uri);
  };

  const handleUploadImage = async (imageUri: string) => {
    try {
      setUploading(true);
      const formData = new FormData();
      const filename = imageUri.split("/").pop() || "upload.jpg";
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : "image/jpeg";
      formData.append("file", {
        uri: Platform.OS === "ios" ? imageUri.replace("file://", "") : imageUri,
        name: filename,
        type,
      } as any);
      const token = await getToken();
      const response = await axios.post(`${baseURL}/auth/profile/picture`, formData, {
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "multipart/form-data" },
        timeout: 30000,
      });
      setProfilePic(response.data.profile_pic);
      if (user) {
        const updatedUser: UserType = { ...user, profile_pic: response.data.profile_pic } as UserType;
        await storeUser(updatedUser);
        if (setUser) setUser(updatedUser);
      }
      Alert.alert("Success", "Profile picture updated!");
    } catch (error: any) {
      Alert.alert("Upload Failed", error.response?.data?.detail || "Failed to upload image.");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteProfilePic = async () => {
    Alert.alert("Delete Profile Picture", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          try {
            setUploading(true);
            const token = await getToken();
            await axios.delete(`${baseURL}/auth/profile/picture`, { headers: { Authorization: `Bearer ${token}` } });
            setProfilePic(null);
            if (user) {
              const updatedUser: UserType = { ...user, profile_pic: undefined } as UserType;
              await storeUser(updatedUser);
              if (setUser) setUser(updatedUser);
            }
            Alert.alert("Success", "Profile picture deleted.");
          } catch {
            Alert.alert("Error", "Failed to delete picture.");
          } finally {
            setUploading(false);
          }
        },
      },
    ]);
  };

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
        <Circle pos="absolute" t={-height * 0.1} r={-width * 0.15} size={width * 0.95} bg={COLORS.ambientBlue} opacity={0.5} />
        <Circle pos="absolute" b={-height * 0.06} l={-width * 0.2} size={width * 0.8} bg={COLORS.ambientMid} opacity={0.2} />
        {orbs.map((orb, i) => <SoftOrb key={i} {...orb} />)}

        <YStack pos="absolute" t={58} l={22} w={34} h={34} borderTopWidth={1.5} borderLeftWidth={1.5} bc={`${COLORS.mediumBlue}30`} br={6} />
        <YStack pos="absolute" b={60} r={22} w={34} h={34} borderBottomWidth={1.5} borderRightWidth={1.5} bc={`${COLORS.teal}30`} br={6} />
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
                {uploading ? (
                  <Spinner size="small" color={COLORS.mediumBlue} />
                ) : profilePic ? (
                  <RNImage source={{ uri: profilePic }} style={{ width: 68, height: 68, borderRadius: 20 }} />
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
                onPress={handlePickImage}
                disabled={uploading}
                icon={<Camera size={12} color="white" />}
              />
            </YStack>

            <YStack f={1}>
              <SizableText size="$5" fow="800" color={COLORS.textDark} ls={-0.4}>
                {firstName || lastName ? `${firstName} ${lastName}`.trim() : "Your Name"}
              </SizableText>
              <SizableText size="$2" color={COLORS.textMid} fow="500">Tap camera to update photo</SizableText>
              {profilePic && (
                <XStack ai="center" mt="$2" gap="$1" onPress={handleDeleteProfilePic}>
                  <Trash2 size={11} color="#DC2626" />
                  <SizableText size="$1" fow="700" color="#DC2626" textTransform="uppercase">Remove photo</SizableText>
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
                value={firstName}
                onChangeText={setFirstName}
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
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter last name"
              />
            </YStack>

            <YStack>
              <FieldLabel text="Gender" />
              <YStack bg={COLORS.warmWhite} br={14} bw={1.5} bc={COLORS.sandMid} ov="hidden">
                <Picker
                  selectedValue={gender}
                  onValueChange={(itemValue) => setGender(itemValue)}
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
                onPress={() => setShowDatePicker(true)}
              >
                <SizableText color={birthdate ? COLORS.textDark : `${COLORS.textMid}60`} fow="500">
                  {birthdate ? birthdate.toDateString() : "Select birthdate"}
                </SizableText>
                <Calendar size={18} color={COLORS.mediumBlue} />
              </Button>
            </YStack>
          </YStack>
        </Card>

        {showDatePicker && (
          <DateTimePicker
            value={birthdate || new Date()}
            mode="date"
            display="default"
            onChange={(e, d) => {
              setShowDatePicker(false);
              if (d) setBirthdate(d);
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
            onPress={handleUpdateProfile}
            disabled={loading}
            iconAfter={loading ? <Spinner color="white" /> : <Save size={16} color="white" />}
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
            disabled={loading}
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

export default EditProfileScreen;