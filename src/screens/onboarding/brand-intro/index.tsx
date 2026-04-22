import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { BrandIntroView } from './BrandIntroView';
import { useBrandIntroViewModel } from './useBrandIntroViewModel';

/**
 * Brand Intro Screen Entry Point.
 */
const BrandIntroScreen: React.FC = () => {
    const navigation = useNavigation<any>();
    const vm = useBrandIntroViewModel(navigation);
    
    return <BrandIntroView vm={vm} />;
};

export default BrandIntroScreen;
