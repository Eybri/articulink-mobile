import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';

const SettingsScreen = () => {
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [saveHistory, setSaveHistory] = useState(true);
  const [vibrationFeedback, setVibrationFeedback] = useState(true);
  const [voiceVolume, setVoiceVolume] = useState(0.7);
  const [micSensitivity, setMicSensitivity] = useState(0.8);
  const [notifications, setNotifications] = useState(true);

  const handleClearHistory = () => {
    Alert.alert(
      "Clear History",
      "Are you sure you want to clear all translation history? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        { text: "Clear", style: "destructive", onPress: () => {
          // Handle clear history logic here
          Alert.alert("Success", "Translation history cleared successfully!");
        }}
      ]
    );
  };

  const SettingItem = ({ icon, title, children, description }) => (
    <View style={styles.settingItem}>
      <View style={styles.settingHeader}>
        <View style={styles.settingTitleContainer}>
          <LinearGradient
            colors={['#10B981', '#14B8A6']}
            style={styles.iconContainer}
          >
            <Ionicons name={icon} size={20} color="white" />
          </LinearGradient>
          <View style={styles.settingTextContainer}>
            <Text style={styles.settingTitle}>{title}</Text>
            {description && <Text style={styles.settingDescription}>{description}</Text>}
          </View>
        </View>
      </View>
      {children}
    </View>
  );

  const SliderItem = ({ title, value, onValueChange, min = 0, max = 1, step = 0.01 }) => (
    <View style={styles.sliderContainer}>
      <View style={styles.sliderHeader}>
        <Text style={styles.sliderTitle}>{title}</Text>
        <Text style={styles.sliderValue}>{Math.round(value * 100)}%</Text>
      </View>
      <View style={styles.sliderWrapper}>
        <Slider
          style={styles.slider}
          value={value}
          onValueChange={onValueChange}
          minimumValue={min}
          maximumValue={max}
          step={step}
          minimumTrackTintColor="#10B981"
          maximumTrackTintColor="#374151"
          thumbTintColor="#10B981"
        />
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>Low</Text>
          <Text style={styles.sliderLabel}>High</Text>
        </View>
      </View>
    </View>
  );

  return (
    <LinearGradient
      colors={['#111827', '#1F2937', '#111827']}
      style={styles.container}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Background Effects */}
        <View style={styles.backgroundEffects}>
          <LinearGradient
            colors={['#10B98120', 'transparent']}
            style={[styles.backgroundOrb, { top: 50, right: 20 }]}
          />
          <LinearGradient
            colors={['#14B8A620', 'transparent']}
            style={[styles.backgroundOrb, { bottom: 100, left: 20 }]}
          />
        </View>

        {/* Audio Settings Section */}
        <SettingItem
          icon="volume-high"
          title="Audio Settings"
          description="Customize voice and microphone settings"
        >
          <View style={styles.sectionContent}>
            <SliderItem
              title="Voice Volume"
              value={voiceVolume}
              onValueChange={setVoiceVolume}
            />
            <SliderItem
              title="Microphone Sensitivity"
              value={micSensitivity}
              onValueChange={setMicSensitivity}
            />
          </View>
        </SettingItem>

        {/* Translation Settings Section */}
        <SettingItem
          icon="flash"
          title="Translation Settings"
          description="Configure how translations work"
        >
          <View style={styles.sectionContent}>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Auto-confirm translations</Text>
              <Switch
                value={autoConfirm}
                onValueChange={setAutoConfirm}
                trackColor={{ false: '#374151', true: '#10B98150' }}
                thumbColor={autoConfirm ? '#10B981' : '#9CA3AF'}
              />
            </View>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Save to history</Text>
              <Switch
                value={saveHistory}
                onValueChange={setSaveHistory}
                trackColor={{ false: '#374151', true: '#10B98150' }}
                thumbColor={saveHistory ? '#10B981' : '#9CA3AF'}
              />
            </View>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Vibration feedback</Text>
              <Switch
                value={vibrationFeedback}
                onValueChange={setVibrationFeedback}
                trackColor={{ false: '#374151', true: '#10B98150' }}
                thumbColor={vibrationFeedback ? '#10B981' : '#9CA3AF'}
              />
            </View>
          </View>
        </SettingItem>

        {/* Notifications Section */}
        <SettingItem
          icon="notifications"
          title="Notifications"
          description="Manage app notifications"
        >
          <View style={styles.sectionContent}>
            <View style={styles.switchItem}>
              <Text style={styles.switchLabel}>Push notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: '#374151', true: '#10B98150' }}
                thumbColor={notifications ? '#10B981' : '#9CA3AF'}
              />
            </View>
          </View>
        </SettingItem>

        {/* Data Management Section */}
        <SettingItem
          icon="trash"
          title="Data Management"
          description="Manage your app data"
        >
          <View style={styles.sectionContent}>
            <TouchableOpacity style={styles.dangerButton} onPress={handleClearHistory}>
              <Ionicons name="trash-outline" size={20} color="#EF4444" />
              <Text style={styles.dangerButtonText}>Clear Translation History</Text>
            </TouchableOpacity>
          </View>
        </SettingItem>

        {/* About Section */}
        <SettingItem
          icon="information-circle"
          title="About Articulink"
          description="App information and support"
        >
          <View style={styles.sectionContent}>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Version</Text>
              <Text style={styles.aboutValue}>1.0.0</Text>
            </View>
            <View style={styles.aboutItem}>
              <Text style={styles.aboutLabel}>Build</Text>
              <Text style={styles.aboutValue}>2024.03.01</Text>
            </View>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Privacy Policy</Text>
              <Ionicons name="chevron-forward" size={16} color="#10B981" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.linkButton}>
              <Text style={styles.linkButtonText}>Terms of Service</Text>
              <Ionicons name="chevron-forward" size={16} color="#10B981" />
            </TouchableOpacity>
          </View>
        </SettingItem>

        <View style={{ height: 50 }} />
      </ScrollView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  backgroundEffects: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundOrb: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
  },
  settingItem: {
    backgroundColor: '#1F2937E0',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#10B98130',
  },
  settingHeader: {
    marginBottom: 16,
  },
  settingTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  settingTextContainer: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  settingDescription: {
    fontSize: 14,
    color: '#9CA3AF',
    marginTop: 2,
  },
  sectionContent: {
    gap: 16,
  },
  sliderContainer: {
    gap: 8,
  },
  sliderWrapper: {
    marginTop: 8,
  },
  sliderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderTitle: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  sliderValue: {
    fontSize: 14,
    color: '#10B981',
    fontWeight: '600',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: -8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  switchItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  switchLabel: {
    fontSize: 16,
    color: '#D1D5DB',
    flex: 1,
  },
  dangerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF444420',
    borderColor: '#EF4444',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  dangerButtonText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  aboutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  aboutLabel: {
    fontSize: 16,
    color: '#D1D5DB',
  },
  aboutValue: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
  linkButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  linkButtonText: {
    fontSize: 16,
    color: '#10B981',
    fontWeight: '600',
  },
});

export default SettingsScreen;