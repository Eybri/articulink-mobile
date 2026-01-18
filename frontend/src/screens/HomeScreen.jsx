import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  StatusBar,
} from "react-native";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import baseURL from "./../utils/baseurl";

export default function App() {
  const [recording, setRecording] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [loading, setLoading] = useState(false);

  // 🎙 Start Recording
  async function startRecording() {
    try {
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.LOW_QUALITY
      );
      setRecording(recording);
    } catch (err) {
      Alert.alert("Error", "Could not start recording");
    }
  }

  // ⏹ Stop & Upload
  async function stopRecording() {
    if (!recording) return;

    setLoading(true);
    await recording.stopAndUnloadAsync();
    const uri = recording.getURI();
    setRecording(null);

    await uploadAudio(uri);
    setLoading(false);
  }

  // 📤 Upload Audio to FastAPI
  async function uploadAudio(uri) {
    const formData = new FormData();

    formData.append("file", {
      uri,
      name: "speech.wav",
      type: "audio/wav",
    });

    try {
      const response = await fetch(`${baseURL}/transcribe`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      setTranscript(data.text || "");
    } catch (err) {
      Alert.alert("Error", "Transcription failed");
    }
  }

  // 🔊 Speak Text
  function speakText() {
    if (!transcript.trim()) {
      Alert.alert("Nothing to speak");
      return;
    }

    Speech.stop();
    Speech.speak(transcript, {
      language: "en-US",
      rate: 0.9,
      pitch: 1.0,
    });
  }

  // 🗑 Clear Text
  function clearTranscript() {
    Speech.stop();
    setTranscript("");
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0f0d" />
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Articulink</Text>
        <Text style={styles.subtitle}>Speech Clarity Assistant</Text>
      </View>

      {/* Recording Controls */}
      <View style={styles.recordingSection}>
        <TouchableOpacity
          style={[
            styles.recordButton,
            recording && styles.recordButtonActive,
          ]}
          onPress={startRecording}
          disabled={!!recording}
          activeOpacity={0.8}
        >
          <View style={[styles.recordDot, recording && styles.recordDotActive]} />
          <Text style={styles.recordButtonText}>
            {recording ? "Recording..." : "Start Recording"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.stopButton,
            (!recording || loading) && styles.buttonDisabled,
          ]}
          onPress={stopRecording}
          disabled={!recording || loading}
          activeOpacity={0.8}
        >
          <View style={styles.stopIcon} />
          <Text style={styles.stopButtonText}>
            {loading ? "Processing..." : "Stop & Transcribe"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Transcript Section */}
      <View style={styles.transcriptSection}>
        <Text style={styles.label}>Transcript</Text>
        
        <TextInput
          style={styles.textbox}
          multiline
          value={transcript}
          onChangeText={setTranscript}
          placeholder="Your speech will appear here..."
          placeholderTextColor="#4a5568"
        />
      </View>

      {/* Action Buttons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.speakButton,
            !transcript && styles.buttonDisabled,
          ]}
          onPress={speakText}
          disabled={!transcript}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonIcon}>🔊</Text>
          <Text style={styles.actionButtonText}>Speak</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.actionButton,
            styles.clearButton,
            !transcript && styles.buttonDisabled,
          ]}
          onPress={clearTranscript}
          disabled={!transcript}
          activeOpacity={0.8}
        >
          <Text style={styles.actionButtonIcon}>🗑</Text>
          <Text style={styles.actionButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0f0d",
    padding: 24,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#10b981",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    letterSpacing: 0.3,
  },
  recordingSection: {
    marginBottom: 32,
    gap: 16,
  },
  recordButton: {
    backgroundColor: "#1a2820",
    borderWidth: 2,
    borderColor: "#10b981",
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  recordButtonActive: {
    backgroundColor: "#10b981",
    borderColor: "#10b981",
  },
  recordDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: "#10b981",
  },
  recordDotActive: {
    backgroundColor: "#fff",
  },
  recordButtonText: {
    color: "#10b981",
    fontSize: 16,
    fontWeight: "600",
  },
  stopButton: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  stopIcon: {
    width: 14,
    height: 14,
    backgroundColor: "#ef4444",
    borderRadius: 2,
  },
  stopButtonText: {
    color: "#d1d5db",
    fontSize: 15,
    fontWeight: "600",
  },
  transcriptSection: {
    flex: 1,
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#9ca3af",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  textbox: {
    backgroundColor: "#1a1f1c",
    borderWidth: 1,
    borderColor: "#2d3730",
    borderRadius: 12,
    padding: 16,
    minHeight: 180,
    color: "#e5e7eb",
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: "top",
  },
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  speakButton: {
    backgroundColor: "#10b981",
  },
  clearButton: {
    backgroundColor: "#1f2937",
    borderWidth: 1,
    borderColor: "#374151",
  },
  actionButtonIcon: {
    fontSize: 20,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#fff",
  },

});