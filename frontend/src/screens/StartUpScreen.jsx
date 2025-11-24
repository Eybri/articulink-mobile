// screens/IntroScreen.js
import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Animated,
  ScrollView,
  Dimensions,
  StatusBar
} from 'react-native';
import { 
  Volume2, 
  Mic, 
  Languages, 
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

const IntroScreen = ({ navigation }) => {
  const [currentFeature, setCurrentFeature] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  const features = [
    {
      icon: Mic,
      title: "We Understand You",
      description: "Advanced AI that accurately interprets nasal and lisp speech patterns",
      color: "#2563eb",
      gradient: ["#2563eb", "#3b82f6"]
    },
    {
      icon: CheckCircle,
      title: "Smart Correction",
      description: "Intelligent auto-correction with contextual understanding",
      color: "#059669",
      gradient: ["#059669", "#10b981"]
    },
    {
      icon: Languages,
      title: "Real-time Translation",
      description: "Seamless English ↔ Tagalog translation in milliseconds",
      color: "#7c3aed",
      gradient: ["#7c3aed", "#8b5cf6"]
    },
    {
      icon: Volume2,
      title: "Natural Voice Output",
      description: "Crystal-clear, natural-sounding speech in both languages",
      color: "#dc2626",
      gradient: ["#dc2626", "#ef4444"]
    }
  ];

  useEffect(() => {
    // Start animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      })
    ]).start();

    // Auto-rotate features
    const interval = setInterval(() => {
      setCurrentFeature(prev => (prev + 1) % features.length);
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  const FeatureIndicator = () => (
    <View style={styles.indicatorContainer}>
      {features.map((_, index) => (
        <View
          key={index}
          style={[
            styles.indicator,
            currentFeature === index && styles.indicatorActive,
            currentFeature === index && { backgroundColor: features[index].color }
          ]}
        />
      ))}
    </View>
  );

  const CurrentFeature = features[currentFeature];
  const FeatureIcon = CurrentFeature.icon;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fafafa" />
      
      {/* Background Gradient Orbs */}
      <View style={styles.backgroundOrbs}>
        <View style={[styles.orb, styles.orb1, { backgroundColor: '#dbeafe' }]} />
        <View style={[styles.orb, styles.orb2, { backgroundColor: '#f0f9ff' }]} />
        <View style={[styles.orb, styles.orb3, { backgroundColor: '#faf5ff' }]} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>
          
          {/* Header Section */}
          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Sparkles size={28} color="#2563eb" fill="#2563eb" />
              </View>
              <Text style={styles.logoText}>Articulink</Text>
            </View>
            
            <View style={styles.badge}>
              <Text style={styles.badgeText}>Beta</Text>
            </View>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            <Text style={styles.heroTitle}>
              Your voice,{"\n"}
              <Text style={styles.heroTitleAccent}>perfectly translated</Text>
            </Text>
            
            <Text style={styles.heroSubtitle}>
              Breaking communication barriers for those with speech differences through advanced AI technology
            </Text>

            {/* Feature Showcase */}
            <View style={styles.featureCard}>
              <View style={styles.featureHeader}>
                <View style={[
                  styles.featureIconContainer,
                  { backgroundColor: CurrentFeature.color }
                ]}>
                  <FeatureIcon size={24} color="white" />
                </View>
                <FeatureIndicator />
              </View>
              
              <Text style={styles.featureTitle}>
                {CurrentFeature.title}
              </Text>
              
              <Text style={styles.featureDescription}>
                {CurrentFeature.description}
              </Text>
            </View>

          </View>

          {/* CTA Section */}
          <View style={styles.ctaSection}>
            <TouchableOpacity 
              style={styles.primaryButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.9}
            >
              <Text style={styles.primaryButtonText}>Get Started</Text>
              <View style={styles.buttonIcon}>
                <ArrowRight size={20} color="white" />
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.secondaryButton}
              onPress={() => navigation.navigate('Register')}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Learn More</Text>
            </TouchableOpacity>

            <Text style={styles.footerNote}>
              Join thousands of users experiencing seamless communication
            </Text>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fafafa',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  backgroundOrbs: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  orb: {
    position: 'absolute',
    borderRadius: 500,
    opacity: 0.6,
  },
  orb1: {
    width: width * 0.8,
    height: width * 0.8,
    top: -width * 0.4,
    right: -width * 0.2,
  },
  orb2: {
    width: width * 0.6,
    height: width * 0.6,
    bottom: -width * 0.3,
    left: -width * 0.2,
  },
  orb3: {
    width: width * 0.4,
    height: width * 0.4,
    top: height * 0.3,
    left: width * 0.1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    letterSpacing: -0.5,
  },
  badge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  mainContent: {
    flex: 1,
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 42,
    marginBottom: 16,
    letterSpacing: -1,
  },
  heroTitleAccent: {
    color: '#2563eb',
  },
  heroSubtitle: {
    fontSize: 16,
    color: '#475569',
    lineHeight: 24,
    marginBottom: 40,
    letterSpacing: 0.2,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 24,
    padding: 24,
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  featureIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 6,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e2e8f0',
  },
  indicatorActive: {
    width: 24,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  featureDescription: {
    fontSize: 15,
    color: '#64748b',
    lineHeight: 22,
    letterSpacing: 0.1,
  },
  ctaSection: {
    marginTop: 'auto',
    paddingTop: 32,
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    paddingHorizontal: 24,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginRight: 8,
    letterSpacing: 0.5,
  },
  buttonIcon: {
    opacity: 0.9,
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 20,
  },
  secondaryButtonText: {
    color: '#475569',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  footerNote: {
    fontSize: 13,
    color: '#94a3b8',
    textAlign: 'center',
    letterSpacing: 0.3,
    lineHeight: 18,
  },
});

export default IntroScreen;