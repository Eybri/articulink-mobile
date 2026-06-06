import React, { useState, useEffect, useRef } from 'react';
import { Animated, Platform } from 'react-native';
import { XStack, YStack, SizableText } from 'tamagui';
import { CheckCircle, AlertTriangle, Info } from '@tamagui/lucide-icons';
import { COLORS } from '../constants/colors';

type ToastType = 'success' | 'error' | 'info';

export interface ToastOptions {
  message: string;
  type?: ToastType;
  duration?: number;
}

let globalToastRef: any = null;

export const Toast = {
  show: (options: ToastOptions) => {
    globalToastRef?.show(options);
  },
  hide: () => {
    globalToastRef?.hide();
  }
};

export const ToastNotification = () => {
  const [visible, setVisible] = useState(false);
  const [config, setConfig] = useState<ToastOptions>({ message: '', type: 'info' });
  const translateY = useRef(new Animated.Value(-150)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    globalToastRef = {
      show: (options: ToastOptions) => {
        if (timerRef.current) clearTimeout(timerRef.current);
        
        setConfig({ type: 'info', duration: 3000, ...options });
        setVisible(true);
        
        Animated.spring(translateY, {
          toValue: Platform.OS === 'ios' ? 60 : 45,
          useNativeDriver: true,
          tension: 40,
          friction: 8
        }).start();

        timerRef.current = setTimeout(() => {
          globalToastRef.hide();
        }, options.duration || 3000);
      },
      hide: () => {
        Animated.timing(translateY, {
          toValue: -150,
          duration: 300,
          useNativeDriver: true
        }).start(() => {
          setVisible(false);
        });
      }
    };

    return () => {
      globalToastRef = null;
    };
  }, []);


  const getBgColor = () => {
    switch (config.type) {
      case 'success': return '#10B981'; // Vibrant Green
      case 'error': return '#EF4444'; // Vibrant Red
      case 'info':
      default: return COLORS.royalBlue || '#3B82F6'; // Brand Blue
    }
  };

  const getIcon = () => {
    switch (config.type) {
      case 'success': return <CheckCircle size={20} color="white" strokeWidth={2.5} />;
      case 'error': return <AlertTriangle size={20} color="white" strokeWidth={2.5} />;
      case 'info':
      default: return <Info size={20} color="white" strokeWidth={2.5} />;
    }
  };

  return (
    <Animated.View
      style={{
        position: 'absolute',
        top: 0,
        left: 20,
        right: 20,
        zIndex: 99999,
        transform: [{ translateY }],
      }}
      pointerEvents="box-none"
    >
      <XStack
        bg={getBgColor()}
        br={100}
        py="$2.5"
        px="$3.5"
        ai="center"
        gap="$3"
        elevation={8}
        shadowColor={getBgColor()}
        shadowOffset={{ width: 0, height: 6 }}
        shadowOpacity={0.35}
        shadowRadius={12}
      >
        <YStack bg="rgba(255,255,255,0.2)" br={100} p="$1.5">
            {getIcon()}
        </YStack>
        <YStack f={1}>
          <SizableText fow="700" size="$3" color="white" ls={0.5}>
            {config.message}
          </SizableText>
        </YStack>
      </XStack>
    </Animated.View>
  );
};
