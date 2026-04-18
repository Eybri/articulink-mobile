import React from 'react';
import { StartUpView } from './StartUpView';
import { useStartUpViewModel } from './useStartUpViewModel';
import { COLORS } from './../../../constants/colors';

const slides = [
  {
    id: 'welcome',
    image: require('../../../../assets/images/logo2-nobg.png'),
    tag: 'SPEECH & COMMUNICATION',
    title: 'Your voice,',
    highlightedTitle: 'perfectly understood',
    description: 'Breaking communication barriers for those with speech differences through advanced AI technology.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'understand',
    image: require('../../../../assets/images/slide_speech.png'),
    tag: 'AI-POWERED',
    title: 'We Understand',
    highlightedTitle: 'Every Voice',
    description: 'Advanced AI that accurately interprets nasal and lisp speech patterns with remarkable precision.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbTeal,
  },
  {
    id: 'correction',
    image: require('../../../../assets/images/slide_correction.png'),
    tag: 'SMART ENGINE',
    title: 'Smart Correction,',
    highlightedTitle: 'Naturally',
    description: 'Intelligent auto-correction powered by contextual understanding for clearer communication.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'translation',
    image: require('../../../../assets/images/slide_translation.png'),
    tag: 'MULTILINGUAL',
    title: 'Real-time',
    highlightedTitle: 'Translation',
    description: 'Seamless English ↔ Tagalog translation in seconds — talk naturally in either language.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbSand,
  },
  {
    id: 'voice',
    image: require('../../../../assets/images/slide_voice.png'),
    tag: 'VOICE ENGINE',
    title: 'Natural Voice,',
    highlightedTitle: 'Crystal Clear',
    description: 'Crystal-clear, natural-sounding speech output in both English and Tagalog.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbTeal,
  },
];

const orbConfigs = [
  { size: 90, color: `${COLORS.orbBlue}40`, xFn: () => -20,        yFn: (h: number) => h * 0.08, delay: 300,  duration: 4000, driftX: 20,  driftY: 15 },
  { size: 60, color: `${COLORS.orbTeal}35`, xFn: (w: number) => w - 70, yFn: (h: number) => h * 0.15, delay: 600,  duration: 3500, driftX: -15, driftY: 18 },
  { size: 45, color: `${COLORS.orbSand}50`, xFn: (w: number) => w * 0.3, yFn: (h: number) => h * 0.04, delay: 900,  duration: 5000, driftX: 12,  driftY: 10 },
  { size: 35, color: `${COLORS.tealLight}20`, xFn: (w: number) => w * 0.6, yFn: (h: number) => h * 0.65, delay: 1200, duration: 4500, driftX: -10, driftY: 12 },
];

const StartUpScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const vm = useStartUpViewModel(navigation, slides.length);
  
  return <StartUpView vm={vm} slides={slides} orbConfigs={orbConfigs} />;
};

export default StartUpScreen;
