import React from 'react';
import { StartUpView } from './StartUpView';
import { useStartUpViewModel } from './useStartUpViewModel';
import { COLORS } from './../../../constants/colors';

const slides = [
  {
    id: 'welcome',
    image: require('../../../../assets/images/icon-blue.png'),
    tag: 'COMMUNICATION BRIDGE',
    title: 'Connect &',
    highlightedTitle: 'Communicate',
    description: 'A dedicated tool designed to support individuals with cleft conditions in daily communication.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'understand',
    image: require('../../../../assets/images/slide_speech.png'),
    tag: 'SPEECH RECOGNITION',
    title: 'Tailored',
    highlightedTitle: 'Recognition',
    description: 'Utilizing a specialized speech model trained on cleft speech patterns to transcribe your words more accurately.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbTeal,
  },
  {
    id: 'correction',
    image: require('../../../../assets/images/slide_correction.png'),
    tag: 'BILINGUAL',
    title: 'English &',
    highlightedTitle: 'Tagalog',
    description: 'Communicate comfortably in either English or Tagalog, tailored for your local context.',
    accentColor: COLORS.royalBlue,
    orbTint: COLORS.orbBlue,
  },
  {
    id: 'translation',
    image: require('../../../../assets/images/slide_translation.png'),
    tag: 'TRANSLATION',
    title: 'Instant',
    highlightedTitle: 'Translation',
    description: 'Seamlessly translate text and speech between English and Tagalog to connect with anyone.',
    accentColor: COLORS.teal,
    orbTint: COLORS.orbSand,
  },
  {
    id: 'voice',
    image: require('../../../../assets/images/slide_voice.png'),
    tag: 'AUDIO OUTPUT',
    title: 'Clear Audio',
    highlightedTitle: 'Output',
    description: 'Convert your transcribed or typed messages into clear, natural-sounding audio.',
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
